---
layout: post 
title: Apollo Configuration Center (Part 6) - Server and Client Design
description:
date: 2023-11-24 11:54:12 +0800 
image: /images/covers/apollo-cover.jpg
tags:
- configuration
- configuration center
- Apollo
category: ['Apollo']
---

1. Table of Contents
{:toc}

## Server Design (Real-time Push Design after Configuration Release)

In a configuration center, one crucial function is to push configurations to clients in real-time after release. The following diagram briefly outlines the process of configuration release:

![Configuration Release Message Notification Design](/images/posts/apollo-release-message-notification-design.png)

1. Users perform configuration release operations in the Portal.
2. The Portal invokes Admin Service's interfaces for release operations.
3. After Admin Service releases the configuration, it sends ReleaseMessages to various Config Services.
4. Upon receiving ReleaseMessages, Config Services notify corresponding clients.

### Implementation of Sending ReleaseMessages

Admin Service needs to notify all Config Services of configuration releases, so Config Services can inform respective clients to fetch the latest configurations.

Conceptually, this is a typical messaging scenario where Admin Service acts as the producer of messages, and various Config Services act as consumers. Decoupling between Admin Service and Config Service is achieved through a messaging component (Message Queue).

Considering Apollo's practical usage scenarios and aiming to minimize external dependencies, Apollo implements a simple message queue using a database.

The implementation steps are as follows:

1. **After configuration release, Admin Service inserts a message record into the ReleaseMessage table**. The message content includes AppId, Cluster, and Namespace of the released configuration, as seen in DatabaseMessageSender.
2. **A thread in Config Service scans the ReleaseMessage table every second** to check for new message records, as seen in ReleaseMessageScanner.
3. If Config Service detects new message records, it **notifies all message listeners (ReleaseMessageListener)**, such as NotificationControllerV2. The registration process for message listeners is outlined in ConfigServiceAutoConfiguration.
4. Upon receiving AppId, Cluster, and Namespace of the released configuration, NotificationControllerV2 **notifies the corresponding clients**.

The diagram below illustrates this process:

![Apollo Release Message Design](/images/posts/apollo-release-message-design.png)

### Implementation of Client Notification by Config Service

How does NotificationControllerV2 notify clients upon configuration release?

The implementation is as follows:

1. The client initiates an HTTP request to the notifications/v2 endpoint of Config Service, which is NotificationControllerV2, as seen in RemoteConfigLongPollService.
2. **NotificationControllerV2 does not immediately return the result**. Instead, it suspends the request using Spring DeferredResult.
3. If there are no configuration releases of interest to the client within 60 seconds, NotificationControllerV2 returns an HTTP status code 304 to the client.
4. If there are configuration releases of interest to the client, NotificationControllerV2 calls the setResult method of DeferredResult, passing the namespace information with configuration changes. Simultaneously, the request returns immediately. Upon receiving the result, the client immediately requests Config Service for the latest configuration of that namespace.

## Client Design

The following diagram briefly outlines the implementation principle of the Apollo client:

![Apollo Client Architecture](/images/posts/apollo-client-architecture.png)

1. The client maintains a long connection with the server to receive configuration update pushes promptly (implemented through HTTP Long Polling).
2. The client also periodically fetches the latest configuration of the application from the Apollo configuration center server.
   - This is a fallback mechanism to prevent configuration from not being updated in case the push mechanism fails.
   - The client's periodic fetch reports the local version, so **in general, for periodic fetching operations, the server returns 304 - Not Modified**.
   - The default fetch frequency is once every 5 minutes, but the client can override this by specifying the System Property: apollo.refreshInterval at runtime, with the unit in minutes.
3. Upon receiving the latest configuration of the application from the Apollo configuration center server, the client saves it in memory.
4. The client caches the configuration obtained from the server in the local file system.
   - This allows the client to restore configurations from the local cache in cases of server unavailability or network issues.
5. Applications can retrieve the latest configurations from the Apollo client and subscribe to configuration update notifications.
