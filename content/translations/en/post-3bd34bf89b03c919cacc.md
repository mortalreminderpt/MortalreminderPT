---
title: Operating Systems (40) Concepts of Memory Management
description: >-
  Memory is an important component of a computer, also called internal memory or
  main memory. It is used to temporarily store the computation data in the CPU,
  as well as the data exchanged with external storage such as hard disks, and it
  is the bridge for communication between external storage and the CPU.
---

1. Table of Contents
{:toc}

## Allocation and Reclamation of Memory Space

The operating system needs to be responsible for **the allocation and reclamation of memory space**:
- How should the operating system record which memory regions have already been allocated and which are still free?
- After a process finishes running, how should the memory space occupied by the process be reclaimed?
- There are many locations in memory where a process can be placed; where exactly should it be placed?

## Expansion of Memory Space
The operating system needs to provide some technology to logically **expand the memory space** (virtuality).

## Address Translation
The operating system needs to provide an address translation function and be responsible for **the translation between logical addresses and physical addresses** of programs:
To make programming more convenient, programmers should only need to focus on the logical addresses of instructions and data when writing programs.
And **the translation from logical addresses to physical addresses** (this process is called **address relocation**) should be handled by the operating system.
This ensures that programmers do not need to pay attention to the actual situation of physical memory when writing programs. (Three loading methods)

## Storage Protection
The operating system needs to provide a **memory protection** function. It ensures that each process runs within its own storage space without interfering with others.
Memory protection can adopt two methods:
1. **Set a pair of upper and lower limit registers** in the CPU to store the upper and lower limit addresses of the process.
When an instruction of the process needs to access an address, the CPU checks whether it is out of bounds.
2. Use a **relocation register** (also called the **base address register**) and a **bound address register** (also called the **limit length register**) to perform out-of-bounds checks.
The relocation register stores **the starting physical address of the process**, and the bound address register stores **the maximum logical address of the process**.


