---
layout: post 
title: 操作系统（十九）调度器（Scheduler）和闲逛进程
description: 进程（Process）是进程实体的运行过程，是系统进行资源分配和调度的一个独立单位。
date: 2022-04-24 10:26:52 +0800 
image: /images/covers/操作系统-cover2.png
tags:
- 操作系统
---

1. 目录
{:toc}

## 调度器/调度程序（Scheduler）

<img src='\images\posts\操作系统-进程-线程的三状态模型.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

在进程的三状态模型中，②、③过程由调度程序引起，调度程序决定：
- 让谁运行?——调度算法
- 运行多长时间?――时间片大小

什么事件会触发**调度程序**（进程的调度时机）：
- **创建新进程**；
- **进程退出**；
- 运行**进程阻塞**；
- **I/O中断**发生（可能唤醒某些阻塞进程）。

非抢占式和抢占式的区别：
- 非抢占式调度策略，只有**运行进程阻塞或退出**才触发调度程序工作；
- 抢占式调度策略，每个**时钟中断或k个时钟中断**会触发调度程序工作。

在不支持内核级线程的操作系统中，调度程序的处理对象是进程：

<img src='\images\posts\操作系统-调度器1.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

支持内核级线程的操作系统，调度程序的处理对象是内核线程：

<img src='\images\posts\操作系统-调度器2.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

## 闲逛进程

如果就绪队列中没有其他就绪进程时，调度程序会选中闲逛进程（Idle），即实际系统中，CPU不会空闲，即便不存在就绪进程，也会运行闲逛进程。

闲逛进程的特性：
- 优先级最低 
- 可以是0地址指令，占一个完整的指令周期（指令周期末尾例行检查中断）
- 能耗低

