---
layout: post 
title: 设计模式（二）抽象工厂（Abstract Factory） 
description:
date: 2022-09-10 20:22:42 +0800 
image: /images/covers/操作系统-cover1.png
tags:
- 设计模式
---

## 意图
提供一个**接口**，以创建**一系列相关或相互依赖的对象**，而无须指定它们的具体的类

## 动机
在设计一套支持不同主题的GUI时，同一套主题的GUI下会包括滚动条，窗口和按钮等组件。
为了保证主题的可移植性，一个应用不该为一个特定的主题硬编码组件，否则会使改变主题变得困难。

因此，可以定义一个抽象的WidgetFactory类，声明用来创建基本窗口组件的接口。
其中，每一个窗口组件都有抽象类，它们的子类则实现窗口组件的具体主题。
用户通过WidgetFactory提供的接口获得窗口组件，但是用户并不知道其使用的具体类，因此用户不依赖于具体的主题。

每一种主题对应一个具体的WidgetFactory子类，每个子类实现用于创建该主题的组件操作。
**客户仅与抽象类定义的接口交互，而不使用特定类的接口**

## 适用性

- 一个**系统**要**独立于其产品**的创建、组合和表示；
- 一个**系统**要由**多个产品系列中的一个**来配置；
- 要强调**一系列相关产品的对象的设计**以便进行**联合使用**；
- 提供一个**产品类库**，但只想**显示它们的接口**而不是实现。

## 结构

## 参与者

1. AbstractFactory（WidgetFactory）
- 声明一个创建抽象产品对象的操作接口

2. ConcreteFactory（MotifWidgetFactory、PMWidgetFactory）
- 实现创建具体产品对象的操作

3. AbstractProduct（Window、ScrollBar）
- 为一类产品对象声明一个接口

4. ConcreteProduct（MotifWindow、MotifScrollBar）
- 定义一个将被具体工厂创建的产品对象；
- 实现AbstractProduct接口

5. Client
- 仅由AbstractFactory和AbstractProduct类声明的接口

## 协作

- 通常在运行时创建一个ConcreteFactory的实例，这一具体工厂创建具有特定实现的产品对象。为创建不同的产品对象，客户应该使用不同的具体工厂;
- AbstractProduct将产品对象的创建延迟到它的ConcreteFactory子类

## 效果

1. **分离了具体的类**：将客户与类的实现分离，客户通过它们的抽象接口操纵实例。
产品的类名也在具体工厂的实现中被隔离，即不出现在客户的代码中。
2. **易于交换产品系列**：一个具体的工厂类在一个应用中仅出现一次，即在它初始化的时候，这使得改变一个ConcreteFactory变得容易。
只要改变具体工厂就可以使用不同产品配置，因为一个抽象工厂创建了一个完整的产品系列，所以整个产品系列会立刻改变。
3. **有利于产品一致性**：当一个系列中产品对象被设计成一起工作时，一个应用只能使用同一个系列中的对象，而AbstractFactory很容易实现这一点
4. **难以支持新种类的产品**：由于AbstractFactory确定了AbstractProduct的集合。
因此支持新种类的Product就需要扩展该工厂的接口，并扩展其全部ConcreteFactory
