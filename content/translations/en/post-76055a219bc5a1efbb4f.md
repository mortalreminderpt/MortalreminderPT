---
title: Operating Systems (7) Operating System Architecture
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

## The Kernel of an Operating System

The internal hierarchical structure of an operating system can be further divided, as shown in the following figure:

<img src='\images\posts\操作系统-操作系统分层.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

- Non-kernel part: The development teams of Ubuntu and CentOS, whose main work is to implement non-kernel functionality, while the kernel used is the Linux kernel.
- Clock interrupt: Uses clock interrupts to implement timing functionality;
- Primitives: A primitive is a special kind of program that has atomicity. That is, the execution of this program must be completed in one go and cannot be "interrupted".

The internals of an operating system can be divided into the kernel and non-kernel parts. The **kernel** is the most basic and core part of the operating system, and the programs that implement the kernel functions of the operating system are kernel programs.

Among them, **clock management, interrupt handling, and primitives** are **modules that are more closely tied to the hardware**; while the management work handled by the **management modules** is more about **operations on data structures and does not directly involve the hardware**.

The **operating system kernel** needs to run in **kernel mode**;

The **non-kernel functions of the operating system** run in **user mode**.
## Monolithic Kernel (Macro Kernel/Unikernel) and Microkernel

An architecture that includes all functionality is called a monolithic kernel;

<img src='\images\posts\操作系统-宏内核体系结构.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

An architecture that retains only the parts most closely tied to the hardware in the kernel is called a microkernel.

<img src='\images\posts\操作系统-微内核体系结构.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Now, an application wants to request a service from the operating system, and the processing of this service involves process management, storage management, and device management at the same time.

In this case, using a monolithic kernel structure requires two mode switches, while using a microkernel structure requires six mode switches.

**The process of mode switching has a cost**, consuming a considerable amount of time, and **frequent mode switching reduces system performance**.

Characteristics of Monolithic Kernels

All system functionality is placed in the kernel (operating systems with a monolithic kernel structure usually also adopt a "modular" design philosophy).

Advantages of Monolithic Kernels

High performance; the various functions within the kernel can all call each other directly.

Disadvantages of Monolithic Kernels

1. The kernel is large and its functionality is complex, making it difficult to maintain;
2. An error in a certain functional module in the kernel may cause the entire system to crash.

Characteristics of Microkernels

Only the most core functions, such as interrupts, primitives, and inter-process communication, are placed in the kernel. Functions such as process management, file management, and device management run in user mode in the form of user processes.

Advantages of Microkernels

1. The kernel is small with few functions, easy to maintain, and has high kernel reliability;
2. An error in a functional module outside the kernel will not cause the entire system to crash.

Disadvantages of Microkernels

1. Low performance; frequent switching between user mode and kernel mode is required. The various functional modules in user mode cannot call each other directly and can only communicate indirectly through the kernel's "message passing";
2. The various functional modules in user mode cannot call each other directly and can only communicate indirectly through the kernel's "message passing".

## Layered Structure

Characteristics of the Layered Structure

<img src='\images\posts\操作系统-分层结构.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

The kernel is divided into multiple layers, and each layer can only call the interfaces provided by the layer below it in one direction.

Advantages of the Layered Structure

1. Easy to debug and verify, debugging and verifying layer by layer from the bottom up;
2. Easy to extend and maintain, with clear and fixed call interfaces between layers.

Disadvantages of the Layered Structure

1. It can only call the adjacent lower layer, making it difficult to reasonably define the boundaries of each layer;
2. Low efficiency; cross-layer calls are not allowed, and system call execution takes a long time.

## Modularization

Modularization is the division of an operating system by function into several modules with a certain degree of independence. Each module has management functionality in some aspect, and **the interfaces between the modules are specified** so that the modules can communicate through the interfaces.
Each module can be further subdivided into several submodules with certain functions, and **the interfaces between the submodules are likewise specified**.
This design method is called the **module-interface approach**. The following figure shows a modular operating system structure composed of modules, submodules, and so on:

<img src='\images\posts\操作系统-模块化.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Characteristics of Modularization

The kernel is divided into multiple modules, and the modules cooperate with each other.

Kernel = main module + loadable kernel modules;

Main module: responsible only for core functions, such as process scheduling and memory management;

Loadable kernel modules: new modules can be dynamically loaded into the kernel without recompiling the entire kernel.

Advantages of Modularization

1. The logic between modules is clear and easy to maintain; once the interfaces between modules are determined, multiple modules can be developed simultaneously;
2. Supports dynamically loading new kernel modules (e.g., installing device drivers, installing new file system modules into the kernel), enhancing OS adaptability;
3. Any module can directly call other modules without the need for message passing for communication, resulting in high efficiency.

Disadvantages of Modularization

1. The interface definitions between modules may not be reasonable or practical;
2. Modules depend on each other, making debugging and verification more difficult.

## Exokernel

Characteristics of the Exokernel

The kernel is responsible for functions such as process scheduling and inter-process communication, while the exokernel is responsible for allocating unabstracted hardware resources to user processes, and the exokernel is responsible for ensuring the safety of resource usage.

Advantages of the Exokernel

1. The exokernel can directly allocate "non-virtualized, non-abstracted" hardware resources to user processes, allowing user processes to use hardware resources more flexibly;
2. It reduces the "mapping layer" of virtual hardware resources, improving efficiency.

Disadvantages of the Exokernel

1. It reduces system consistency;
2. It makes the system more complex.
