---
layout: post
featured: true
title: 使用ChatGPT控制Arduino设备
description: 本文介绍了ChatGPT与外部系统集成的一种方法，通过ChatGPT作为控制器实现对Arduino设备的控制，以探索自然语言命令控制家庭设备的可能性及智能家庭设备的发展方向。
date: 2023-04-24 00:00:00 +0800
image: https://www.bing.com/th?id=OHR.LittleDuckling_ZH-CN2922471258_1920x1080.jpg
tags:
- ChatGPT
- Arduino
- 智能家庭
---

1. 目录
{:toc}

这篇博客中将介绍如何使用ChatGPT来控制Arduino设备。ChatGPT是由OpenAI开发的一种自然语言处理模型，其强大的功能引发了很大的讨论。本文介绍了ChatGPT与外部系统集成的一种方法，通过ChatGPT作为控制器实现对Arduino设备的控制，以探索自然语言命令控制家庭设备的可能性及智能家庭设备的发展方向。

这篇博客的代码公开在我的github仓库，[点此链接](https://github.com/MortalreminderPT/HomeGPT-Intelligent-Home-Assistant)传送至该项目。

## ChatGPT接入

### Prompt编写与测试

我们期望ChatGPT以json格式输出命令实现对设备的控制，因此首先需要编写一个合适的提示（prompt），用于告诉ChatGPT我们的需求。在这个提示中，我们应该明确表达我们希望ChatGPT理解并回答的问题，如打开/关闭LED灯、控制电机转速等。经过数次测试之后，我们使用python代码整合了我们的全部需求，

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
    prompt = f'As an Intelligent Assistant you need to rely on my words to determine what to do with some of devices.\n' \
             f'{text}\n' \
             f'your reply contain a list with json [{{"device":"device_1","param":0}}] only from these devices: {possible_device}' \
             f' and only write json list without any discourse.'
    return prompt
```
{% endraw %}

在ChatGPT官网测试该提示词，发现ChatGPT可以正确理解我们的需求并做出回应。

<img src='\images\posts\gpt1.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

此时，我们相信ChatGPT可以集成到我们的项目中。

### OpenAI API接入

OpenAI提供了官方API，以实现通过发送请求与ChatGPT进行实时交互。

首先，我们需要获得OpenAI API的访问密钥。在OpenAI的开发者门户网站上可以注册一个账户并获取API密钥。将API密钥保存在安全的地方，因为它将用于与OpenAI API进行通信。

接下来，我们可以通过引入OpenAI API包来实现与ChatGPT的交互，这个过程仍然被放在了一个函数中：

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

执行代码并观察输出结果，发现我们成功与ChatGPT完成交互。

```bash
In: As an Intelligent Assistant you need to rely on my words to determine what to do with some of devices.
我很冷，你可以帮我些什么吗
your reply contain a list with json [{"device":"device_1","param":0}] only from these devices: [{'light': '0 close,1 open'}, {'air-conditioner': '0 close,1 open'}, {'curtain': '0 close,1 open'}] and only write json list without any discourse.

Out: [{"device":"air-conditioner","param":1}]
```

## 基于Flask搭建服务器
在上一部分中，我们完成了与ChatGPT的对话和集成。为了便于用户的使用及与Arduino的交互，我们将使用Flask框架搭建一个服务器，以通过网络实现交互。

### Flask框架搭建
Flask是一个轻量级的Python Web框架，非常适合用于构建简单的Web应用程序。我们将使用Flask来搭建一个简单的服务器，以接收用户或Arduino的请求。

首先，我们需要安装Flask。可以使用pip命令来安装Flask：
```bash
pip install flask
```

随后创建Flask主文件：

```python
from flask import Flask
import flask_restful as restful
app = Flask(__name__)
api = restful.Api(app, default_mediatype="application/json")
if __name__ == '__main__':
    app.run()
```

此时RESTful风格Flask框架已经搭建完成，我们需要为其添加用户及Arduino交互接口。
### 添加用户API
定义一个用户API文件order.py，用于向服务器发送请求并获取响应。核心代码如下所示：
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

        prompt=generate_prompt(text=text_dict['text'])
        reply=get_reply(prompt=prompt,
                        mask=False,
                        mask_reply=mask_reply)
        update_state=match_json(text=reply)
        return device_states.update(update_state)
```

随后我们需要在主文件中注册API文件：

```python
api.add_resource(OrderApi, '/')
```

此时用户可以通过POST请求实现对Arduino设备状态的控制。
### Arduino API

Arduino设备主要工作内容为读取当前设备工作状态并做出对应调整，因此只需编写简单GET请求响应：
```python
class ArduinoApi(Resource):
    def get(self):
        return device_states.get()
```

同样在主文件中注册API文件：

```python
api.add_resource(ArduinoApi, '/arduino')
```

通过Postman测试，发现可以服务器已经可以正常工作。

<img src='\images\posts\gpt2.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

## 使用MongoDB存储设备状态

为了防止停电等因素对设备开关记忆的影响，我们使用数据库对设备状态进行持久化。MongoDB作为一种基于键值对的通用NoSQL数据库，非常适合实现这个需求。

### MongoDB数据库结构
在我们开始之前，我们需要定义设备状态的数据结构。在这个例子中，我们假设我们的设备有一个LED灯，可以打开或关闭。我们可以使用以下JSON格式来表示设备状态：

```json
{"device":"light","param":1.0}
```

在上面的示例中，device是设备的唯一标识符，param表示LED灯的状态。

### Flask接入MongoDB
为了与MongoDB进行交互，我们将使用MongoDB的官方Python驱动程序pymongo。我们需要先安装它：
```bash
pip install pymongo
```
接下来，我们需要在Flask应用程序中添加与MongoDB的连接和数据访问逻辑。

在app.py文件中添加pymongo库：
```python
from flask_pymongo import PyMongo
mongo = PyMongo(app, uri=config.MONGO_URI)
```

### 与数据库的交互及数据缓存

我们编写一个DeviceStates类与数据库进行交互，为了提升设备响应的即时性，我们还可以给数据库添加缓存。

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

## 编写QQbot实现QQ平台控制
本节编写了一个简单的QQbot，用户可以在QQ平台与QQbot简单对话，完成对Arduino设备状态的控制。

安装botpy包：

```bash
pip install botpy
```

为QQbot编写交互代码如下：

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

此时，我们可以在QQ频道与QQbot对话，以实现对Arduino设备的控制

<img src='\images\posts\gpt3.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

## Arduino状态控制
在服务器及交互平台搭建完成后，本部分展示了Arduino设备代码实现，其原理主要为发出GET请求获取设备状态，随后通过字符串匹配控制设备的状态。

### Arduino设备代码实现

**这部分代码是由我的队友编写的，他速成了Arduino代码编写并实现了设备状态控制，感谢他在该项目的贡献。**

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

## 结果展示

如图所示，在向QQbot提出需求后，ChatGPT成功接收并理解了我们的需求并将其转化为指令，Arduino设备状态也随之发生改变。

<img src='\images\posts\gpt4.jpg' style="
  display: block;
  margin-left: auto;
  margin-right: auto; 
  zoom:50%;" />

ChatGPT在此次实验中的强大作用向我们展示了大语言模型在智能家庭的重大潜力。包括但不限于识别并发掘深度需求，多模态智能家居控制，个性化用户体验等多种潜在方向。

同样，该项应用也存在隐私保护，数据安全等问题，需要人们的进一步思考和解决。
