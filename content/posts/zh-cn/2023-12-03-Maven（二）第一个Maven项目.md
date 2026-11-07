---
layout: post 
title: Maven（二）第一个Maven项目
description:
date: 2023-12-03 11:05:54 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. 目录
{:toc}

## 第一个Maven项目

我们将立即开始创建您的第一个 Maven 项目！为了创建我们的第一个 Maven 项目，我们将使用 Maven 的原型（Archetypes）机制。原型被定义为**一种原始模式或模型，所有其他同类事物都是由它构成的**。在 Maven 中，**原型是一个项目模板**，它与一些用户输入相结合，生成一个根据用户需求定制的工作 Maven 项目。我们现在将向您展示原型机制是如何工作的，但是如果您想了解有关原型的更多信息，请参阅我们的[原型简介](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html)。

开始创建您的第一个项目！为了创建最简单的 Maven 项目，请从命令行执行以下命令：

```bash
mvn -B archetype:generate -DgroupId=com.mycompany.app -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4
```

执行此命令后，您会注意到发生了一些事情。首先，您会注意到一个名为`my-app`的目录被创建，并且该目录包含一个文件`pom.xml`，该文件应如下所示：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
 
  <groupId>com.mycompany.app</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0-SNAPSHOT</version>
 
  <name>my-app</name>
  <!-- FIXME change it to the project's website -->
  <url>http://www.example.com</url>
 
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
  </properties>
 
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.11</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
 
  <build>
    <pluginManagement><!-- lock down plugins versions to avoid using Maven defaults (may be moved to parent pom) -->
       ... lots of helpful plugins
    </pluginManagement>
  </build>
</project>
```

`pom.xml`包含该项目的项目对象模型 （POM）。**POM 是 Maven 中的基本工作单元**。记住这一点很重要，因为 **Maven 本质上是以项目为中心的，一切都围绕项目的概念**。简而言之，POM 包含有关您的项目的每一条重要信息，并且本质上是查找与您的项目相关的任何内容的一站式服务。了解 POM 很重要，鼓励新用户参考[POM 简介](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)。

这是一个非常简单的 POM，但仍然显示每个 POM 包含的关键元素，因此让我们逐一介绍它们，让您熟悉 POM 要点：

- **project** 这是所有 Maven pom.xml 文件中的顶级元素。
- **modelVersion** 该元素指示该 POM 使用的对象模型的版本。**模型本身的版本很少更改**，但是当 Maven 开发人员认为有必要更改模型时，为了确保使用的稳定性，这是强制性的。
- **groupId** 该元素指示创建项目的组织或组的唯一标识符。groupId 是项目的关键标识符之一，通常基于组织的完全限定域名。例如`org.apache.maven.plugins`为所有 Maven 插件指定的 groupId。
- **artifactId** 该元素指示**由该项目生成的主要工件的唯一基本名称**。项目的主要工件通常是 JAR 文件。诸如源包之类的次要工件也使用artifactId作为其最终名称的一部分。Maven 生成的典型工件的格式为 \<artifactId>-\<version>.\<extension>（例如，`myapp-1.0.jar`）。
- **version** 该元素指示**项目生成的工件的版本**。Maven 在很大程度上帮助您进行版本管理，您经常会`SNAPSHOT`在版本中看到指示符，这表明**项目处于开发状态**。[我们将在本指南中讨论快照](https://maven.apache.org/guides/getting-started/index.html#what-is-a-snapshot-version)的使用以及它们如何进一步工作。
- **name** 该元素指示用于**项目的显示名称**。这在 **Maven 生成的文档中经常使用**。
- **url** 该元素指示可以找到项目站点的位置。这在 Maven 生成的文档中经常使用。
- **properties** 该元素包含**可在 POM 中的任何位置访问的值**占位符。
- **dependencies** **该元素的子项列出了[依赖项](https://maven.apache.org/pom.html#dependencies)**。POM 的基石。
- **build** 该元素处理诸如**声明项目的目录结构和管理插件**之类的事情。

有关可在 POM 中使用的元素的**完整参考**，请参阅我们的 [POM 参考](https://maven.apache.org/ref/current/maven-model/maven.html)。现在让我们回到手头的项目。

在第一个项目的原型生成之后，您还会注意到已创建以下目录结构：

```bash
my-app
|-- pom.xml
`-- src
    |-- main
    |   `-- java
    |       `-- com
    |           `-- mycompany
    |               `-- app
    |                   `-- App.java
    `-- test
        `-- java
            `-- com
                `-- mycompany
                    `-- app
                        `-- AppTest.java
