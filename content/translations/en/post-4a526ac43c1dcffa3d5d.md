---
title: Operating Systems (23) Process Synchronization and Mutual Exclusion
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Process Synchronization

Processes have the characteristic of asynchrony. Asynchrony means that concurrently executing processes advance at their own independent and unpredictable speeds.

As shown in the figure, the pipe communication discussed earlier can serve as an example of process synchronization.

<img src='\images\posts\操作系统-进程-管道通信.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

In a pipe, the reading process and the writing process run concurrently. Since concurrency inevitably leads to asynchrony, the **order of execution** of the two operations "write data" and "read data" is **indeterminate**.
However, **in practical applications**, they **must** be executed **in the order of "write data → read data"**.
How to solve this asynchrony problem is what "process synchronization" discusses.

The operating system must provide a "process synchronization mechanism" to achieve the above requirement.

**Synchronization**, also called a **direct constraint relationship**, refers to two or more processes established to complete a certain task, which **generate a constraint relationship because they need to coordinate their work order at certain points**.
The direct constraint relationship between processes originates from their mutual cooperation.


## Process Mutual Exclusion

### The Concept of Process Mutual Exclusion

The "concurrency" of processes requires the support of "sharing". Concurrently executing processes inevitably need to share some system resources (such as memory, or I/O devices like printers and cameras).

Resource sharing methods include **mutually exclusive sharing** and **simultaneous sharing**:
- Mutually exclusive sharing: certain resources in the system, although they can be provided for use by multiple processes, **only allow one process to access the resource within a given time period**;
- Simultaneous sharing: certain resources in the system **allow multiple processes to "simultaneously" access them within a given time period**.

We call resources that **only allow one process to use within a given time period** **critical resources**.
Many physical devices (such as cameras and printers) are critical resources.
In addition, many variables, data, memory buffers, etc. are also critical resources.

Access to critical resources must be performed **mutually exclusively**.
Mutual exclusion, also called an **indirect constraint relationship**.
**Process mutual exclusion** means that when **a process accesses a critical resource**, **another process that wants to access the critical resource must wait**.
After the process currently accessing the critical resource finishes accessing and **releases the resource**, **another process can then access the critical resource**.

### The Four Parts of Mutually Exclusive Access

Mutually exclusive access to critical resources can be logically divided into the following four parts:

```c
do {
    entry section; // 进入区
    critical section; // 临界区
    exit section; // 退出区
    remainder section; // 剩余区
} while(true);
```

- The **entry section** is responsible for checking whether the critical section can be entered; if it can, a flag indicating that the critical resource is being accessed should be set (locking), to prevent other processes from entering the critical section at the same time;
- The **critical section** is the code that accesses the resource;
- The **exit section** is responsible for clearing the flag indicating that the critical resource is being accessed (unlocking);
- The **remainder section** performs other processing.

Note:
The **critical section** is the code segment in a process that **accesses the critical resource**.

The **entry section and exit section** are the code segments responsible for **implementing mutual exclusion**.

The critical section can also be called the "critical segment".

### The Four Principles of Mutually Exclusive Access to Critical Resources

To achieve mutually exclusive access to critical resources while ensuring overall system performance, the following principles must be followed:

1. **Idle let in**. When the critical section is idle, a process requesting to enter the critical section may be allowed to enter it immediately;
2. **Busy then wait**. When a process has already entered the critical section, other processes attempting to enter the critical section must wait;
3. **Bounded waiting**. For a process requesting access, it should be guaranteed to enter the critical section within a finite time (ensuring no starvation);
4. **Yield the wait**. When a process cannot enter the critical section, it should **immediately release the processor** to prevent the process from busy waiting.
