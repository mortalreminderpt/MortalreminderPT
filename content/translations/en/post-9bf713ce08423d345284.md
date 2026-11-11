---
layout: post 
title: Apollo Configuration Center (Part 7) - Spring Boot Integration and Distributed Deployment
description: 
date: 2023-11-24 13:29:57 +0800 
image: /images/covers/apollo-cover.jpg
tags:
- configuration
- configuration center
- Apollo
category: ['Apollo']
---

1. Table of Contents
{:toc}

## Integrating Apollo with Spring Boot

Configuration for the `account-service` project's `application.yml`:

```yml
app:
    id: account-service
apollo:
    meta: http://localhost:8080
    bootstrap:
        enabled: true
        namespaces: application,micro_service.spring-boot-http,spring-rocketmq,micro_service.spring-boot-druid
```

Accessing configurations using annotations:

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

When accessing the URL `http://localhost:10089/account-service/sms`, the result is as follows:

```
smsEnable: true
```

At this point, the Apollo client has been successfully integrated into the Spring Boot project.

## Distributed Deployment Guide

The [Distributed Deployment Guide](https://www.apolloconfig.com/#/zh/deployment/distributed-deployment-guide) explains how to compile, package, and deploy the Apollo Configuration Center in a distributed manner, enabling deployment in development, testing, and production environments.