```

正如您所看到的，从原型创建的项目有一个 POM、一个用于您的应用程序源的树和一个用于您的测试源的树。这是 Maven 项目的标准布局（应用程序源位于`${project.basedir}/src/main/java`，测试源位于`${project.basedir}/src/test/java`，其中 `${project.basedir}` 表示包含 的目录`pom.xml`）。

如果您要手动创建 Maven 项目，这是我们建议使用的目录结构。这是 Maven 约定，要了解更多信息，您可以阅读我们的[标准目录布局简介](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)。

现在我们有了 POM、应用程序源和测试源，接下来我们来看如何编译应用程序源代码和测试源代码。

## compile：编译应用程序源

切换到 `pom.xml` 所在的目录，并执行以下命令来编译应用程序源：

```bash
mvn compile
```

执行此命令后，可以看到如下输出：

```bash
[INFO] Scanning for projects...
[INFO]
[INFO] ----------------------< com.mycompany.app:my-app >----------------------
[INFO] Building my-app 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:resources (default-resources) @ my-app ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory <dir>/my-app/src/main/resources
[INFO]
[INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ my-app ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 1 source file to <dir>/my-app/target/classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  0.899 s
[INFO] Finished at: 2020-07-12T11:31:54+01:00
[INFO] ------------------------------------------------------------------------
```

第一次执行此（或任何其他）命令时，Maven 将**需要下载完成该命令所需的所有插件和相关依赖项**。从 Maven 的全新安装开始，这可能需要相当长的时间（在上面的输出中，几乎花了 4 分钟）。如果再次执行该命令，Maven 现在将拥有所需的内容，因此不需要下载任何新内容，并且能够更快地执行该命令。

从输出中可以看到，编译后的类被放置在 `${project.basedir}/target/classes`，这是 Maven 使用的另一个标准约定。

## test：编译测试源并运行单元测试

现在您已经成功编译了应用程序的源代码，并且现在您已经有了一些想要编译和执行的单元测试（因为每个程序员总是编写并执行他们的单元测试）。执行以下命令

```bash
mvn test
```

执行此命令后，您应该看到如下输出：

```bash
......
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.mycompany.app.AppTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.025 s - in com.mycompany.app.AppTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.881 s
[INFO] Finished at: 2020-07-12T12:00:33+01:00
[INFO] ------------------------------------------------------------------------
```

关于输出需要注意的一些事项：

- Maven 这次下载了更多依赖项。这些是执行测试所需的依赖项和插件（它已经具有编译所需的依赖项，不会再次下载它们）。
- 在编译和执行测试之前，Maven 会编译主要代码（所有这些类都是最新的，因为自上次编译以来我们没有更改任何内容）。

如果您只想编译测试源（但不执行测试），则可以执行以下命令：

```bash
mvn test-compile
```

现在您可以编译应用程序源代码、编译测试并执行测试。

**请注意，surefire 插件（执行测试）会查找具有特定命名约定的文件中包含的测试**。默认情况下，包含的测试有：

- `**/*Test.java`
- `**/Test*.java`
- `**/*TestCase.java`

默认排除是：

- `**/Abstract*Test.java`
- `**/Abstract*TestCase.java`

## package 和 install

制作 JAR 文件非常简单，可以通过执行以下命令来完成：

```
mvn package
```

现在您可以查看该`${project.basedir}/target`目录，您将看到生成的 JAR 文件。

但是，我们还需要将生成的工件（JAR 文件）**安装在本地存储库**（`${user.home}/.m2/repository`是默认位置）中。有关存储库的更多信息，您可以参阅我们的[存储库简介](https://maven.apache.org/guides/introduction/introduction-to-repositories.html)，但让我们继续安装我们的工件！为此，请执行以下命令：

```
mvn install
```

执行此命令后，您应该看到以下输出：

```bash
[INFO] Scanning for projects...
[INFO]
[INFO] ----------------------< com.mycompany.app:my-app >----------------------
[INFO] Building my-app 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:resources (default-resources) @ my-app ---
...
[INFO] --- maven-compiler-plugin:3.8.0:compile (default-compile) @ my-app ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-resources-plugin:3.0.2:testResources (default-testResources) @ my-app ---
...
[INFO] --- maven-compiler-plugin:3.8.0:testCompile (default-testCompile) @ my-app ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-surefire-plugin:2.22.1:test (default-test) @ my-app ---
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.mycompany.app.AppTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.025 s - in com.mycompany.app.AppTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-jar) @ my-app ---
[INFO] Building jar: <dir>/my-app/target/my-app-1.0-SNAPSHOT.jar
[INFO]
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ my-app ---
[INFO] Installing <dir>/my-app/target/my-app-1.0-SNAPSHOT.jar to <local-repository>/com/mycompany/app/my-app/1.0-SNAPSHOT/my-app-1.0-SNAPSHOT.jar
[INFO] Installing <dir>/my-app/pom.xml to <local-repository>/com/mycompany/app/my-app/1.0-SNAPSHOT/my-app-1.0-SNAPSHOT.pom
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.678 s
[INFO] Finished at: 2020-07-12T12:04:45+01:00
[INFO] ------------------------------------------------------------------------
```

您已经完成了设置、构建、测试、打包和安装典型 Maven 项目的过程。这可能是绝大多数项目将使用 Maven 进行的操作，如果您注意到的话，您到目前为止能够做的所有事情都是由 18 行文件（即项目的模型或 POM）驱动的。

## site 和 clean

Maven 提供了更多的功能，无需对目前的 POM 进行任何添加。

`mvn site` 是 Maven 备受推崇的功能之一，无需做任何工作，这个 POM 就有足够的信息来为您的项目生成一个网站！您很可能想要自定义您的 Maven 站点，但如果您时间紧迫，您只需执行该命令即可提供有关项目的基本信息。

`mvn clean` 将删除包含所有构建数据的目录`target`，使其保持干净。
