---
title: Operating Systems (31) The Smokers Problem
description: >-
  A process is the running process of a process entity and is an independent
  unit for resource allocation and scheduling by the system.
---

1. Table of Contents
{:toc}

## Problem Description
Suppose a system has **three smoker processes** and **one supplier process**.
Each smoker continuously rolls a cigarette and smokes it, but to roll and smoke a cigarette, a smoker needs three materials: tobacco, paper, and glue.
Among the three smokers, **the first has tobacco, the second has paper, and the third has glue.**
The supplier process provides the three materials indefinitely. Each time, the supplier puts two materials on the table, and the smoker who has the remaining material rolls a cigarette and smokes it, then signals the supplier process that it is done. The supplier then puts the other two materials on the table, and this process repeats forever (letting the three smokers take turns smoking).

## Implementation Principles

This problem is essentially also a "producer-consumer" problem; more precisely, it is a "single producer that can produce multiple products - multiple consumers" problem.

Mutual exclusion relationship:
- The table can be abstracted as a buffer of capacity 1, which must be accessed mutually exclusively.

Possible combinations on the table:
- Combination 1: paper + glue;
- Combination 2: tobacco + glue;
- Combination 3: tobacco + paper.

Synchronization relationships (analyzed from the perspective of events):
- Combination 1 on the table -> the first smoker takes the items;
- Combination 2 on the table -> the second smoker takes the items;
- Combination 3 on the table -> the third smoker takes the items;
- Completion signal sent -> the supplier puts the next combination on the table.

Semaphore design:

<img src='\images\posts\操作系统-信号量8.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

## Code Implementation

```c 
semaphore offer1 = 0;     //桌上组合一的数量
semaphore offer2 = 0;     //桌上组合二的数量
semaphore offer3 = 0;     /桌上组合三的数量
semaphore finish = 0;     //抽烟是否完成
int i = 0;                //用于实现"三个抽烟者轮流抽烟"

Provider() {
    while(1) {
        if(i == 0) {
            将组合一放到桌上;
            V(offer1);
        }
        else if (i == 1) {
            将组合二放到桌上;
            V(offer2);
        }
        else if (i == 2) {
            将组合三放到桌上;
            V(offer3);
        }
        i = (i + 1) % 3;
        P(finish);
    }
}

Smoker1() {
    while(1) {
        P(offer1);
        从桌上拿走组合一;
        V(finish);
    }
}

Smoker2() {
    while(1) {
        P(offer2);
        从桌上拿走组合二;
        V(finish);
    }
}

Smoker3() {
    while(1) {
        P(offer3);
        从桌上拿走组合三;
        V(finish);
    }
}
```

The buffer size is 1, and at any moment at most one of the four synchronization semaphores has a value of 1, so **there is no need to set up a dedicated mutual exclusion semaphore**.

## Summary

The smokers problem can provide us with an approach to solving the "single producer that can produce multiple products" problem.
The key insight worth taking away is: **letting each smoker smoke in turn** necessarily requires **putting combinations** one, two, and three **on the table in turn**.
Pay attention to how we use an integer variable i to implement this **taking turns** process.

If **one producer must produce multiple products** (or, in other words, will **trigger multiple predecessor events**), then **each V operation** should be placed **after the occurrence of its corresponding "event"**.
