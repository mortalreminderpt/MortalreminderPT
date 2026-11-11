---
title: Operating Systems (33) The Dining Philosophers Problem
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Problem Description

Five philosophers sit around a round table. Between every two philosophers, a chopstick is placed on the table, and in the middle of the table is a bowl of rice.
The philosophers devote their lives to thinking and eating, and while a philosopher is thinking, they do not affect others.
Only when a philosopher is hungry do they attempt to pick up the left and right chopsticks (one at a time).
If a chopstick is already in someone else's hands, they must wait. A hungry philosopher can only begin eating after picking up both chopsticks, and when finished eating, they put down the chopsticks and continue thinking.

## Implementation Principles

Relationship analysis: There are 5 philosopher processes in the system, and the access of the 5 philosophers and their left and right neighbors to the chopsticks between them is a mutual exclusion relationship. 

This problem involves only mutual exclusion relationships, but unlike the problems encountered before, each philosopher process needs to hold two critical resources at the same time before it can start eating.
**How to avoid deadlock caused by improper allocation of critical resources is the essence of the dining philosophers problem.**

Semaphore design: Define a mutual exclusion semaphore array `chopstick[5]={1,1,1,1,1}` to implement mutually exclusive access to the 5 chopsticks.
Number the philosophers from 0 to 4; the chopstick to the left of philosopher `i` is numbered `i`, and the chopstick to the right is numbered `(i+1)%5`.

<img src='\images\posts\操作系统-信号量9.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

## Typical Incorrect Code Implementation

First, write the following code

```c 
semaphore chopstick[5]={1,1,1,1,1};
Pi(){                               // i号哲学家的进程
    while(1) {
        P(chopstick[i]);            // 拿起左手边筷子
        P(chopstick[(i+1)%5]);      // 拿起右手边筷子
        吃饭;
        V(chopstick[i]);            // 放下左手边筷子
        V(chopstick[(i+1)%5]);      // 放下右手边筷子
        思考;
    }
}
```

The problem with this implementation is that if all 5 philosophers **concurrently pick up the chopstick on their left**, each philosopher waits in a loop for the person on their right to put down their chopstick (blocking), and **a "deadlock" occurs**.

## A Feasible Code Implementation

To prevent deadlock, **the act of each philosopher picking up chopsticks can be made mutually exclusive**.
This ensures that **even if a philosopher is blocked halfway through picking up chopsticks**, **no other philosopher will continue trying to pick up chopsticks**.
In this way, after the philosopher currently eating puts down their chopsticks, the blocked philosopher can obtain the chopsticks they are waiting for.

```c 
semaphore chopstick[5]={1,1,1,1,1};
semaphore mutex = 1;                // 互斥地取筷子
Pi(){                               // i号哲学家的进程
    while(1) {
        P(mutex);
        P(chopstick[i]);            // 拿起左手边筷子
        P(chopstick[(i+1)%5]);      // 拿起右手边筷子
        V(mutex);
        吃饭;
        V(chopstick[i]);            // 放下左手边筷子
        V(chopstick[(i+1)%5]);      // 放下右手边筷子
        思考;
    }
}
```

## Other Feasible Methods

- Some constraints can be imposed on the philosopher processes, for example, allowing at most four philosophers to eat at the same time. (Set a semaphore to 4.) This ensures that at least one philosopher can pick up both the left and right chopsticks.
- Require odd-numbered philosophers to first pick up the left chopstick and then the right chopstick, while even-numbered philosophers do the opposite. This method ensures that if two adjacent philosophers with odd and even numbers both want to eat, only one of them can pick up the first chopstick, and the other will block directly. This avoids the situation of holding one chopstick and then waiting for the other.

## Summary

The key to the dining philosophers problem is solving process deadlock.

There are only mutual exclusion relationships among these processes, but unlike the mutual exclusion relationships encountered before, each process needs to hold two critical resources at the same time, so there is a hidden risk of "deadlock."

When encountering a situation where a process needs to hold multiple critical resources at the same time, one should refer to the ideas of the dining philosophers problem and analyze whether circular waiting or deadlock may occur among the processes given in the problem.

You can refer to the three approaches to solving deadlock in the dining philosophers problem.
