---
title: Operating Systems (6) System Calls
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

## What Is a System Call? The Role of System Calls
The operating system, as the interface between users and computer hardware, needs to provide some simple and easy-to-use services upward. These mainly include command interfaces and program interfaces. Among them, the program interface consists of a set of **system calls**.

<img src='\images\posts\操作系统-系统调用的作用1.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

A "system call" is an interface provided by the operating system for applications (programmers/developers) to use. It can be understood as a special function that applications can call, and **applications can request services from the operating system kernel through system calls**.

<img src='\images\posts\操作系统-系统调用的作用2.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

## The Difference Between System Calls and Library Functions

|Ordinary applications|They can make system calls directly, or use library functions. Some library functions involve system calls, and some do not.|
|------------|----|
|Programming languages|They provide library functions upward. Sometimes system calls are encapsulated as library functions to hide some details of system calls and make programming more convenient for programmers.|
|Operating system|It provides system calls upward, enabling upper-layer programs to request kernel services.|
|Bare machine||

<img src='\images\posts\操作系统-系统调用和库函数1.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

Library functions that do not involve system calls: such as functions that "take the absolute value";

Library functions that involve system calls: such as functions that "create a new file".

## Why Are System Calls Necessary?

Real-life scenario: You go to the school print shop to print a paper, and you click the "Print" option in WPS, and the printer starts working.

When your paper is halfway printed, another student clicks the "Print" button in Word and starts printing their own paper.

If the two processes could freely and concurrently share the printer resource, the printer device would alternately receive print requests from the WPS and Word processes, and the contents of the two papers would be mixed together...

Solution: **The operating system kernel uniformly manages shared resources** and provides "system calls" upward. If a user process wants to use a shared resource such as a printer, it can only send a request to the operating system kernel through a system call. The kernel coordinates and handles each request.

## What Functions Need to Be Implemented with System Calls

Applications request operating system services through system calls.
Various shared resources in the system are uniformly managed by the operating system kernel, so **all operations related to shared resources (such as storage allocation, I/O operations, file management, etc.) must submit service requests to the operating system kernel through system calls**, and the operating system kernel completes them on behalf of the application.
This can **ensure the stability and security of the system** and prevent users from performing illegal operations.

<img src='\images\posts\操作系统-系统调用的功能.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

## The Process of a System Call

### Trap Instruction System Call
1. The application executes parameter-passing instructions and **stores the passed parameters (parameter 1, parameter 2...) in CPU registers**. The parameters can indicate the type of system call;
2. The application executes a **trap instruction**, triggering an internal interrupt signal. This interrupt is triggered by the trap instruction, so control transfers to the corresponding interrupt handler, namely the entry program of the system call;
3. The processor switches to kernel mode and executes the **system call entry program**, determining which system call service the user needs based on the parameters in the registers;
4. Run the **handler corresponding to the system call**;
5. After the system call is completed, the CPU switches to user mode.

That is, pass the system call parameters → execute the trap instruction (user mode) → execute the corresponding internal request kernel program to handle the system call (kernel mode) → return to the application.

<img src='\images\posts\操作系统-系统调用的过程1.svg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:80%;" />

Note:
1. The **trap instruction** is executed in **user mode**. Immediately after the trap instruction is executed, **an internal interrupt is triggered**, causing the CPU to **enter kernel mode**;
2. **Issuing the system call request occurs in user mode**, while **the corresponding handling of the system call is performed in kernel mode**.



