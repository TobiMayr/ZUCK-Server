#! python
import sys, json
ip = str(sys.argv[1])

from yeelight import Bulb
from random import random
bulb = Bulb(ip)
bulb.set_rgb(0, 255, 0)
