---
title: Operating Systems (13) Inter-Process Communication
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Why does inter-process communication require operating system support?

Inter-Process Communication (**IPC**) refers to the exchange of data between two processes.

<img src='\images\posts\操作系统-进程-进程间通信.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

A process is the unit for allocating system resources (including memory address space), so the **memory address spaces** owned by **each process** are **independent of one another**.

To ensure safety, **one process cannot directly access the address space of another process**.

The main methods of inter-process communication are shared storage, message passing, and pipe communication.

## Shared Storage

The operating system opens up a **shared space** in memory, allowing the communicating processes to **access it mutually exclusively**.

<img src='\images\posts\操作系统-进程-共享存储.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

To avoid errors, each process's **access** to the shared space should be **mutually exclusive**.

Each process can use the synchronization and mutual exclusion tools provided by the operating system kernel (such as P and V operations).

Note: By "adding page table entries/segment table entries", the same shared memory region can be mapped into the address space of each process.

How to implement shared memory in Linux:

```c
int shm_open() ; // 通过shm_open系统调用，申请一片共享内存区
void * mmap(); //通过mmap系统调用，将共享内存区映射到进程自己的地址空间
```

Shared storage includes data-structure-based sharing and storage-region-based sharing:

**Data-structure-based** sharing: for example, the shared space can only hold an array of length 10. This sharing method is slow and has many restrictions; it is a **low-level communication** method.

**Storage-region-based** sharing: the operating system carves out a shared storage region in memory, and the form of the data and where it is stored are controlled by the communicating processes rather than by the operating system. This sharing method is very fast and is a **high-level communication** method.

## Message Passing

Data exchange between processes is based on **formatted messages (Message)**. Processes exchange data through the two **primitives** provided by the operating system: "send message" and "receive message".

<img src='\images\posts\操作系统-进程-消息传递.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Message passing includes direct communication and indirect communication.

### Direct Communication

Direct communication refers to a communication method in which the sending process must specify the ID of the receiving process.

Suppose there are two processes, P and Q. While process P is running, process P's address space holds a message `msg` that needs to be sent to process Q. We demonstrate the process of direct communication by describing the direct communication between the two processes.

<img src='\images\posts\操作系统-进程-直接通信.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

1. First, process Q's PCB is stored in the operating system kernel's address space, and **process Q's PCB** holds **process Q's message queue**;
2. Process P uses the send primitive `send(Q, msg);`, and the operating system **adds the message** `msg` **to the message queue of process Q's PCB**;
3. While running, process Q executes the receive primitive `receive(P,&msg);`; the operating system checks the message queue of process Q's PCB, finds which message was sent by process P, and moves this message `msg` into process Q's address space.

### Indirect Communication

Indirect communication uses a "mailbox" as an intermediate entity for message passing, and is also called mailbox communication.

Using the same scenario as above as an example, we demonstrate the process of indirect communication by describing the indirect communication between the two processes.

<img src='\images\posts\操作系统-进程-间接通信.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

1. First, **several mailboxes** are stored in the operating system kernel's address space;
2. Process P uses the send primitive `send(A, msg);`, and the operating system **adds the message** `msg` **to mailbox A in the operating system kernel's address space**;
3. While running, process Q executes the receive primitive `receive(A,&msg);`, and the operating system retrieves the message `msg` from mailbox A and moves it into process Q's address space.

In this process, multiple processes can send messages to the same mailbox, and multiple processes can also receive messages from the same mailbox.

## Pipe Communication

A "pipe" is a special shared file, also called a pipe file; it is essentially a fixed-size memory buffer opened up in memory.

<img src='\images\posts\操作系统-进程-管道通信.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

1. A pipe can only use **half-duplex communication**; within a given period of time, only one-way transmission can be achieved. To achieve **simultaneous two-way communication**, **two pipes need to be set up**.
2. Each process accesses the pipe mutually exclusively (implemented by the operating system).
3. When **the pipe is full**, **the writing process** will **block** until the reading process takes data out of the pipe, which wakes up the writing process.
4. When **the pipe is empty**, **the reading process** will **block** until the writing process writes data into the pipe, which wakes up the reading process.
5. Once data in the pipe is read out, it disappears completely. Therefore, when multiple processes read from the same pipe, confusion may occur. The usual solution is **one pipe allows multiple writing processes and one reading process**, but in Linux processes are allowed to take turns reading data from the pipe, that is, **multiple writing processes and multiple reading processes are allowed.**

