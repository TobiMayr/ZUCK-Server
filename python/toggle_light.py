#! python
import sys, json
ip = str(sys.argv[1])

from yeelight import Bulb
from random import random
bulb = Bulb(ip)
bulb.toggle()
bulb.set_rgb(255, 255, 255)
