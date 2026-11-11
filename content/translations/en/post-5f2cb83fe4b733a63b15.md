---
layout: post 
title: Maven (Part 1) - The Philosophy of Maven
description:
date: 2023-12-03 08:40:06 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. Table of Contents
{:toc}

## Introduction

As a commonly used Java build tool, I've used Maven several times without delving into its intricacies. Recently, due to work requirements, I've had the opportunity to reacquaint myself with Maven. This time, I've primarily relied on the official documentation for learning, and the main content of this blog is a translation of some of the more important parts of the official documentation.

## The Philosophy of Maven

![logo](https://maven.apache.org/images/maven-logo-black-on-white.png)

Maven is often thought of by many as a build tool. Many who first encounter Maven are familiar with Ant, so it's a natural association, but Maven is not just a build tool; nor is it merely a replacement for Ant. Maven is a completely different creature from Ant. While Ant is just a toolbox, **Maven is an application of patterns** to achieve an infrastructure with characteristics of **visibility, reusability, maintainability, and comprehensibility**.

Without these characteristics, it's impossible for multiple people to efficiently collaborate on a project. Without visibility, one person can't know what another person has already accomplished, thus useful code might not be reused. When code isn't reused, it's challenging to create maintainable systems. When everyone is constantly trying to figure out all the different parts that make up your project, almost no one can understand the project as a whole. As a result, you end up with silos, a decline in shared knowledge, and a corresponding degree of frustration among team members. It's a natural consequence when processes operate differently for each person.

Maven's birth came from a very practical desire: to have multiple Apache projects working in the same way. This would allow developers to move freely between these projects, understanding all projects by understanding the workings of one. If developers spend time understanding how one project is built, then when they move to the next project, they don't have to go through that process again. The same idea extends to testing, generating documentation, generating metrics and reports, testing, and deployment. All projects have enough common features, and Maven attempts to leverage an understanding of these features in its general approach to project management. At a very high level, all projects need to build, test, package, document, and deploy. Of course, there are infinite variations within each of these steps, but this variation still occurs within a well-defined scope, and Maven attempts to present this path in a clear manner to everyone. The simplest way to have a clear path is to provide a set of patterns that can be shared by anyone involved in the project.

## Maven Overview

Maven is a [Yiddish word](https://en.wikipedia.org/wiki/Maven) meaning *accumulator of knowledge* and was originally created to simplify the build process of the Jakarta Turbine project. There were several projects, each with their own Ant build files, but with slight differences.

We needed a standard way to build projects: a clear definition of project structure, a simple method to publish project information, and support for sharing JARs across multiple projects.

Maven is now a tool that can be used to build and manage any Java-based project. Maven aims to make the daily work of Java developers easier and aids in understanding any Java-based project.

## Goals of Maven

The primary goal of Maven is to enable developers to understand the complete state of their development work in the **shortest possible time**. To achieve this goal, Maven addresses several areas that need attention:

- Simplifying the build process
- Providing a uniform build system
- Offering quality project information
- Encouraging better development practices

### Simplifying the build process

While using Maven doesn't eliminate the need to understand the underlying mechanisms, it does shield developers from needing to understand many details.

### Providing a uniform build system

Maven uses its **Project Object Model (POM)** and a set of **plugins** to build projects. Once familiar with one Maven project, you know how all Maven projects are built. This saves time when browsing through many projects.

### Offering quality project information

Maven provides useful project information, partly derived from the POM and **partly generated from the project's sources**. For example, Maven can provide:

- **Change logs** created directly from source code management
- **Cross-reference sources**
- Mailing lists managed by the project
- **Dependencies** used by the project
- Unit test reports including coverage

Third-party code analysis products also provide Maven plugins to add their reports to the standard information provided by Maven.

### Encouraging best practice development

Maven aims to collect current best practices in development and gently guide projects in that direction.

Take unit testing, for example. The specification, execution, and reporting of unit tests are part of the normal build cycle with Maven. Current best practices for unit testing include:

- Keeping test source code in a separate but parallel source tree
- Using test case naming conventions to locate and execute tests
- Letting test cases set up their environment rather than customizing build setup

Maven also assists with project workflows, such as release and issue management.

Maven also recommends a certain project directory layout. Once you understand the layout, you can easily work with other Maven projects. Due to historical reasons, some projects might not fit into this structure. While Maven is designed to be flexible to accommodate different project needs, it cannot satisfy all needs without affecting its goals.

If your project has an unusual build structure that can't be reorganized, you may have to forego some features of Maven or abandon its use altogether.

## What Maven Isn't

You may have heard some of the following about Maven:

- Maven is a site and documentation tool.
- Maven extends Ant to allow you to download dependencies.
- Maven is a set of reusable Ant scriptlets.

While Maven can do these things, as you can read in the above "What is Maven?" section, these aren't Maven's only functions, and its goals are quite different.
