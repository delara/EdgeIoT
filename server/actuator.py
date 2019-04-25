from digi.xbee.devices import XBeeDevice, RemoteXBeeDevice, XBee64BitAddress
from digi.xbee.io import IOMode

class Actuator:

    def __init__(self,name, actuatorKey, coordinator):
        self.actuatorId = actuatorKey
        self.coordinator = coordinator
        self.name= name
        self.plug = RemoteXBeeDevice(coordinator,XBee64BitAddress.from_hex_string(actuatorKey))
    
    def setState(self, state):
        if state == "ON":
            self.plug.set_parameter("D4",bytearray([4]))
        if state == "OFF":
            self.plug.set_parameter("D4",bytearray([5])) 


    def __dict__(self):
        return {"name":self.name,"actuatorId": self.actuatorId}
