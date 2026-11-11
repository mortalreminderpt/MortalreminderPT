---
title: 'Operating Systems (Part 2): Characteristics of Operating Systems'
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

An operating system mainly has four characteristics: concurrency, sharing, virtualization, and asynchrony. Among them, concurrency and sharing are mutually conditional for each other's existence, and without concurrency and sharing, virtualization and asynchrony cannot be discussed. Therefore, **concurrency and sharing are the two most fundamental characteristics of an operating system**.

## Concurrency

**Concurrency**: refers to two or more events occurring within the same time interval. These events occur simultaneously from a macroscopic perspective, but alternately from a microscopic perspective.

**Parallelism**: refers to two or more events occurring simultaneously at the same moment.

**The concurrency of an operating system** refers to multiple programs running "simultaneously" in a computer system. From a macroscopic perspective, these programs run simultaneously, while from a microscopic perspective, they run alternately.

Operating systems emerged along with "multiprogramming technology". Therefore, operating systems and program concurrency were born together.

A single-core CPU can only execute one program at the same moment, so each program can only be executed concurrently; a multi-core CPU can execute multiple programs simultaneously at the same moment, so multiple programs can be executed in parallel.

The Intel 8th generation i3 processor is a 4-core CPU, meaning it can execute 4 programs in parallel. But even for a 4-core CPU, as long as more than 4 programs need to run "simultaneously", concurrency is still indispensable. Therefore, concurrency is a most fundamental characteristic of an operating system.

## Sharing
Sharing means resource sharing, which refers to the resources in the system being available for multiple concurrently executing processes in memory to use together.

Sharing mainly includes two sharing modes: mutually exclusive sharing and simultaneous sharing.

### Mutually Exclusive Sharing Mode
Some resources in the system, although they can be provided for multiple processes to use, **only allow one process to access the resource within a time period**.

For example, when using QQ and WeChat for video calls, the camera can only be allocated to one of the processes within the same time period.

### Simultaneous Sharing Mode
Some resources in the system **allow multiple processes to "simultaneously" access them within a time period**. However, the so-called "simultaneous" is often macroscopic, while microscopically, these processes may access the resource alternately (i.e., time-sharing).

For example, using QQ to send file A while using WeChat to send file B. Macroscopically, both sides are reading and sending files at the same time, indicating that both processes are accessing the hard disk resource and reading data from it. Microscopically, the two processes access the hard disk alternately.

## The Relationship Between Concurrency and Sharing
**Concurrency** refers to the simultaneous existence of multiple running programs in a computer system.

**Sharing** refers to the resources in the system being available for multiple concurrently executing processes in memory to use together.

For example, in the process of using QQ to send file A while using WeChat to send file B,

    1. 两个进程正在并发执行（并发性）
    2. 需要共享地访问硬盘资源（共享性）

If concurrency is lost, only one program is running in the system, and sharing loses its meaning of existence; if sharing is lost, QQ and WeChat cannot access the hard disk resource simultaneously, so they cannot send files simultaneously, and thus cannot be concurrent.

## Virtualization
Virtualization refers to transforming a physical entity into several logical counterparts. The physical entity (the former) actually exists, while the logical counterpart (the latter) is what the user perceives.

    GTA5需要4GB的运行内存，QQ需要256MB的内存，迅雷需要256MB的内存，网易云音乐需要256MB的内存......
    我的电脑:4GB内存
    问题:这些程序同时运行需要的内存远大于4GB，那么为什么它们还可以在我的电脑上同时运行呢?
    答:这是虚拟存储器技术。实际只有4GB的内存，在用户看来似乎远远大于4GB

Virtual memory technology uses **space-division multiplexing technology**.

    某用户在单核CPU的电脑上同时打开了6个应用程序。
    问题:既然一个程序需要被分配CPU才能正常执行，那么为什么单核CPU的电脑中能同时运行这么多个程序呢?
    答:这是虚拟处理器技术。实际上只有一个单核CPU，在用户看来似乎有6个CPU在同时为自己服务

Here, **time-division multiplexing technology** in virtualization technology is used. Microscopically, the processor serves each process alternately in various tiny time periods.

Obviously, if concurrency is lost, **only one program needs to run in the system within a time period, and then the significance of realizing virtualization is lost**. Therefore, **without concurrency, virtualization cannot be discussed**.

## Asynchrony
Asynchrony means that in a multiprogramming environment, multiple programs are allowed to execute concurrently, but due to limited resources, the execution of a process is not carried through to the end, but rather stops and starts, advancing at an unpredictable speed. This is the asynchrony of processes.

Because concurrently running programs compete to use system resources, and the resources in the system are limited, the execution of a process is not carried through to the end, but rather stops and starts, advancing at an unpredictable speed.

If concurrency is lost, that is, the system can only run each program serially, then the execution of each program will be carried through to the end. **Only when the system has concurrency is it possible to cause asynchrony**.
