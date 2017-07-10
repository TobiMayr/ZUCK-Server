#! python
import sys, json
ip = str(sys.argv[1])
name = str(sys.argv[2])
from yeelight import Bulb
from random import random
bulb = Bulb(ip)
bulb.set_name(name)
