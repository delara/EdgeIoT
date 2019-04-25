import json
from digi.xbee.io import IOLine
class Sensor:
    
    IOLines = {
            0:IOLine.DIO0_AD0,
            1:IOLine.DIO1_AD1,
            2:IOLine.DIO2_AD2,
            3:IOLine.DIO3_AD3,
            4:IOLine.DIO4_AD4,
            5:IOLine.DIO5_AD5,
            6:IOLine.DIO6,
            7:IOLine.DIO7,
            8:IOLine.DIO8,
            9:IOLine.DIO9,
            10:IOLine.DIO10_PWM0,
            11:IOLine.DIO11_PWM1,
            12:IOLine.DIO12,
            13:IOLine.DIO13,
            14:IOLine.DIO14,
            15:IOLine.DIO15,
            16:IOLine.DIO16,
            17:IOLine.DIO17,
            18:IOLine.DIO18,
            19:IOLine.DIO19
            }

    def __init__(self,name,XBeeDevice,IOLine):
        self.name = name
        self.XBeeDevice = XBeeDevice
        
        self.IOLine = self.IOLines[IOLine]
        self.sensorId = "%s_%s" %(str(self.XBeeDevice.get_64bit_addr()), self.IOLine)
        self.value = None

    def getValueRemotly(self):
        pass 

    def getValue(self):
       return self.value           

    def setValue(self,value,time):
        self.value = {"value":value, "time": time}

    def __dict__(self):
        return {"name":self.name, "sensorId":self.sensorId}
