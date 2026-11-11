---
title: 'Operating Systems (14): The Concept of Threads'
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Why Introduce Threads?

During the execution of a program, it may need to simultaneously perform multiple functions such as video chatting and file transfer, but a process is a single execution of a program, and these functions obviously cannot be realized through sequential processing by a single program.

Some processes may need to do many things "simultaneously", while traditional processes can only execute a series of programs serially. For this reason, "threads" were introduced to increase the degree of concurrency.

<img src='\images\posts\操作系统-进程-线程概念.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

A traditional process is the smallest unit of program execution flow; after the introduction of threads, a thread becomes the smallest unit of program execution flow.

Threads can be understood as "lightweight processes".

A **thread** is a **basic CPU execution unit** and also the **smallest unit of program execution flow**.
After the introduction of threads, not only can processes be concurrent with each other, but **threads within a process can also be concurrent with each other**, thereby further **improving the system's degree of concurrency**, so that a single process can also concurrently handle various tasks (such as QQ video, text chat, and file transfer).

After the introduction of threads, a **process** serves only as the **unit for allocating system resources other than the CPU** (such as printers and memory address spaces, which are all allocated to processes).

## Changes Brought by the Introduction of Threads

Resource allocation and scheduling:
- In the traditional process mechanism, a process is the basic unit of resource allocation and scheduling;
- After the introduction of threads, a process is the basic unit of resource allocation, and a thread is the basic unit of scheduling.

Concurrency:
- In the traditional process mechanism, concurrency is only possible between processes;
- After the introduction of threads, threads can also be concurrent with each other, improving the degree of concurrency.

System overhead:
- Traditional inter-process concurrency requires switching the process's running environment, resulting in significant system overhead;
- For inter-thread concurrency, if it is a thread switch within the same process, there is no need to switch the process environment, so the system overhead is small;
- After the introduction of threads, the system overhead caused by concurrency is reduced.

## Attributes of Threads

1. A thread is the unit of processor scheduling;
2. On multi-CPU computers, each thread can occupy a different CPU;
3. Each thread has a thread ID and a thread control block (TCB);
4. A thread also has three basic states: ready, blocked, and running;
5. A thread hardly owns any system resources;
6. Different threads in the same process share the process's resources;
7. Because they share the memory address space, communication between threads in the same process does not even require system intervention;
8. A thread switch within the same process does not cause a process switch;
9. A thread switch between different processes causes a process switch;
10. Switching threads within the same process incurs very little system overhead;
11. Switching processes incurs relatively large system overhead.
