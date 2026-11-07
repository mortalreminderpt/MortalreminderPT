---
layout: post 
title: Maven（十三）可选（optional）依赖项和依赖项排除（exclusion）
description:
date: 2023-12-05 17:01:56 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. 目录
{:toc}

本节将讨论可选依赖项和依赖项排除。这将有助于用户了解它们是什么，以及何时和如何使用它们。本节还解释了为什么要按依赖关系而不是在 POM 层级进行排除。

## 可选依赖项（Optional Dependencies）

可选依赖项用于无法（无论出于何种原因）将项目拆分成子模块的情况。我们的想法是，某些依赖项只用于项目中的某些功能，如果不使用该功能，就不需要这些依赖项。理想情况下，这样的功能会被拆分成一个依赖于核心功能项目的子模块。这个新的子项目将只有非选择性的依赖关系，因为如果您决定使用该子项目的功能，就会需要所有这些依赖关系。

但是，由于项目无法拆分（同样，无论出于什么原因），这些依赖关系被声明为可选。如果用户想使用与可选依赖项相关的功能，就必须在自己的项目中重新声明该可选依赖项。这并不是处理这种情况的最明确方法，但可选依赖和依赖排除都是权宜之计。

### 为什么使用可选依赖项？

可选依赖项可以节省空间和内存。它们能防止有问题的 jar（违反许可协议或导致 classpath 问题）被捆绑到 WAR、EAR、fat jar 或类似文件中。

### 如何使用可选标签？

通过在依赖关系声明中将 `<optional>` 元素设置为 true，可将依赖关系声明为可选：

```xml
<project>
  ...
  <dependencies>
    <!-- declare the dependency to be set as optional -->
    <dependency>
      <groupId>sample.ProjectA</groupId>
      <artifactId>Project-A</artifactId>
      <version>1.0</version>
      <scope>compile</scope>
      <optional>true</optional> <!-- value will be true or false only -->
    </dependency>
  </dependencies>
</project>
```

### 可选依赖项如何工作？

```
Project-A -> Project-B
```

上图表示项目 A 依赖于项目 B。当 A 在其 POM 中将 B 声明为可选依赖项时，这种关系将保持不变。这就像正常编译一样，Project-B 会被添加到 Project-A 的 classpath 中。

```
Project-X -> Project-A
```

当另一个项目（Project-X）在其 POM 中将 项目-A 声明为依赖关系时，依赖关系的可选性就会生效。项目-B 并不包含在项目-X 的 classpath 中。您需要在项目-X 的 POM 中直接声明，这样 B 才能包含在 X 的 classpath 中。

### 示例

假设有一个名为 X2 的项目，其功能与 Hibernate 类似。它支持多种数据库，如 MySQL、PostgreSQL 和多个版本的 Oracle。每个受支持的数据库都需要额外依赖一个驱动 jar。编译 X2 时需要所有这些依赖项。但是，您的项目只使用一个特定的数据库，不需要其他数据库的驱动程序。X2 可以将这些依赖项声明为可选项，这样当项目在其 POM 中将 X2 声明为直接依赖项时，X2 支持的所有驱动程序就不会自动包含在项目的 classpath 中。您的项目必须为其使用的数据库的特定驱动程序加入明确的依赖关系。

## 依赖项排除（Dependency Exclusions）

由于 Maven 是临时解析依赖关系的，因此有可能在项目的 classpath 中包含不需要的依赖关系。例如，某个较旧的 jar 可能存在安全问题，或者与您正在使用的 Java 版本不兼容。为了解决这个问题，Maven 允许您排除特定的依赖项。排除项设置在 POM 中的特定依赖项上，并针对特定的 groupId 和 artifactId。在构建项目时，该工件将不会通过声明了排除的依赖关系添加到项目的 classpath 中。

### 如何使用依赖项排除

在 `<dependency>` 元素中添加`<exclusions>` 元素，通过该元素将有问题的 jar 包括在内。

```xml
<project>
  ...
  <dependencies>
    <dependency>
      <groupId>sample.ProjectA</groupId>
      <artifactId>Project-A</artifactId>
      <version>1.0</version>
      <scope>compile</scope>
      <exclusions>
        <exclusion>  <!-- declare the exclusion here -->
          <groupId>sample.ProjectB</groupId>
          <artifactId>Project-B</artifactId>
        </exclusion>
      </exclusions> 
    </dependency>
  </dependencies>
</project>
```

