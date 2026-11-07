---
layout: post 
title: Apollo Configuration Center (Part 2) - Introduction to Apollo
description:
date: 2023-11-23 10:13:25 +0800 
image: /images/covers/apollo-cover.jpg
tags:
- configuration
- configuration center
- Apollo
category: ['Apollo']
---

1. Table of Contents
{:toc}

## Introduction to Apollo

<img src="https://cdn.jsdelivr.net/gh/apolloconfig/apollo@master/doc/images/logo/logo-simple.png" alt="apollo-logo" width="40%">

Apollo ([Github](https://github.com/ctripcorp/apollo) <code>&#124;</code> [Official Documentation](https://www.apolloconfig.com/#/zh/README)) is a distributed configuration center developed by the framework department of Ctrip. It allows centralized management of configurations for different environments and clusters of applications. After configuration modifications, changes can be pushed to the application end in real-time. Apollo also features standardized permissions and process governance, making it suitable for microservices configuration management scenarios.

Apollo consists of two parts: the server-side and the client-side.

The server-side is developed based on Spring Boot and Spring Cloud. After packaging, it can be directly run without the need for additional application containers such as Tomcat.

The Java client does not depend on any framework and can run in all Java runtime environments. It also has good support for Spring/Spring Boot environments.

### Features

Due to the nature of configuration-based operations, Apollo aspires to be a governance-capable configuration publishing platform from its inception. Currently, it provides the following features:

1. Unified management of configurations for different environments and clusters
   - Apollo provides a unified interface to centrally manage configurations for different environments, clusters, and namespaces.
   - The same code deployed in different clusters can have different configurations, such as zookeeper addresses.
   - Namespaces allow convenient support for multiple applications sharing the same configuration while allowing applications to override shared configurations.
2. Real-time configuration updates (hot deployment)
   - After users modify and publish configurations in Apollo, clients can receive the latest configurations in real-time and notify the application.
3. Version release management
   - All configuration releases have version concepts, making it easy to support configuration rollback.
4. Gray release
   - Supports gray release of configurations. For example, after clicking on release, it only takes effect on some application instances. After observing for a period without issues, it can be pushed to all application instances.
5. Permission management, release review, operation audit
   - There is a comprehensive permission management mechanism for managing applications and configurations, divided into editing and publishing stages to reduce human errors.
   - All operations are audited, making it easy to track issues.
6. Monitoring of client configuration information
   - Configuration usage by instances can be conveniently viewed on the interface.
7. Provides native Java and .Net clients
   - Provides native Java and .Net clients for easy application integration.
   - Supports Spring Placeholder, Annotation, and Spring Boot's ConfigurationProperties for easy application use.
   - Also provides HTTP interface for non-Java and .Net applications to use conveniently.
8. Provides an open platform API
   - Apollo itself provides a relatively complete unified configuration management interface, supporting features such as multi-environment, multi-data center configuration management, permissions, and process governance. However, Apollo, for generality considerations, does not impose excessive restrictions on configuration modifications. As long as it conforms to the basic format, it can be saved without targeted validation for different configuration values such as database usernames, passwords, Redis service addresses, etc.
   - For such application configurations, Apollo supports applications to modify and publish configurations in Apollo through open platform APIs, with complete authorization and permission control.