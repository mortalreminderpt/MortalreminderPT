---
layout: post 
title: 使用DiskGenius进行系统迁移
description:
date: 2023-10-12 18:54:54 +0800 
image: https://www.bing.com/th?id=OHR.TexasIndigoBunting_ZH-CN3699392300_1920x1080.jpg
tags:
- 磁盘管理
---

1. 目录
{:toc}

## 引言

博主在本科四年来一直饱受硬盘空间不足的折磨，最近终于有机会加装一块固态硬盘。
安装过程中，相对繁琐的是系统盘的迁移过程。
因此我将迁移过程记录于此，或许之后还能用到。

## 系统盘迁移

### DiskGenius简介

DiskGenius（[中文版](https://www.diskgenius.cn/download.php) <code>&#124;</code> [English](https://www.diskgenius.com/download.php)）是一款常用的专业级磁盘管理软件。
其包括分区管理，备份还原等使用功能，在本文中我们使用此工具完成系统盘的迁移。

### 磁盘格式化

在装入新磁盘后，首先对其进行格式化，选择NTFS存储格式。
而为了避免经常清理C盘的麻烦，我这里选择不分卷。

### 系统迁移

安装DiskGenius后，选择其菜单栏中的系统迁移功能。

<img src='\images\posts\diskGenius-0.jpg'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:50%;" />

随后选中原来的系统分区，一般为C盘；随后选择转移的目标磁盘，即我们刚才所格式化的盘。

系统迁移可以选择PE环境或者热迁移。
由于我没有对其热迁移进行深入研究，我选择更稳健的PE环境进行迁移。

等待一段时间后，系统盘迁移完成。

## 修改启动顺序

最后的工作为修改硬盘的启动顺序，首先进入BIOS环境（因电脑型号不同而异，我这里为开机过程中按F2）。

在Boot菜单中修改系统启动优先级，将新安装的硬盘优先级与原硬盘互换即可。

重新启动后进行测试，迁移后的系统盘使用顺畅，与迁移前无异。
