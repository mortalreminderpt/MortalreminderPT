---
layout: post 
title: Apollo配置中心（二）Apollo简介
description:
date: 2023-11-23 10:13:25 +0800 
image: /images/covers/apollo-cover.jpg
tags:
- 配置
- 配置中心
- Apollo
category: ['Apollo']
---

1. 目录
{:toc}

## Apollo简介

<img src="https://cdn.jsdelivr.net/gh/apolloconfig/apollo@master/doc/images/logo/logo-simple.png" alt="apollo-logo" width="40%">

Apollo（[Github](https://github.com/ctripcorp/apollo) <code>&#124;</code> [官方文档](https://www.apolloconfig.com/#/zh/README)）是携程框架部门研发的分布式配置中心。
能够集中化管理应用的不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。

Apollo包括服务端和客户端两部分：

服务端基于Spring Boot和Spring Cloud开发，打包后可以直接运行，不需要额外安装Tomcat等应用容器。

Java客户端不依赖任何框架，能够运行于所有Java运行时环境，同时对Spring/Spring Boot环境也有较好的支持。

### 特性

基于配置的特殊性，所以Apollo从设计之初就立志于成为一个有治理能力的配置发布平台，目前提供了以下的特性：

1. 统一管理不同环境、不同集群的配置
  - Apollo提供了一个统一界面集中式管理不同环境（environment）、不同集群（cluster）、不同命名空间（namespace）的配置；
  - 同一份代码部署在不同的集群，可以有不同的配置，比如zookeeper的地址等；
  - 通过命名空间（namespace）可以很方便地支持多个不同应用共享同一份配置，同时还允许应用对共享的配置进行覆盖。
2. 配置修改实时生效（热发布）
  - 用户在Apollo修改完配置并发布后，客户端能实时接收到最新的配置，并通知到应用程序。
3. 版本发布管理
  - 所有的配置发布都有版本概念，从而可以方便地支持配置的回滚。
4. 灰度发布
  - 支持配置的灰度发布，比如点了发布后，只对部分应用实例生效，等观察一段时间没问题后再推给所有应用实例。
5. 权限管理、发布审核、操作审计
  - 应用和配置的管理都有完善的权限管理机制，对配置的管理还分为了编辑和发布两个环节，从而减少人为的错误；
  - 所有的操作都有审计日志，可以方便地追踪问题。
6. 客户端配置信息监控
  - 可以在界面上方便地看到配置在被哪些实例使用。
7. 提供Java和.Net原生客户端
  - 提供了Java和.Net的原生客户端，方便应用集成；
  - 支持Spring Placeholder, Annotation和Spring Boot的ConfigurationProperties，方便应用使用；
  - 同时提供了HTTP接口，非Java和.Net应用也可以方便地使用。
8. 提供开放平台API
  - Apollo自身提供了比较完善的统一配置管理界面，支持多环境、多数据中心配置管理、权限、流程治理等特性。不过Apollo出于通用性考虑，不会对配置的修改做过多限制，只要符合基本的格式就能保存，不会针对不同的配置值进行针对性的校验，如数据库用户名、密码，Redis服务地址等；
  - 对于这类应用配置，Apollo支持应用方通过开放平台API在Apollo进行配置的修改和发布，并且具备完善的授权和权限控制。
