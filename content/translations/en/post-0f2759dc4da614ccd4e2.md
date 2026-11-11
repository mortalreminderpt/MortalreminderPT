---
title: Operating Systems (1) Concepts and Functions of Operating Systems
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

## Statement
This series mainly references
[Wangdao Computer Science Postgraduate Entrance Exam Operating Systems](https://www.bilibili.com/video/BV1YE411D7nH)
and is, to be precise, the author's study notes. Readers may use the videos as the primary material and this article as a supplement for learning.

## Definition of an Operating System

Before understanding the definition of an operating system, for convenience we can abstract a computer system into a hierarchical structure containing the following four layers.


<img src='\images\posts\操作系统-计算机系统层次结构2.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

After clarifying the position of the operating system within a computer system, we can give the definition of an operating system.

An operating system (OS) refers to software that controls and **manages** the **hardware and software** resources of the entire computer system, and reasonably organizes and schedules the computer's work and resource allocation; it **provides users and other software with convenient interfaces and an environment**; it is the most basic **system software** in a computer system and the closest to the system hardware.

In Task Manager, you can see the operating system's management of application usage and its monitoring of hardware resources.

<img src='\images\posts\操作系统-任务管理器.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

## Functions and Goals of an Operating System

### As a Manager of System Resources

As a manager of system resources, the operating system provides four functions: **processor management, memory management, file management, and device management**. Its main goals include **security and efficiency**.

When using QQ for a video chat, the operating system's work mainly consists of four steps:

    1. 在各个文件夹中找到QQ安装的位置；（逐层打开文件夹，找到QQ的可执行文件存放位置。）
    2. 用户双击打开QQ；（将该程序相关数据放入内存，执行一个程序前**需要将该程序放到内存中**，才能被CPU处理。）
    3. QQ程序正常运行；（对应进程被处理机（CPU）处理。）
    4. 开始视频聊天。（需要将摄像头设备分配给进程。）

### Providing Convenient and Easy-to-Use Services to Upper Layers

#### Encapsulation Concept

The operating system encapsulates some ugly hardware functions into simple and easy-to-use services, so that users can use the computer more conveniently. Users do not need to care about the principles of the underlying hardware; they only need to issue commands to the operating system.

Hardware only understands binary instructions, such as: `01010111101110111010101`, and exposes an "ugly" and unfriendly interaction interface to the outside.

An operating system is installed on top of the hardware, and the operating system exposes a "beautiful" and friendly interaction interface to the outside.

#### Examples of Services Provided by the Operating System

Services provided by the operating system include graphical user interfaces, command interfaces, and program interfaces, among which command interfaces and program interfaces are collectively called user interfaces.

(1) Graphical User Interface (GUI)

Users can operate through intuitive graphical interfaces and no longer need to memorize complex commands and parameters.

    比如在Windows操作系统中，删除一个文件只需要把文件“拖拽”到回收站即可。

(2) Online Command Interface (Interactive Command Interface)

It consists of a set of keyboard operation commands and a command interpreter (the command interpreter checks the format of commands input by the user from the keyboard and completes command execution).

That is, the user says one sentence, and the system does one sentence.

(3) Offline Command Interface (Batch Command Interface)

It consists of a set of Job Control Language (JCL).

For example, batch files such as .bat and .sh. That is, the user says a bunch, and the system does a bunch.

(4) Program Interface

System calls can be made in programs to use the program interface. Ordinary users cannot directly use the program interface and can only use it indirectly through program code.

<img src='\images\posts\操作系统-系统调用.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

### As the Layer Closest to the Hardware

As the layer closest to the hardware, the operating system needs to realize **the expansion of the hardware machine**.

A computer without any software support is called a **bare machine**. An operating system installed on a bare machine can provide resource management functions and convenient service functions for users, transforming the bare machine into a machine with stronger functions and greater ease of use.

A machine covered with software is usually called an **extended machine**, also known as a **virtual machine**.

    类比于汽车，硬件级别的发动机和轮胎无法直接衔接，使用传动系统让发动机带动轮子，即完成了对原始硬件机器的拓展。

Expansion of the hardware machine by the operating system: reasonably organizing hardware such as the CPU, memory, disk, monitor, and keyboard, so that various hardware components can coordinate and cooperate with one another to realize more and more complex functions.


