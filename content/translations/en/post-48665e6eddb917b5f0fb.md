---
title: Operating Systems (26) Mutex Locks
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## The Concept of Mutex Locks
The simplest tool for solving the critical section problem is the mutex lock.
A process should acquire the lock when entering the critical section and release the lock when exiting the critical section.
The function `acquire()` acquires the lock, while the function `release()` releases the lock.

Each mutex lock has a Boolean variable `available` that indicates whether the lock is available.
If the lock is available, calling `acquire()` succeeds, and the lock is no longer available.
When a process attempts to acquire an unavailable lock, it is blocked until the lock is released.

```c 
acquire () {
    while (!available); // 忙等待
    available = false;  // 获得锁
}

release () {
    available = true;   // 释放锁
}
```

The execution of `acquire()` or `release()` must be an atomic operation, so mutex locks are usually implemented using hardware mechanisms.

The main disadvantage of mutex locks is busy waiting: when one process is in the critical section, any other process must continuously loop calling `acquire()` when trying to enter the critical section.
When multiple processes share the same CPU, this wastes CPU cycles.
Therefore, mutex locks are usually used in multiprocessor systems, where one thread can wait on one processor without affecting the execution of other threads.

Mutex locks that require continuous busy waiting in a loop (spin waiting) can all be called spin locks.
Examples include the TS and swap instructions; the single-flag method, the two-flag method, and Peterson's algorithm.

## Characteristics of Mutex Locks
- They require busy waiting; a process leaves the processor only after its time slice is used up, **violating the "wait with relinquishing the CPU" principle**; 
- Advantages: during waiting, **no process context switch is needed**; in multiprocessor systems, **if the lock is held for a short time, the waiting cost is very low**;
- They are often used in multiprocessor systems, where one core busy-waits while other cores work as usual and quickly release the critical section;
- **They are not very suitable for uniprocessor systems**, because during busy waiting it is impossible to unlock.

```c
do {
    acquire(); // 进入区
    critical section; // 临界区
    release(); // 退出区
    remainder section; // 剩余区
} while (true);
```
