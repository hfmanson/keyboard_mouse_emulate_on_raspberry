#!/usr/bin/python3
#
# thanhle Bluetooth keyboard/Mouse emulator DBUS Service
#

from __future__ import absolute_import, print_function
from optparse import OptionParser, make_option
import os
import sys
import uuid
import dbus
import random

from btk_device import BTKbDevice
from paho.mqtt import client as mqtt_client

broker = 'localhost'
port = 1883
topic = "bluetooth/keyboard"
# generate client ID with pub prefix randomly
#client_id = f'python-mqtt-{random.randint(0, 100)}'
client_id = 'python-mqtt-' + str(random.randint(0, 100))

def connect_mqtt() -> mqtt_client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client(client_id)
#    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client


def subscribe(client: mqtt_client):
    global device
    
    def on_message(client, userdata, msg):
#        print(f"Received `{msg.payload.hex()}` from `{msg.topic}` topic")
        print("Received " + msg.payload.hex() + " from " + msg.topic + " topic")
        device.send_string(msg.payload)
    client.subscribe(topic)
    client.on_message = on_message


def run():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()

# main routine
if __name__ == "__main__":
    # we an only run as root
    try:
        if not os.geteuid() == 0:
            sys.exit("Only root can run this script")

        device = BTKbDevice()
        device.listen()
        run()
    except KeyboardInterrupt:
        sys.exit()

