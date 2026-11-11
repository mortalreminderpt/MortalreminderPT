---
title: Operating Systems (29) Producer-Consumer Problem
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## General approach to PV operation problems:
1. Relationship analysis. Identify each process described in the problem and analyze the synchronization and mutual exclusion relationships between them.
2. Organize your thoughts. Determine the general order of P and V operations based on the operation flow of each process.
3. Set semaphores. Set the required semaphores and determine their initial values based on the problem conditions. (The initial value of a mutual exclusion semaphore is generally 1; the initial value of a synchronization semaphore depends on the initial value of the corresponding resource.)

## Problem Description

The system contains a group of producer processes and a group of consumer processes.
Each time, a producer process produces a product and puts it into the buffer; each time, a consumer process takes a product out of the buffer and uses it. (Here, "product" is understood as some kind of data.)

Producers and consumers share a buffer that is initially empty and has size n.

Only when **the buffer is not full** can **the producer put a product into the buffer**; otherwise, it must wait.

Only when **the buffer is not empty** can **the consumer take a product out of it**; otherwise, it must wait.

**The buffer is a critical resource**, and each process must **access it mutually exclusively**.

## Implementation Principles

The producer-consumer problem is a comprehensive problem involving both mutual exclusion and synchronization.

For beginners, the hardest part is discovering the two pairs of synchronization relationships implicit in the problem.

Sometimes the consumer needs to wait for the producer to produce, and sometimes the producer needs to wait for the consumer to consume. These are two different "one-before-the-other problems," so two synchronization semaphores also need to be set.

The predecessor relationships in the producer-consumer problem are shown in the following figure:

<img src='\images\posts\操作系统-信号量4.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Based on the predecessor graph, the corresponding code can be written:

```c
semaphore mutex = 1; //互斥信号量，实现对缓冲区的互斥访问
semaphore empty = n; //同步信号量，表示空闲缓冲区的数量
semaphore full = 0;  //同步信号量,表示产品的数量,也即非空缓冲区的数量

Producer () {
    while(1) {
        生产一个产品;
        P(empty);   // 消耗一个空闲缓冲区
        P(mutex);   // 实现互斥是在同进程中进行一对PV操作
        把产品放入缓冲区; 
        V(mutex);   // 实现互斥是在同进程中进行一对PV操作
        V(full);    // 增加一个产品
    }
}

Consumer() {
    while(1) {
        P(full);    // 消耗一个产品（非空缓冲区）
        P(mutex);
        从缓冲区取出一个产品;
        V(mutex);
        V(empty);   // 增加一个空闲缓冲区
        使用产品;
    }
}
```

- mutex: mutual exclusion is achieved by performing a pair of PV operations within the same process.
- empty/full: the synchronization relationship between the two processes is achieved by executing P in one process and V in the other.

## Order of synchronization and mutual exclusion

Suppose the order of the P operations in the above code is swapped, as shown below:

Producer:
```c 
P(mutex);   // 1.
P(empty);   // 2.
把产品放入缓冲区; 
V(mutex);
V(full);   
```

Consumer:
```c 
P(full);    // 3.
P(mutex);   // 4.
从缓冲区取出一个产品;
V(mutex);
V(empty);
```

If the buffer is already full at this point, then empty=0 and full=n.
Then the producer process executes 1, making mutex become 0, and then executes 2. Since there is **no free buffer space, the producer is blocked**.
Because the producer is blocked, the system switches back to the consumer process.
The consumer process executes 3. **Because mutex is 0**, that is, the producer has not yet released the "lock" on the critical resource, **the consumer is also blocked**.

This creates a situation where **the producer waits for the consumer to release free buffer space**, while **the consumer waits for the producer to release the critical section**.
The producer and consumer cyclically wait for each other to wake them up, resulting in **"deadlock."**

Similarly, if there is no product in the buffer, that is, full=0 and empty=n, executing in the order 341 will also cause deadlock.

Therefore, **the P operation that implements mutual exclusion must come after the P operation that implements synchronization**.

V operations do not cause processes to block, so **the order of the two V operations can be swapped**.
