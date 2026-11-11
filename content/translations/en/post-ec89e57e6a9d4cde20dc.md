---
title: Operating Systems (8) Operating System Boot
description: >-
  An operating system (OS) refers to software that controls and manages the
  hardware and software resources of a computer system, reasonably organizes and
  schedules the computer's work and resource allocation, and provides users and
  other software with convenient interfaces and an environment.
---

1. Table of Contents
{:toc}

## What Is Operating System Boot

When the computer is powered on, how do we get the operating system running?

## Data Related to Booting

<img src='\images\posts\操作系统-磁盘数据.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:80%;" />

- ROM (Basic Input/Output System, BIOS) boot program: instructs the CPU to read the disk's master boot record into RAM;
- Master Boot Record (MBR): the CPU can execute the disk boot program within it, determine the location of the primary partition, and read in the partition boot record;
- Partition Boot Record (PBR): executes the boot program, finds and reads in the boot manager at some location under the partition's root directory;
- Boot manager: executes the boot manager to complete a series of operating system initialization tasks.

## The Operating System Boot Process

1. The CPU starts fetching instructions from a specific main memory address and executes the **boot program in ROM (BIOS)** (first performing a hardware self-test, then powering on);
2. The first block of the disk—the **Master Boot Record (MBR)**—is read into memory, the disk boot program is executed, and the partition table is scanned;
3. The **Partition Boot Record (PBR)** is read from the active partition (also called the primary partition, i.e., the partition where the operating system is installed), and the program within it is executed;
4. The complete **operating system initialization program (i.e., the boot manager)** is found under the root directory and executed, completing the series of actions involved in "booting".
