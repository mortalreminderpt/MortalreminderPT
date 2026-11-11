---
title: Operating Systems (9) Virtual Machines
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

## Definition of Virtual Machine

Running certain processes concurrently on the same operating system may pose security risks; if they are run on different hardware, a large amount of hardware resources will be wasted.

Virtual Machine: Using virtualization technology, a physical machine is virtualized into multiple virtual machines (Virtual Machine, VM), and each virtual machine can independently run an operating system.

Synonymous terms: Virtual Machine Manager / Virtual Machine Monitor / Virtual Machine Monitor / Hypervisor

## Type 1 Virtual Machine
The Type 1 virtual machine manager runs directly on the hardware. The virtual machine manager virtualizes one physical machine into multiple virtual machines.
The Type 1 virtual machine manager divides the overall hardware resources into multiple parts, and each virtual machine can have its own operating system installed, as shown in the figure below:

<img src='\images\posts\操作系统-第一类虚拟机.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

During operation, CPU time slices are allocated to several virtual machines. From the perspective of the upper-layer operating system, it appears to have been allocated an independent CPU; disk and memory, however, are divided by space. Each machine has its own independent resources.

In a Type 1 virtual machine, **only the virtual machine manager runs in kernel mode** and can use those instructions with the highest privileges.
The upper-layer **virtual kernel space runs in user mode**, but it believes that it is running in kernel mode and will execute privileged instructions. At this time, these **privileged instructions will be intercepted by the virtual machine manager and converted into equivalent operations**.

## Type 2 Virtual Machine
The Type 2 virtual machine manager runs on the host operating system (Host OS).

Common Type 2 virtual machines: VirtualBox, VMWare

When a Type 2 virtual machine wants to allocate hardware resources to a virtual machine, it needs to request the operating system to allocate them. **The manager of hardware resources is still the host operating system**.

Note: In a Type 2 virtual machine, **part of the virtual machine manager runs in kernel mode**, and this part is **loaded into the operating system kernel as a virtual machine driver**.

<img src='\images\posts\操作系统-第二类虚拟机.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

## Comparison of the Two Types of Virtual Machines

| |Type 1 VMM|Type 2 VMM|
|----|----|---|
|Control over physical resources|Runs directly on the hardware and can directly control and allocate physical resources.|Runs on top of the Host OS and relies on the Host OS to allocate physical resources for it.|
|Resource allocation method|When installing the Guest OS, the VMM must allocate storage space on the original hard disk by itself, similar to the allocation method of an "exokernel", allocating unabstracted physical hardware.|The Guest OS has its own virtual disk, which is actually a large file in the Host OS file system. The memory allocated to the Guest OS is virtual memory.|
|Performance|Better performance.|Worse performance, requiring the Host OS as an "intermediary".|
|Number of virtual machines supported|More; there is no need to compete with the Host OS for resources, and the same hardware resources can support more virtual machines.|Fewer; the Host OS itself needs to use physical resources, and other processes running on the Host OS also need physical resources.|
|Virtual machine migratability|Worse.|Better; migration to another Host OS only requires exporting the virtual machine image file, and it is more widely used commercially.|
|Operating mode|The Type 1 VMM runs at the highest privilege level (Ring 0) and can execute instructions with the highest privileges.|The Type 2 VMM partly runs in user mode and partly in kernel mode. System calls issued by the Guest OS are intercepted by the VMM and converted into the VMM's system calls to the Host OS.|

## More Instruction Levels
CPUs that support virtualization are usually divided into more instruction levels, as shown in the figure below:

<img src='\images\posts\操作系统-虚拟化CPU指令等级.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Among them, Ring 0 represents the highest privilege level instructions; Ring 3 represents the lowest privilege level instructions.

In a Type 1 virtual machine, the VMM can run at Ring 0, the virtual kernel space can run at Ring 1, and the virtual user space can run at Ring 2. This ensures that when privileged instructions at Ring 1 and Ring 2 are executed, the virtual machine manager does not need to intervene, improving operating efficiency.
