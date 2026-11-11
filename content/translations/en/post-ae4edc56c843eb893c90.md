---
title: Operating Systems (37) Deadlock Avoidance
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Deadlock Handling Strategies

1. Deadlock prevention. Break one or several of the four necessary conditions for deadlock;
2. Deadlock avoidance. Use some method to prevent the system from entering an unsafe state, thereby avoiding deadlock (Banker's Algorithm);
3. Deadlock detection and recovery. Allow deadlocks to occur, but the operating system is responsible for detecting the occurrence of deadlock and then taking some measure to recover from it.

## Dynamic Strategy: Deadlock Avoidance

### Safe Sequence

A so-called **safe sequence** means that if the system allocates resources according to this sequence, every process can complete successfully.
As long as **a safe sequence can be found**, the system is in a **safe state**.
Of course, **there may be multiple safe sequences**.

If, after resources are allocated, no safe sequence can be found in the system, the system has entered an **unsafe state**.
This means that afterward **it is possible that** all processes will be unable to execute successfully.
Of course, if some processes return some resources in advance, **the system may also return to a safe state**, but we must always consider the worst case before allocating resources.

If the system is in a **safe state, deadlock will definitely not occur**.
If the system enters an **unsafe state, deadlock may occur**. (Being in an unsafe state does not necessarily mean deadlock has occurred, but when deadlock occurs, the system must be in an unsafe state.)

Therefore, **before allocating resources, we can determine in advance whether this allocation will cause the system to enter an unsafe state**, and use this to decide whether to grant the resource allocation request.
This is also the core idea of the **"Banker's Algorithm"**.

### Idea of the Banker's Algorithm

The Banker's Algorithm was designed by the Dutch scholar Dijkstra for the banking system, to ensure that when a bank issues cash loans, it will not encounter a situation where it cannot meet the needs of all customers.
Later, this algorithm was used in operating systems to **avoid deadlock**.

**Core idea**: When a process requests resources, first predict whether this allocation will cause the system to enter an unsafe state.
If it will enter an unsafe state, temporarily do not grant this request and let the process block and wait first.

### Steps of the Banker's Algorithm

Suppose the system has **n processes and m types of resources**;

Each process first declares the maximum number of each type of resource it needs before running, so an n*m matrix (which can be implemented with a two-dimensional array) can be used to represent **the maximum number of each type of resource required by all processes**.
Let us call it the **Maximum Demand Matrix Max**, where Max[i, j]=K means process Pi needs at most K instances of resource Rj.

Similarly, the system can use an n*m allocation **matrix Allocation** to represent **the resource allocation situation for all processes**.

Max - Allocation = **Need matrix**, which represents **how many resources of each type each process may still need at most**.

In addition, a **one-dimensional array Available of length m** is also needed to represent **how many available resources are currently in the system**.

To visually show each data structure, the following table shows the maximum resource demand, process allocation, and maximum remaining need of 5 processes:

|Process|Maximum Demand (Max matrix)|Allocated (Allocation matrix)|Maximum Remaining Need (Need matrix)|
|--|--|--|--|
|P0|(7,5,3)|(0,1,0)|(7,4,3)|
|P1|(3,2,2)|(2,0,0)|(1,2,2)|
|P2|(9,0,2)|(3,0,2)|(6,0,0)|
|P3|(2,2,2)|(2,1,1)|(0,1,1)|
|P4|(4,3,3)|(0,0,2)|(4,3,1)|

At this time, the remaining allocatable resources of the processes are Available=(3,3,2), Request_0=(2,1,1).

When a process **Pi** requests resources from the system, a one-dimensional array **Request_i** of length m can be used to represent **the amount of each type of resource requested this time**.

The **Banker's Algorithm** can be used to predict whether this allocation will cause the system to enter an unsafe state:

1. If `Request_i≤Need[i]`, then go to 2; otherwise, consider it an error.

2. If `Request_i≤Available`, then go to 3; otherwise, it means there are not yet enough resources, and Pi must wait.

3. The system **tentatively** allocates resources to process Pi and modifies the corresponding data (this is not a real allocation; modifying the values is only for prediction).

```c 
Available -= Request_i;       // 减少系统剩余资源量
Allocation[i] += Request_i;   // 增加进程i的分配资源量
Need[i] -= Request_i;         // 减少进程i还需要的资源量
```
4. The operating system **executes the safety algorithm** to check whether the system is in a safe state after this resource allocation. If it is safe, only then is the allocation formally made; otherwise, restore the corresponding data and let the process block and wait.

#### Summary

Data structures:
1. A one-dimensional array **Available** of length m represents how many available resources remain;
2. An n*m matrix **Max** represents the maximum demand of each process for resources;
3. An n*m matrix **Allocation** represents how many resources have already been allocated to each process;
4. Max - Allocation = **Need** matrix represents how many resources each process may still need at most;
5. A one-dimensional array **Request_i** of length m represents the number of each type of resource requested by process i this time.

Steps of the Banker's Algorithm:
1. Check whether this request **exceeds the maximum demand declared previously**;
2. Check whether the system's **remaining available resources can still satisfy** this request;
3. Tentatively allocate and **change each data structure**;
4. Use the safety algorithm to **check whether this allocation will cause the system to enter an unsafe state**.

Steps of the safety algorithm:
- Check whether the current remaining available resources can satisfy the maximum demand of some process. If so, add that process to the safe sequence and reclaim all resources held by that process.
- Repeat the above process continuously to see whether all processes can eventually be added to the safe sequence.

### Example of the Safety Algorithm

Suppose the total system resources are (10,5,7), and the remaining available resources are available=(3,3,2).
At this time, the process resource allocation situation is as shown in the table above. Is the system in a safe state?

Use the safety algorithm to try to **find a safe sequence**:
1. Check in turn whether the remaining available resources (3,3,2) can satisfy the needs of each process. They can satisfy P1's need, so add P1 to the safe sequence and update the remaining available resources to (5,3,2);
2. Check in turn whether the remaining available resources (5,3,2) can satisfy the needs of the remaining processes (**excluding processes already added to the safe sequence**). They can satisfy P3's need, so add P3 to the safe sequence and update the remaining available resources to (7,4,3);
3. Check in turn whether the remaining available resources (7,4,3) can satisfy the needs of the remaining processes (**excluding processes already added to the safe sequence**)...

By analogy, **a total of 5 rounds of checks can add all 5 processes to the safe sequence**, and finally a safe sequence can be obtained.
This algorithm is called the **safety algorithm**. The above process can be implemented very conveniently in code, and each round of checks starts from the process with the smaller number.

Thus, all 5 processes are added to the safe sequence, indicating that the system is in a safe state at this time and deadlock is temporarily impossible.
