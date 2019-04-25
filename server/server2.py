from digi.xbee.devices import XBeeDevice, RemoteXBeeDevice, XBee64BitAddress
from digi.xbee.io import IOLine
from aiohttp import web
import aiohttp_cors
import socketio
import time
import threading
import asyncio
import requests 
import json
from sensor import Sensor
from actuator import Actuator

sio = socketio.AsyncServer()
app = web.Application()
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
})
sio.attach(app)
routes = web.RouteTableDef()

# CORS and rotues setups
sensor_resource = cors.add(app.router.add_resource("/sensors"))
actuator_resource = cors.add(app.router.add_resource("/actuators"))
config_resource = cors.add(app.router.add_resource("/config"))
xbees = {}
sensors = {}
actuators = {}
config = {
        "post":{"url":"","active":False},
        "actuatorsConfig":{}} 

# create xbee modules
coordinator = XBeeDevice("/dev/tty.usbserial-AK05ZJEC",9600)
coordinator.open()
router1 = RemoteXBeeDevice(coordinator,XBee64BitAddress.from_hex_string("0013A200418739B4"))
router2 = RemoteXBeeDevice(coordinator,XBee64BitAddress.from_hex_string("0013A20041873715"))
# add xbee modules to xbee dic
xbees[str(coordinator.get_64bit_addr())] = coordinator
xbees[str(router1.get_64bit_addr())] = router1
xbees[str(router2.get_64bit_addr())] = router2
# http endpoints for UI
# create sensor
async def createSensor(request):
    data = await request.json()
    try:
        print(xbees[data['xbeeAddress']])
        xbeeAddress = str(xbees[data['xbeeAddress']].get_64bit_addr())
        IOLine = data['IOLine']
        sensorName = data['name']
        sensor = Sensor(sensorName,xbees[data['xbeeAddress']], int(IOLine))
        sensorId = sensor.sensorId
        sensors[sensorId] = sensor
        return web.json_response({'sensorId':sensorId})
    except Exception as e:
        print(e)
        raise web.HTTPBadRequest(body= 'Could not create the sensor: %s' % str(e))


cors.add(
        sensor_resource.add_route("POST", createSensor), {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600,
            )
        })


@routes.delete("/sensors/{sensorId}")
async def deleteSensor(request):
    sensorId = request.match_info['sensorId']
    try:
        del sensors[sensorId]
        return web.json_response({'sensorId':sensorId})
    except Exception as e:
        return web.json_response({'error':'Could not delete the sensor: %s' % str(e)})


@routes.get("/sensors")
async def getSensors(request):
    sensorsList = {}
    for key in sensors:
        sensorsList[key] = sensors[key].__dict__()

    return web.json_response({'sensors':json.dumps(sensorsList)},headers={"Access-Control-Allow-Origin":"*"})

# create actuators 
async def createActuator(request):
    data = await request.json()
    plugAddress = data['plugAddress']
    try:
        actuator = Actuator(data['name'],plugAddress, coordinator)
        actuatorId = plugAddress
        actuators[actuatorId] = actuator
        return web.json_response({'actuatorId':actuatorId})
    except Exception as e:
        raise web.HTTPBadRequest(body= 'Could not create the actuator: %s' % str(e))

cors.add(
        actuator_resource.add_route("POST", createActuator), {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600,
            )
        })




@routes.delete("/actuator/{actuatorId}")
async def deleteActuator(request):
    actuatorId = request.match_info['actuatorId']
    try:
        del actuators[actuatorId]
        return web.json_response({'actuatorId':actuatorId})
    except Exception as e:
        return web.json_response({'error':'Could not delete the actuator: %s' % str(e)})
@routes.get("/actuators")
async def getActuators(request):
    actuatorsList = {}
    for key in actuators:
        actuatorsList[key] = actuators[key].__dict__()
    return web.json_response({'actuators':json.dumps(actuatorsList)},headers={"Access-Control-Allow-Origin":"*"})

async def setConfig(request):
    global config
    data = await request.json()
    config = data
    return web.json_response({'config':config})

cors.add(
        config_resource.add_route("POST", setConfig), {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600,
            )
        })

@routes.get("/config")
async def getConfig(request):
    return web.json_response({'config':json.dumps(config)},headers={"Access-Control-Allow-Origin":"*"})

# send sensor data 
def sample_callback(io_sample, remote_xbee, send_time):
    for xbeeKey in xbees:
        for sensorKey in sensors:
            if sensors[sensorKey].XBeeDevice == remote_xbee:
                sensors[sensorKey].setValue(io_sample.get_analog_value(sensors[sensorKey].IOLine), send_time)
    
    for actuatorKey in config["actuatorsConfig"]:
        print('actuator: ', actuatorKey)
        try:
            if config["actuatorsConfig"][actuatorKey]["isAuto"]:
                if config["actuatorsConfig"][actuatorKey]["type"] == ">":
                    if sensors[config["actuatorsConfig"][actuatorKey]["sensorId"]].value['value'] > int(config["actuatorsConfig"][actuatorKey]["threshold"]):
                        actuators[actuatorKey].setState("ON")
                    if sensors[config["actuatorsConfig"][actuatorKey]["sensorId"]].value['value'] < int(config["actuatorsConfig"][actuatorKey]["threshold"]):
                        actuators[actuatorKey].setState("OFF")
                if config["actuatorsConfig"][actuatorKey]["type"] == "<":
                    if sensors[config["actuatorsConfig"][actuatorKey]["sensorId"]].value['value'] < int(config["actuatorsConfig"][actuatorKey]["threshold"]):
                        actuators[actuatorKey].setState("ON")
                if sensors[config["actuatorsConfig"][actuatorKey]["sensorId"]].value['value'] > int(config["actuatorsConfig"][actuatorKey]["threshold"]):
                        actuators[actuatorKey].setState("OFF")
        except Exception as e:
            print("Could not update actuator %s because %s" % (actuatorKey, str(e)) )

# socket for sending data
@sio.on("sensors_data")
async def sensorData(sid):
    sensorData = {}
    for sensorId in sensors:
        sensorData[sensors[sensorId].name] = sensors[sensorId].value
    await sio.emit("data",json.dumps(sensorData))
                                                                                                          

coordinator.add_io_sample_received_callback(sample_callback)






app.add_routes(routes)
def main():
    web.run_app(app,port='5000')

if __name__ == '__main__':
    main()
