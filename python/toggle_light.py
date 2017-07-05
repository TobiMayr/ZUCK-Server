#! python

from yeelight import Bulb
from random import random
bulb = Bulb("192.168.137.199")
bulb.toggle()
bulb.set_rgb(random()*255, random()*255, random()*255)
