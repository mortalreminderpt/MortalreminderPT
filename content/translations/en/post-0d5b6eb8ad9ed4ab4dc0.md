---
title: Operating Systems (36) Deadlock Prevention
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling in the system.
---

1. Table of Contents
{:toc}

## Deadlock Handling Strategies

1. Deadlock prevention. Break one or several of the four necessary conditions for deadlock to occur;
2. Deadlock avoidance. Use some method to prevent the system from entering an unsafe state, thereby avoiding deadlock (Banker's Algorithm);
3. Deadlock detection and recovery. Allow deadlocks to occur, but the operating system is responsible for detecting the occurrence of deadlock and then taking some measure to recover from it.

## Static Strategy: Deadlock Prevention

### Breaking the Mutual Exclusion Condition

Mutual exclusion condition: Only contention for resources that must be used mutually exclusively can lead to deadlock.

If resources that can only be used mutually exclusively are transformed to allow shared use, the system will not enter a deadlock state.
For example: **SPOOLing technology.** The operating system can use SPOOLing technology to logically transform exclusive devices into shared devices.
For example, use SPOOLing technology to transform a printer into a shared device.

As shown in the figure, before process 1 has finished using the printer, process 2's request to use the printer will block:

<img src='\images\posts\操作系统-死锁1.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

After using SPOOLing technology, from the perspective of each process, its request to use the printer resource is immediately received and processed, and there is no need to block and wait:

<img src='\images\posts\操作系统-死锁2.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

#### Disadvantages of This Strategy
Not all resources can be transformed into resources that can be used in a shared manner.
Moreover, for system security, many places must still protect this mutual exclusivity.
Therefore, **in many cases the mutual exclusion condition cannot be broken**.

### Breaking the No Preemption Condition
No preemption condition: Resources obtained by a process cannot be forcibly taken away by other processes before they are used up; they can only be released voluntarily.

Breaking the no preemption condition:
- Option 1: When a process requests new resources and the request cannot be satisfied, it must immediately release all the resources it holds and reapply for them later when needed. That is, even if some resources have not yet been used up, they must be released voluntarily, thereby breaking the no preemption condition;
- Option 2: When resources needed by a process are occupied by other processes, the operating system can assist in forcibly preempting the desired resources. This approach generally needs to consider the priority of each process. (For example, preemptive scheduling forcibly preempts processor resources for use by higher-priority processes.)

#### Disadvantages of This Strategy

1. It is relatively complex to implement.
2. Releasing already obtained resources may invalidate work done in the previous stage. Therefore, this method is generally **only suitable for resources whose state is easy to save and restore**, such as the CPU.
3. Repeatedly applying for and releasing resources increases system overhead and reduces system throughput.
4. If **Option 1** is adopted, it means that as long as a certain resource cannot be obtained temporarily, all previously obtained resources must be abandoned and reapplied for later. If this happens continuously, it will **lead to process starvation**.

### Breaking the Request and Hold Condition
Request and hold condition: A process already holds at least one resource but makes a new resource request, and that resource is occupied by another process. At this time, the requesting process is blocked but still holds on to the resources it already has.

A **static allocation method** can be adopted, that is, a process **applies for all the resources it needs at once before running**, and **it is not allowed to start running until its resources are satisfied**.
Once it starts running, these resources remain owned by it, and the process will no longer request any other resources.

#### Disadvantages of This Strategy

This strategy is simple to implement, but it also has obvious disadvantages:
Some resources may only need to be used for a very short time, so if a process keeps all resources throughout its entire running period, it will cause serious resource waste, and **resource utilization will be extremely low**.
In addition, this strategy may also **lead to starvation of some processes**.

As shown in the figure, class A processes only need resource 1 to run, class B processes only need resource 2 to run, but class C processes need to possess both resource 1 and resource 2 to run:

<img src='\images\posts\操作系统-死锁3.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

In this case, class A processes and class B processes may continue running while class C processes starve.

### Breaking the Circular Wait Condition
Circular wait condition: There exists a circular wait chain of process resources, in which the resource already obtained by each process in the chain is simultaneously requested by the next process.

A **sequential resource allocation method** can be adopted.
First, number the resources in the system, and stipulate that **each process must request resources in increasing order of number**, and resources of the same type (that is, resources with the same number) must be applied for all at once.

Principle analysis: A process is **eligible to apply for resources with larger numbers only when it already holds resources with smaller numbers**.
According to this rule, **a process that already holds resources with large numbers cannot go back in reverse to apply for resources with small numbers**, so the phenomenon of circular wait will not occur.

Eg. Suppose there are 10 resources in the system, numbered 1, 2, ..., 10:

<img src='\images\posts\操作系统-死锁4.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

At any moment, there is always a process that owns the resource with the largest number, and that process's subsequent resource requests will inevitably proceed without obstruction.
Therefore, a deadlock phenomenon in which all processes are blocked cannot occur.

#### Disadvantages of This Strategy

1. It is inconvenient to add new devices, because all numbers may need to be reassigned;
2. The actual order in which a process uses resources may be inconsistent with the increasing order of numbers, resulting in resource waste;
3. Resources must be applied for in the specified order, which makes user programming troublesome.
