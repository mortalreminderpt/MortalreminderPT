---
layout: post
featured: true
title: Using ChatGPT to Control Arduino Devices
description: This post explores a method to integrate ChatGPT with external systems, leveraging ChatGPT as a controller to manage Arduino devices, thus exploring the potential of natural language commands to control home devices and the development direction of smart home technology.
date: 2023-04-24 00:00:00 +0800
image: https://www.bing.com/th?id=OHR.LittleDuckling_ZH-CN2922471258_1920x1080.jpg
tags:
- ChatGPT
- Arduino
- Smart Home
---

1. Table of Contents
{:toc}

In this blog post, we will introduce how to use ChatGPT to control Arduino devices. ChatGPT, developed by OpenAI, is a powerful natural language processing model that has sparked significant discussion. This post outlines a method to integrate ChatGPT with external systems, leveraging it as a controller to manage Arduino devices. This approach explores the potential of using natural language commands to control home devices and the future development direction of smart home technology.

The code for this blog is publicly available in my GitHub repository, [click here](https://github.com/MortalreminderPT/HomeGPT-Intelligent-Home-Assistant) to access the project.

## Integrating ChatGPT

### Prompt Creation and Testing

We expect ChatGPT to output commands in JSON format to control the devices. Therefore, we need to create an appropriate prompt to instruct ChatGPT on our requirements. In this prompt, we should clearly express the questions we want ChatGPT to understand and respond to, such as turning on/off an LED light, controlling motor speed, etc. After several tests, we integrated all our requirements using the following Python code:

{% raw %}
```python
def generate_prompt(text):
    possible_device = [
        {
            'light':'0 close,1 open'
        },
        {
            'air-conditioner':'0 close,1 open'
        },
        {
            'curtain': '0 close,1 open'
        }
    ]
    prompt = f'As an Intelligent Assistant you need to rely on my words to determine what to do with some devices.\n' \
             f'{text}\n' \
             f'your reply should contain a list with JSON [{{"device":"device_1","param":0}}] only from these devices: {possible_device}' \
             f' and only write JSON list without any discourse.'
    return prompt
```
{% endraw %}

Testing this prompt on the official ChatGPT website, we found that ChatGPT can correctly understand our requirements and respond accordingly.

<img src='\images\posts\gpt1.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

At this point, we believe that ChatGPT can be integrated into our project.

### Integrating OpenAI API

OpenAI provides an official API to interact with ChatGPT in real-time by sending requests.

First, we need to obtain an OpenAI API key. You can register an account and get the API key on OpenAI's developer portal. Keep the API key secure, as it will be used to communicate with the OpenAI API.

Next, we can integrate the OpenAI API package to interact with ChatGPT, which is encapsulated in a function:

```python
def get_reply(prompt, mask = True, mask_reply = None):
    if mask:
        return json.dumps(mask_reply)
    with open('OPENAI_API_KEY') as key:
        openai.api_key = key.read().rstrip('\n')
        completions = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            n=1,
            max_tokens=100
        )
        message = completions.choices[0].message.content
        return message
```

Running the code and observing the output, we successfully interacted with ChatGPT.

```bash
In: As an Intelligent Assistant you need to rely on my words to determine what to do with some devices.
我很冷，你可以帮我些什么吗
your reply should contain a list with JSON [{"device":"device_1","param":0}] only from these devices: [{'light': '0 close,1 open'}, {'air-conditioner': '0 close,1 open'}, {'curtain': '0 close,1 open'}] and only write JSON list without any discourse.

Out: [{"device":"air-conditioner","param":1}]
```

## Building a Server with Flask
In the previous section, we completed the interaction and integration with ChatGPT. To facilitate user interaction and interaction with Arduino, we will build a server using the Flask framework to enable web-based interaction.

### Setting Up Flask
Flask is a lightweight Python web framework, ideal for building simple web applications. We will use Flask to set up a simple server to receive requests from users or Arduino.

First, we need to install Flask using pip:

```bash
pip install flask
```

Then, create the main Flask file:

```python
from flask import Flask
import flask_restful as restful
app = Flask(__name__)
api = restful.Api(app, default_mediatype="application/json")
if __name__ == '__main__':
    app.run()
```

At this point, we have set up a RESTful Flask framework and need to add user and Arduino interaction interfaces.

### Adding User API
Define a user API file `order.py` to send requests to the server and receive responses. The core code is as follows:

```python
class OrderApi(Resource):
    def post(self):
        text_dict = RequestParser()\
            .add_argument('text', type=str, location='json', required=True) \
            .add_argument('device', type=str, location='json', required=False)\
            .add_argument('param', type=float, location='json', required=False)\
            .parse_args()
            
        mask_reply = []
        if text_dict['device'] and text_dict['param'] is not None:
            mask_reply.append({'device':text_dict['device'], 'param':text_dict['param']})

        prompt = generate_prompt(text=text_dict['text'])
        reply = get_reply(prompt=prompt,
                        mask=False,
                        mask_reply=mask_reply)
        update_state = match_json(text=reply)
        return device_states.update(update_state)
```

Then, register the API file in the main file:

```python
api.add_resource(OrderApi, '/')
```

Users can now control the status of Arduino devices via POST requests.

### Arduino API

Arduino devices mainly work by reading the current device status and making corresponding adjustments, so we need to write a simple GET request response:

```python
class ArduinoApi(Resource):
    def get(self):
        return device_states.get()
```

Similarly, register the API file in the main file:

```python
api.add_resource(ArduinoApi, '/arduino')
```

Testing with Postman, we found that the server works correctly.

<img src='\images\posts\gpt2.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

## Storing Device States with MongoDB

To prevent power outages and other factors from affecting device memory, we use a database to persist device states. MongoDB, a general-purpose NoSQL database based on key-value pairs, is well-suited for this need.

### MongoDB Database Structure
Before we begin, we need to define the data structure for device states. In this example, we assume our device has an LED light that can be turned on or off. We can use the following JSON format to represent the device state:

```json
{"device":"light","param":1.0}
```

In the example above, `device` is the unique identifier of the device, and `param` represents the LED light's state.

### Integrating MongoDB with Flask
To interact with MongoDB, we use the official Python driver `pymongo`. We need to install it:

```bash
pip install pymongo
```

Next, add the MongoDB connection and data access logic to the Flask application.

In the `app.py` file, add the `pymongo` library:

```python
from flask_pymongo import PyMongo
mongo = PyMongo(app, uri=config.MONGO_URI)
```

### Interacting with the Database and Data Caching

We write a `DeviceStates` class to interact with the database. To enhance device response immediacy, we can add caching to the database.

```python
class DeviceStates(object):
    def __init__(self):
        self.state = {}
        self._flash = False
        pass

    def get(self):
        if not self._flash:
            self._flash = True
            for device_state in list(devices.find(projection = {'_id': 0})):
                self.state[device_state['device']] = device_state
        return self.state

    def update(self, update_dict:DeviceState):
        for update_device, update_state in update_dict.items():
            devices.update_one({f'_id':update_device}, {'$set':{**update_state}}, upsert=True)
            self.state[update_device] = update_state
        return self.get()

    def delete(self, all = True):
        self.state = {}
        return devices.delete_many({}).deleted_count
```

## Writing a QQbot to Control Devices via QQ

This section demonstrates writing a simple QQbot, allowing users to interact with the QQbot on the QQ platform to control the state of Arduino devices.

Install the `botpy` package:

```bash
pip install botpy
```

Write the interaction code for the QQbot:

```python
import asyncio
import os



import botpy
import requests
from botpy import logging
from botpy.ext.cog_yaml import read
from botpy.message import Message

test_config = read(os.path.join(os.path.dirname(__file__), "config.yaml"))

_log = logging.get_logger()
headers = {
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json',
}

class MyClient(botpy.Client):
    async def on_ready(self):
        _log.info(f"robot 「{self.robot.name}」 on_ready!")
    async def on_at_message_create(self, message: Message):
        _log.info(message.author.avatar)
        if "sleep" in message.content:
            await asyncio.sleep(10)
        _log.info(message.author.username)
        url = test_config['server']
        import re
        text = re.sub('<.*?>', '', message.content)
        data = {
            'text': text,
            'device': 'light',
            'param': 1
        }
        response = requests.request("POST", url, headers=headers, json=data)
        await message.reply(content=f"{response.content.decode('unicode_escape')}")

if __name__ == "__main__":
    intents = botpy.Intents(public_guild_messages=True)
    client = MyClient(intents=intents)
    client.run(appid=test_config["appid"], token=test_config["token"])
```

Now, we can interact with the QQbot on the QQ channel to control Arduino devices.

<img src='\images\posts\gpt3.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

## Arduino State Control
After setting up the server and interaction platform, this section shows the implementation of Arduino device code. The main principle is to send a GET request to obtain the device state, then control the device state through string matching.

### Arduino Device Code Implementation

**This part of the code was written by my teammate, who quickly learned Arduino coding and implemented device state control. Thanks to him for his contribution to this project.**

```c
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
const char * ssid; //Enter your Wi-Fi SSID
const char * password; //Enter you Wi-Fi Password
int i = 0;
int check = 9;
int ledpin = 2;
String Payload = "";
define URL "http://localhost:5000/arduino"

void setup() {
    WiFi.mode(WIFI_STA);
    Serial.begin(115200);
    pinMode(ledpin, OUTPUT);
    digitalWrite(ledpin, 0);
    Serial.println("开始连接");
    WiFi.begin(ssid, password);
    Serial.print("正在连接到");
    Serial.print(ssid);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print("waiting for ");
        Serial.print(i++);
        Serial.println("s...");
    }
    Serial.println("");
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    WiFiClient tcpClient;
    HTTPClient httpClient;
    httpClient.begin(tcpClient, URL);
    Serial.print("URL: ");
    Serial.println(URL);
    int httpCode = httpClient.GET();
    Serial.print("Send GET request to URL: ");
    Serial.println(URL);
    if (httpCode == 200) {
        Payload = httpClient.getString();
        Serial.print("\r\nServer Respose Code: ");
        Serial.println(httpCode);
        Serial.println("Server Response Payload: ");
        Serial.println(Payload);
    } else {
        Serial.print("\r\nServer Respose Code: ");
        Serial.println(httpCode);
    }
    httpClient.end();
    StaticJsonDocument < 200 > doc;
    DeserializationError error = deserializeJson(doc, Payload);
    check = doc["light"]["param"];
    Serial.print(check);
    if (check == 1) {
        digitalWrite(ledpin, HIGH);
    }
    if (check == 0) {
        digitalWrite(ledpin, LOW);
    }
    Payload = "";
    delay(10000);
}
```

## Results

As shown in the image, after making a request to the QQbot, ChatGPT successfully received and understood our request, converting it into a command, which subsequently changed the state of the Arduino device.

<img src='\images\posts\gpt4.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

ChatGPT's powerful role in this experiment demonstrates the significant potential of large language models in smart home technology. This includes, but is not limited to, identifying and discovering deep needs, multimodal intelligent home control, personalized user experiences, and other potential directions.

However, this application also raises issues such as privacy protection and data security, requiring further consideration and resolution.
