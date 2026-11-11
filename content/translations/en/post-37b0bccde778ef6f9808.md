---
layout: post 
title: Migrating Your System with DiskGenius
description: Learn how to migrate your system disk using DiskGenius, a powerful disk management tool.
date: 2023-10-12 18:54:54 +0800 
image: https://www.bing.com/th?id=OHR.TexasIndigoBunting_ZH-CN3699392300_1920x1080.jpg
tags:
- Disk Management
---

1. Table of Contents
{:toc}

## Introduction

For the past four years of my undergraduate studies, I've been plagued by the torment of insufficient disk space. Finally, I got the opportunity to add a solid-state drive (SSD). However, the most cumbersome part of the installation process was migrating the system disk. So, I've documented the migration process here, perhaps it will be useful in the future.

## System Disk Migration

### Introduction to DiskGenius

DiskGenius ([Chinese Version](https://www.diskgenius.cn/download.php) <code>&#124;</code> [English Version](https://www.diskgenius.com/download.php)) is a commonly used professional disk management software. It includes features such as partition management, backup, and restoration. In this article, we'll use this tool to complete the system disk migration.

### Disk Formatting

After installing the new disk, the first step is to format it, choosing the NTFS storage format. To avoid the hassle of frequently cleaning the C drive, I opt not to partition it.

### System Migration

After installing DiskGenius, navigate to the system migration feature in its menu bar.

<img src='\images\posts\diskGenius-0.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

Then, select the original system partition, usually the C drive, and choose the target disk for migration, the one we formatted earlier.

System migration can be done in the PE environment or through hot migration. Since I haven't delved deeply into hot migration, I opt for the more reliable PE environment for migration.

After a while, the system disk migration is complete.

## Modifying Boot Order

The final step is to modify the boot order of the disks. First, enter the BIOS environment (this varies depending on the computer model, for me it's by pressing F2 during the boot process).

In the Boot menu, modify the system boot priority, swapping the priority of the newly installed disk with the original one.

After restarting, conduct tests to ensure smooth operation of the migrated system disk, which should perform just as well as before migration.