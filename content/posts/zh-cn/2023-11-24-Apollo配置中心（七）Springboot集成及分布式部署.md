---
layout: post 
title: Apollo配置中心（七）Springboot集成及分布式部署
description:
date: 2023-11-24 13:29:57 +0800 
image: /images/covers/apollo-cover.jpg
tags:
- 配置
- 配置中心
- Apollo
category: ['Apollo']
---

1. 目录
{:toc}

## Springboot集成Apollo

account-service项目application.yml配置：

```yml
app:
    id: account-service
apollo:
    meta: http://localhost:8080
    bootstrap:
        enabled: true
        namespaces: application,micro_service.spring-boot-http,spring-rocketmq,micro_service.spring-boot-druid
```

通过注解读取配置：

```java
@RestController
public class AccountController {

    @Value("${sms.enable}")
    private Boolean smsEnable;

    @GetMapping("/hi")
    public String hi() {
        return "hi";
    }

    @GetMapping("/sms")
    public String getSmsConfig() {
        return "smsEnable: " + smsEnable;
    }

    @Value("${rocketmq.name-server}")
    private String mqNameServer;

    @Value("${rocketmq.producer.group}")
    private String mqProducerGroup;

    @GetMapping("/mq")
    public String getRocketMQConf() {
        return mqNameServer + ": " + mqProducerGroup;
    }

    @GetMapping("/db-url")
    public String getDBConfig(@Value("${spring.datasource.url}") String url) {
        return url;
    }
}
```

访问网址`http://localhost:10089/account-service/sms`，其结果如下

```
smsEnable: true
```

此时Apollo客户端已经成功集成在Springboot项目中。

## 分布式部署指南

[分布式部署指南](https://www.apolloconfig.com/#/zh/deployment/distributed-deployment-guide)介绍了如何按照分布式部署的方式编译、打包、部署Apollo配置中心，从而可以**在开发、测试、生产等环境**分别部署运行。
