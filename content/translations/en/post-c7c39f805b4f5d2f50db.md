---
title: >-
  Operating Systems (Part 3): The Development and Classification of Operating
  Systems
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

The development of operating systems mainly includes the following stages and classifications:

<img src='\images\posts\操作系统-操作系统的分类.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

## Manual Operation Stage

In the manual operation stage of operating systems, because a large amount of time was consumed loading, removing, reading, and writing paper tape, the computer's computational efficiency was extremely low.

<img src='\images\posts\操作系统-手工操作.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

The main drawback of the manual operation stage was that **users monopolized the entire machine, and the speed mismatch between humans and machines led to extremely low resource utilization**.

## Batch Processing Stage

### Single-Program Batch Processing System

Offline input/output technology was introduced (implemented with a peripheral machine plus magnetic tape), and a supervisor program was responsible for controlling job input and output.

<img src='\images\posts\操作系统-单道批处理示意.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Users stored programs in advance on magnetic tape via a peripheral machine; magnetic tape read/write speeds were much faster than paper tape.

<img src='\images\posts\操作系统-单道批处理.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

Main advantage: it alleviated the speed mismatch between humans and machines to some extent, and resource utilization improved somewhat.

Main drawback: **only one program could run in memory**, and the next program could only be loaded after that program finished running. **The CPU spent a large amount of time idle waiting for I/O to complete**, so resource utilization remained low.

### Multiprogrammed Batch Processing System

Multiple programs were read into memory at a time; at this point the operating system was officially born, used to support the concurrent execution of multiple programs.

<img src='\images\posts\操作系统-多道批处理.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

Main advantage: multiple programs execute **concurrently** and **share** computer resources. **Resource utilization improved significantly**, the CPU and other resources could better remain "busy", and system throughput increased.

Main drawback: long user response time, and **no human-computer interaction capability** (after users submit their jobs, they can only wait for the computer to finish processing and cannot control their job execution in the meantime. For example, they cannot debug programs or enter parameters while a program is running).

## Time-Sharing Operating System

Computers running time-sharing operating systems **take turns serving each user/job** in units of **time slices**, and each user can interact with the computer through a terminal.

<img src='\images\posts\操作系统-分时操作系统示意.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Main advantage: user requests can be responded to immediately, **solving the human-computer interaction problem**. Multiple users are allowed to use one computer at the same time, and users' operations on the computer are independent of one another, so they do not perceive each other's presence.

Main drawback: **it cannot prioritize some urgent tasks**. The operating system is completely fair to every user/job, cyclically serving each user/job for one time slice without distinguishing the urgency of tasks.

## Real-Time Operating System

Main advantage: it can prioritize responding to some urgent tasks, and certain urgent tasks do not need to queue for a time slice.

Under the control of a real-time operating system, the computer system processes external signals promptly upon receiving them and **must finish processing events within strict time limits**. The main characteristics of real-time operating systems are **timeliness and reliability**.

Real-time operating systems mainly include hard real-time systems and soft real-time systems.

    1. 硬实时系统必须在绝对严格的规定时间内完成处理（如导弹控制系统、自动驾驶系统）；
    2. 软实时系统能接收偶尔违反时间规定（如抢票系统）。

## Other Operating Systems

Network operating system: it emerged along with the development of computer networking and can organically connect the computers in a network, **enabling functions such as data transmission, sharing of various resources in the network (such as file sharing), and communication between computers**. (For example, Windows NT is a typical network operating system, and website servers can use it.)

Distributed operating system: its main characteristics are **distribution and parallelism**. The computers in the system have equal status, and **any work can be distributed across these computers and completed by them in parallel and collaboratively**.

Personal computer operating system: such as Windows XP and Mac OS, convenient for personal use.