### 依赖关系排除如何运作以及何时使用 **（作为最后手段！）**

```xml
Project-A
   -> Project-B
        -> Project-D <!-- This dependency should be excluded -->
              -> Project-E
              -> Project-F
   -> Project C
```

图中显示，项目 A 依赖于项目 B 和 C，项目 B 依赖于项目 D。默认情况下，项目 A 的 classpath 包括

```
B, C, D, E, F
```

假设您不希望项目 D 及其依赖项被添加到项目 A 的 classpath 中，因为项目 D 的某些依赖项从资源库中丢失了，而且您也不需要项目 B 中依赖于项目 D 的功能。项目 B 的开发人员本可以将项目 D 的依赖关系标记为 `<optional>true</optional>`：

```xml
<dependency>
  <groupId>sample.ProjectD</groupId>
  <artifactId>ProjectD</artifactId>
  <version>1.0-SNAPSHOT</version>
  <optional>true</optional>
</dependency>
```

不幸的是，他们没有这样做。万不得已，您可以在自己的项目 A POM 中这样排除它：

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>sample.ProjectA</groupId>
  <artifactId>Project-A</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>jar</packaging>
  ...
  <dependencies>
    <dependency>
      <groupId>sample.ProjectB</groupId>
      <artifactId>Project-B</artifactId>
      <version>1.0-SNAPSHOT</version>
      <exclusions>
        <exclusion>
          <groupId>sample.ProjectD</groupId> <!-- Exclude Project-D from Project-B -->
          <artifactId>Project-D</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>
</project>
```

如果将项目-A 部署到资源库，而项目-X 声明对项目-A 的正常依赖，那么项目-D 还会被排除在 classpath 之外吗？

```
Project-X -> Project-A
```

答案是肯定的。项目 A 已声明它不需要项目 D 来运行，因此它不会作为项目 A 的传递依赖关系被引入。

现在，考虑项目-X 依赖于项目-Y，如下图所示：

```
Project-X -> Project-Y
               -> Project-B
                    -> Project-D
                       ...
```

项目 Y 也依赖于项目 B，而且它确实需要项目-D 支持的功能。因此，它不会在其依赖关系列表中排除项目-D。项目-Y 还可能提供一个额外的资源库，以解决项目-E 的问题。在这种情况下，重要的是项目-D 不会被全局排除，因为它是项目-Y 的合法依赖关系。

在另一种情况下，假设你不想要的依赖关系是 Project-E，而不是 Project-D。如何将其排除在外？请看下图：

```xml
Project-A
   -> Project-B
        -> Project-D 
              -> Project-E <!-- Exclude this dependency -->
              -> Project-F
   -> Project C
```

排除对声明点以下的整个依赖关系图都有效。如果想排除项目-E，而不是项目-D，只需将排除改为指向项目-E，但不能将排除向下移动到项目-D。您不能更改项目-D 的 POM。如果可以，你就可以使用可选依赖项来代替排除项，或者将项目-D 拆分成多个子项目，每个子项目都只包含正常的依赖项。

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>sample.ProjectA</groupId>
  <artifactId>Project-A</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>jar</packaging>
  ...
  <dependencies>
    <dependency>
      <groupId>sample.ProjectB</groupId>
      <artifactId>Project-B</artifactId>
      <version>1.0-SNAPSHOT</version>
      <exclusions>
        <exclusion>
          <groupId>sample.ProjectE</groupId> <!-- Exclude Project-E from Project-B -->
          <artifactId>Project-E</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
  </dependencies>
</project>
```

### 为什么要按依赖关系而不是在 POM 层面进行排除

这主要是为了确保依赖关系图是可预测的，并防止继承效应将不应该被排除的依赖关系排除在外。如果您到了万不得已的地步，不得不使用排除法，那么您应该绝对确定是哪个依赖关系带来了不需要的传递依赖关系。

如果您真的想确保某个特定依赖关系不会出现在 classpath 中（无论路径如何），那么可以配置禁止依赖关系规则，以便在发现有问题的依赖关系时使构建失败。当编译失败时，你需要在 enforcer 发现的每个路径上添加特定的排除项。
