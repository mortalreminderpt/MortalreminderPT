---
layout: post 
title: Maven（十）配置文件（Profiles）简介
description:
date: 2023-12-05 11:33:35 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. 目录
{:toc}

Apache Maven 竭尽全力确保构建的可移植性。除其他事项外，这意味着允许在 POM 中进行构建配置，避免**所有文件系统引用**（在继承、依赖关系和其他地方），并更加依赖本地存储库来存储实现这一点所需的元数据。

不过，有时可移植性并不完全可行。在某些情况下，插件可能需要配置本地文件系统路径。在其他情况下，可能需要稍有不同的依赖关系集，项目的构件名称也可能需要稍作调整。有时，根据检测到的构建环境，甚至可能需要在构建生命周期中包含整个插件。

针对这些情况，Maven 支持构建配置文件。配置文件使用 POM 中可用元素的子集（外加一个额外部分）进行指定，并以多种方式触发。它们在构建时对 POM 进行修改，旨在通过互补集为一组目标环境提供等效但不同的参数（例如，提供开发、测试和生产环境中 appserver 根目录的路径）。因此，配置文件很容易导致团队中的不同成员产生不同的构建结果。不过，只要使用得当，配置文件仍能保持项目的可移植性。这也将最大限度地减少 maven 的 `-f` 选项的使用，该选项允许用户创建另一个 POM，并使用不同的参数或配置进行构建，这将使其更易于维护，因为它只使用一个 POM 运行。

## 有哪些不同的配置，在哪里定义

- 项目配置

  - 在 POM 文件中定义 `(pom.xml)`.

- 用户配置

  - 在用户 [Maven 设置](https://maven.apache.org/ref/current/maven-settings/settings.html) 中定义`(%USER_HOME%/.m2/settings.xml)`.

- 全局配置

  - 在全局 [Maven 设置](https://maven.apache.org/ref/current/maven-settings/settings.html) 中定义`(${maven.home}/conf/settings.xml)`.

- 配置文件描述

  - 位于项目 basedir（[profiles.xml]((https://maven.apache.org/ref/2.2.1/maven-profile/profiles.html))）中的描述符（Maven 3.0 及以上版本不再支持该描述符；请参阅 [Maven 3 兼容性说明](https://cwiki.apache.org/confluence/display/MAVEN/Maven+3.x+Compatibility+Notes#Maven3.xCompatibilityNotes-profiles.xml)）

## 配置激活

子 POM 不会像其他 POM 元素一样继承 Profiles。相反，它们很早就被 [Maven Model Builder](https://maven.apache.org/ref/3.9.6/maven-model-builder/) 解决了，只有激活的配置文件的效果才会被继承（例如配置文件中定义的插件）。这也导致隐式配置文件激活只会对周围的配置文件容器产生影响，而不会对任何其他配置文件（即使具有相同的 id）产生影响。

如何触发配置？根据使用的预案类型有何不同？
激活配置有几种方式：

- 显式
- 隐式
  - 基于操作系统
  - 基于系统属性
  - 基于文件的存在

### 配置激活细节

#### 显式激活

可以使用 `-P` 命令行标志明确指定配置文件。

该标志后跟一个以逗号分隔的配置文件 ID 列表。**除了通过激活配置或 `settings.xml` 中的 `<activeProfiles>` 元素激活的配置文件外，该选项中指定的配置文件也会被激活。**从 Maven 4 开始，Maven 将拒绝激活或停用无法解析的配置文件。为防止出现这种情况，请在配置文件标识符前加上 `?`

```bash
mvn groupId:artifactId:goal -P profile-1,profile-2,?profile-3
```

配置文件可在 Maven 设置中通过 `<activeProfiles>` 元素激活。该元素包含一个 `<activeProfile>` 的列表，每个元素内部都包含一个配置文件 ID：

```xml
<settings>
  ...
  <activeProfiles>
    <activeProfile>profile-1</activeProfile>
  </activeProfiles>
  ...
</settings>
```

`<activeProfiles>` 标记中列出的配置文件将在项目每次使用时默认激活。也可以在 POM 中使用类似下面的配置来默认激活配置文件：

```xml
<profiles>
  <profile>
    <id>profile-1</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    ...
  </profile>
</profiles>
```

该配置文件将在所有构建过程中自动激活，除非使用前述方法激活了同一 POM 中的另一个配置文件。**当通过命令行或激活配置激活 POM 中的配置文件时，默认激活的所有配置文件都会自动停用。**

#### 隐式激活

配置文件可根据检测到的构建环境状态自动触发。这些触发器是通过配置文件本身的 `<activation>` 部分指定的。**目前，这种检测仅限于 JDK 版本匹配、操作系统匹配或系统属性的存在/值**。隐式配置文件激活始终仅指容器配置文件（而不是具有相同 id 的其他模块中的配置文件）。下面是一些示例。

##### JDK 激活

当 JDK 的版本以 `1.4` 开头时（如 `1.4.0_08`、`1.4.2_07`、`1.4`），以下配置将触发配置文件，特别是对于较新的版本，如 `1.8` 或 `11`，配置文件将不起作用：

```xml
<profiles>
  <profile>
    <activation>
      <jdk>1.4</jdk>
    </activation>
    ...
  </profile>
</profiles>
```

也可以使用范围。范围值必须以 `[` 或 `(` 开头，否则该值将被解释为前缀。以下内容适用于 `1.3`、`1.4` 和 `1.5` 版本。

```xml
<profiles>
  <profile>
    <activation>
      <jdk>[1.3,1.6)</jdk>
    </activation>
    ...
  </profile>
</profiles>
```

**注意：`,1.5]` 这样的上限很可能不包括大多数 `1.5` 版本，因为它们会有一个额外的补丁版本，如 `_05`，而上述范围没有将其考虑在内。**

##### OS 激活

根据检测到的操作系统激活。有关操作系统值的更多详情，请参阅 [Maven Enforcer Plugin](https://maven.apache.org/enforcer/enforcer-rules/requireOS.html)。

```xml
<profiles>
  <profile>
    <activation>
      <os>
        <name>Windows XP</name>
        <family>Windows</family>
        <arch>x86</arch>
        <version>5.1.2600</version>
      </os>
    </activation>
    ...
  </profile>
</profiles>
```

##### property 激活

- 当系统属性 `debug` 被指定为任意值时，下面的配置文件将被激活：

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>debug</name>
      </property>
    </activation>
    ...
  </profile>
</profiles>
```

- 当系统属性 `debug` 完全未定义时，下面配置文件将被激活：

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>!debug</name>
      </property>
    </activation>
    ...
  </profile>
</profiles>
```

- 当系统属性 `debug` 未定义或定义值不为 `true` 时，下面配置文件将被激活：

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>debug</name>
        <value>!true</value>
      </property>
    </activation>
    ...
  </profile>
</profiles>
```

以下两种命令都可以激活前面提到的那个配置：

```bash
mvn groupId:artifactId:goal
mvn groupId:artifactId:goal -Ddebug=false
```

- 当系统属性 `environment` 指定为 `test` 时，下面配置文件将被激活：

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>environment</name>
        <value>test</value>
      </property>
    </activation>
    ...
  </profile>
</profiles>
```

要激活该配置文件，您可以在命令行中键入以下内容：

```bash
mvn groupId:artifactId:goal -Denvironment=test
```

从 Maven 3.0 开始，POM 中的配置文件也可以根据 `settings.xml` 中 `activeProfiles` 的属性激活。

注意：`FOO` 等环境变量可作为 `env.FOO` 形式的属性使用。此外，请注意环境变量名称在 Windows 系统中统一为大写。

- 自 Maven 3.9.0 起，还可以通过引用属性 `packaging` 来评估 POM 打包的值。这只有在多个 Maven 模块的共同父 POM 中定义了配置文件激活时才有用。下一个示例将在构建带有打包 war 的项目时触发配置文件：

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>packaging</name>
        <value>war</value>
      </property>
    </activation>
    ...
  </profile>
</profiles>
```

##### 文件激活

此示例将在生成的文件 `target/generated-sources/axistools/wsdl2java/org/apache/maven` 丢失时触发配置文件：

```xml
<profiles>
  <profile>
    <activation>
      <file>
        <missing>target/generated-sources/axistools/wsdl2java/org/apache/maven</missing>
      </file>
    </activation>
    ...
  </profile>
</profiles>
```

标签 `<exists>` 和 `<missing>` 可以内插。支持的变量包括系统属性（如 `${user.home}`）和环境变量（如 `${env.HOME}`）。

**请注意，在 POM 中定义的属性和值在这里不能用于插值**。例如，上述示例中的激活程序不能使用 `${project.build.directory}`，而需要硬编码目标路径。

#### 多种条件激活

不同的隐式激活类型可组合在一个配置文件中。只有满足所有条件，配置文件才会激活（自 Maven 3.2.2 起，[MNG-4565](https://issues.apache.org/jira/browse/MNG-4565)）。不支持在同一配置文件中多次使用同一类型（[MNG-5909](https://issues.apache.org/jira/browse/MNG-5909)、[MNG-3328](https://issues.apache.org/jira/browse/MNG-3328)）。

### 停用配置文件

可使用命令行停用一个或多个配置文件，方法是在其标识符前添加 `!` 或 `-` 字符，如下所示。

请注意，在 Bash、ZSH 和其他 shell 中，`!` 需要用 `\` 或引号括起来，因为它有特殊含义。此外，以 `-` 开头的命令行选项值存在一个已知的 bug（[CLI-309](https://issues.apache.org/jira/browse/CLI-309)），因此建议使用 `-P=-profilename` 语法。

```bash
mvn groupId:artifactId:goal -P \!profile-1,\!profile-2,\!?profile-3
## 或者
mvn groupId:artifactId:goal -P=-profile-1,-profile-2,-?profile-3
```

这可用于停用标记为 activeByDefault 的配置文件或通过激活配置激活的配置文件。

## 配置可以指定的内容

我们已经讨论了在哪里指定配置以及如何激活配置，那么讨论一下在配置中可以指定哪些内容将是非常有用的。与预案配置的其他方面一样，这个问题的答案并不简单。

根据您选择配置文件的位置，您可以访问不同的 POM 配置选项。

### 外部文件配置

在外部文件（即 `settings.xml` 或 `profiles.xml`）中指定的配置文件从严格意义上讲是不可移植的。任何看似很有可能改变构建结果的内容都仅限于 POM 中的内联配置文件。像版本库列表这样的东西可能只是已有项目的专有版本库，不会改变构建结果。因此，您只能修改 `<repositories>` 和 `<pluginRepositories>` 部分，以及额外的 `<properties>` 部分。

`<properties>` 部分允许您指定自由形式的键值对，这些键值对将包含在 POM 的插值过程中。这样，您就可以以 `${profile.provided.path}` 的形式指定插件配置。

### POM 配置

另一方面，如果可以在 POM 中合理指定配置文件，您就会有更多选择。当然，这样做的代价是您只能修改该项目及其子模块。由于这些配置文件是内联指定的，因此有更好的机会保持可移植性，因此可以说您可以在其中添加更多信息，而不会有其他用户无法获得这些信息的风险。

POM 中指定的配置文件可以修改[以下 POM 元素](https://maven.apache.org/ref/3.9.6/maven-model/maven.html)：

- `<repositories>`
- `<pluginRepositories>`
- `<dependencies>`
- `<plugins>`
- `<properties>` （实际上不在主 POM 中提供，但在幕后使用）
- `<modules>`
- `<reports>`
- `<reporting>`
- `<dependencyManagement>`
- `<distributionManagement>`
- `<build>` 元素的子集，其中包括：
  - `<defaultGoal>`
  - `<resources>`
  - `<testResources>`
  - `<directory>`
  - `<finalName>`
  - `<filters>`
  - `<pluginManagement>`
  - `<plugins>`

### `<profiles>` 以外的 POM 元素

我们不允许在 POM 配置文件之外修改某些 POM 元素，因为当 POM 被部署到版本库系统时，这些运行时修改将不会被分发，从而使该人构建的项目与其他项目完全不同。虽然您可以通过外部配置文件的选项在一定程度上做到这一点，但其危险性是有限的。另一个原因是，这些 POM 信息有时会从父 POM 中重复使用。

外部文件（如 `settings.xml` 和 `profiles.xml`）也不支持 POM 文件之外的元素。让我们来详细说明一下这种情况。当有效的 POM 部署到远程版本库时，任何人都可以从版本库中获取其信息并直接用于构建 Maven 项目。现在，试想一下，**如果我们可以在依赖项（这对构建非常重要）中设置配置文件，或者在 `settings.xml` 中设置 `POM-profiles` 以外的任何其他元素，那么我们就很可能无法指望其他人使用该版本库中的 POM 并构建它。**我们还必须考虑如何与他人共享 `settings.xml`。请注意，配置文件过多会造成混乱，也很难维护。总之，既然这是构建数据，就应该放在 POM 中。

## 配置优先级

在一个 POM 中，来自激活的配置文件的所有配置文件元素都会覆盖 POM 中同名的全局元素，或在集合的情况下扩展全局元素。如果在同一 POM 或外部文件中激活了多个配置文件，则**后面定义的配置文件优先于前面定义的配置文件**（与配置文件 ID 和激活顺序无关）。

示例：

```xml
<project>
  ...
  <repositories>
    <repository>
      <id>global-repo</id>
      ...
    </repository>
  </repositories>
  ...
  <profiles>
    <profile>
      <id>profile-1</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <repositories>
        <repository>
          <id>profile-1-repo</id>
          ...
        </repository>
      </repositories>
    </profile>
    <profile>
      <id>profile-2</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <repositories>
        <repository>
          <id>profile-2-repo</id>
          ...
        </repository>
      </repositories>
    </profile>
    ...
  </profiles>
  ...
</project>
```

这将导致版本库列表：`profile-2-repo`、`profile-1-repo`、`global-repo`。



## 配置误区

我们已经提到，在构建中添加配置文件有可能会破坏项目的可移植性。我们甚至还强调了在哪些情况下配置文件可能会破坏项目的可移植性。不过，作为关于使用配置文件时应避免的一些误区，我们还是值得重申这些观点。

使用配置文件时，有两个主要问题领域需要注意。首先是**外部属性**，通常用于插件配置。这些属性可能会破坏项目的可移植性。另一个更微妙的方面是**对自然环境集的配置的不规范**。

### 外部属性定义

外部属性定义是指在 pom.xml 之外定义的、但未在其中相应配置文件中定义的任何属性值。在 POM 中最明显的用法是插件配置。缺少属性当然会破坏项目的可移植性，这些小错误会产生微妙的影响，导致构建失败。例如，在 settings.xml 中指定的配置文件中指定 appserver 路径，可能会导致团队中的其他用户在没有类似 settings.xml 的情况下尝试构建集成测试插件时失败。下面是一个网络应用程序项目的 pom.xml 片段：

```xml
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <groupId>org.myco.plugins</groupId>
        <artifactId>spiffy-integrationTest-plugin</artifactId>
        <version>1.0</version>
        <configuration>
          <appserverHome>${appserver.home}</appserverHome>
        </configuration>
      </plugin>
      ...
    </plugins>
  </build>
  ...
</project>
```

此时，在您的本地 `${user.home}/.m2/settings.xml` 中有：

```xml
<settings>
  ...
  <profiles>
    <profile>
      <id>appserverConfig</id>
      <properties>
        <appserver.home>/path/to/appserver</appserver.home>
      </properties>
    </profile>
  </profiles>
 
  <activeProfiles>
    <activeProfile>appserverConfig</activeProfile>
  </activeProfiles>
  ...
</settings>
```

当您构建集成测试生命周期阶段时，您的集成测试通过了，因为您提供的路径允许测试插件安装和测试此 Web 应用程序。

然而，当你的同事尝试构建集成测试时，他的构建却大败而归，抱怨说无法解析插件配置参数 `<appserverHome>`，更糟糕的是，该参数的值字面意思是 `${appserver.home}` 无效（如果它警告你的话）。

恭喜你，你的项目现在是不可移植的了。在 `pom.xml` 中内嵌此配置文件有助于缓解这一问题，但明显的缺点是，每个项目层次结构（考虑到继承的影响）现在都必须指定此信息。由于 Maven 为项目继承提供了良好的支持，因此可以将此类配置放在团队级 POM 的 `<pluginManagement>` 部分或类似内容中，然后简单地继承路径即可。

另一个不那么吸引人的答案可能是开发环境的标准化。不过，这往往会影响 Maven 所能带来的生产力提升。

### 自然环境配置的不规范

除了上述的可移植性问题外，您的配置文件还很容易无法涵盖所有情况。如果这样做，通常就会让目标环境中的某一个环境陷入困境。让我们再看一次上面的 `pom.xml` 示例片段：

```xml
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <groupId>org.myco.plugins</groupId>
        <artifactId>spiffy-integrationTest-plugin</artifactId>
        <version>1.0</version>
        <configuration>
          <appserverHome>${appserver.home}</appserverHome>
        </configuration>
      </plugin>
      ...
    </plugins>
  </build>
  ...
</project>
```

现在，请看下面的配置文件，它将在 `pom.xml` 中以内联方式指定：

```xml
<project>
  ...
  <profiles>
    <profile>
      <id>appserverConfig-dev</id>
      <activation>
        <property>
          <name>env</name>
          <value>dev</value>
        </property>
      </activation>
      <properties>
        <appserver.home>/path/to/dev/appserver</appserver.home>
      </properties>
    </profile>
 
    <profile>
      <id>appserverConfig-dev-2</id>
      <activation>
        <property>
          <name>env</name>
          <value>dev-2</value>
        </property>
      </activation>
      <properties>
        <appserver.home>/path/to/another/dev/appserver2</appserver.home>
      </properties>
    </profile>
  </profiles>
  ..
</project>
```

该配置文件与上一个示例中的配置文件非常相似，但有几个重要的例外：它明显面向开发环境，添加了一个名为 `appserverConfig-dev-2` 的新配置文件，并且有一个激活部分，当系统属性包含 `env=dev`（用于名为 `appserverConfig-dev` 的配置文件）和 `env=dev-2`（用于名为 `appserverConfig-dev-2` 的配置文件）时，将触发将其包含在内。因此，执行命令：

```bash
mvn -Denv=dev-2 integration-test
```

可以成功构建，使用名为 `appserverConfig-dev-2` 的配置给出的属性。而且，当我们执行：

```bash
mvn -Denv=dev integration-test
```

将使用名为 appserverConfig-dev 的配置文件给出的属性成功构建。但是，执行：

```bash
mvn -Denv=production integration-test
```

无法成功构建。为什么？因为由此产生的 `${appserver.home}` 属性不是部署和测试网络应用的有效路径。在编写配置文件时，我们没有考虑生产环境的情况。生产环境（env=production）与测试环境，甚至可能与本地环境一起，构成了我们可能要构建集成测试生命周期阶段的一组自然目标环境。这组自然环境的不完整说明意味着我们实际上将有效的目标环境限制在了开发环境中。您的队友（可能还有您的经理）不会觉得这很幽默。因此当构建配置文件以处理此类情况时，请务必处理整个目标排列集。

另外，用户特定配置文件也可以以类似方式运行。这意味着，当团队添加了新的开发人员时，与用户相关的处理不同环境的配置文件就会启动。虽然我认为这可以作为对新手的有用培训，但以这种方式把他们扔到狼群中并不好。再次强调，一定要考虑到整套配置文件。

## 如何判断哪些配置文件在构建过程中生效？

确定激活的配置文件有助于用户了解在构建过程中执行了哪些特定配置文件。我们可以使用 [Maven Help Plugin](https://maven.apache.org/plugins/maven-help-plugin/) 来了解在构建过程中执行了哪些配置文件。

```bash
mvn help:active-profiles
```

让我们通过一些小示例来进一步了解该插件的 active-profiles 目标。

从 `pom.xml` 中最后一个配置文件示例中，你会发现有两个名为 `appserverConfig-dev` 和 `appserverConfig-dev-2` 的配置文件，它们的属性值各不相同。如果我们继续执行：

```bash
mvn help:active-profiles -Denv=dev
```

结果将是一个列表，列出激活属性为 `env=dev` 的配置文件 id 以及声明该配置文件的源代码。请看下面的示例：

```bash
The following profiles are active:

 - appserverConfig-dev (source: pom)
```

现在，如果我们在 settings.xml 中声明了一个配置文件（请参阅 settings.xml 中的配置文件示例），并将其设置为激活的配置文件并执行：

```bash
mvn help:active-profiles
```

结果应该是这样的：

```bash
The following profiles are active:

 - appserverConfig (source: settings.xml)
```

尽管我们没有激活属性，但某个配置文件已被列为激活状态。为什么？就像我们之前提到的，在 settings.xml 中设置为`<activeProfiles>`的配置会自动激活。

现在，如果我们在 settings.xml 中将某个配置文件设置为`<activeProfiles>`，并在 POM 中触发了一个配置文件。你认为哪个配置文件会对构建产生影响？

```bash
mvn help:active-profiles -P appserverConfig-dev
```

这将列出已激活的配置文件：

```bash
The following profiles are active:

 - appserverConfig-dev (source: pom)
 - appserverConfig (source: settings.xml)
```

尽管它列出了两个活动配置文件，但我们并不确定其中的哪一个被应用。要查看对构建的影响，请执行：

```bash
mvn help:effective-pom -P appserverConfig-dev
```

这将把该构建配置的有效 POM 打印到控制台。请注意，`settings.xml` 中的配置文件比 POM 中的配置文件优先级更高。因此这里应用的配置文件是 `appserverConfig`，而不是 `appserverConfig-dev`。

如果要将插件的输出重定向到名为 `effective-pom.xml` 的文件，请使用命令行选项 `-Doutput=effective-pom.xml`。

## 命名规范

现在你已经注意到，配置文件是解决不同目标环境下不同构建配置要求问题的一种自然方法。在上文，我们讨论了解决这种情况的“自然配置文件集”概念，以及考虑所需的整个配置文件集的重要性。

然而，如何组织和管理这组资料的演变也是一个非同小可的问题。正如优秀的开发人员会努力编写**自文档化代码**一样，您的配置文件 id 也必须提示其预期用途。一个好的方法是使用通用的系统属性触发器作为配置文件名称的一部分。**这可能会导致由系统属性 `env` 触发的配置文件名称如 `env-dev`、`env-test` 和 `env-prod`。这样的系统为如何激活针对特定环境的联编留下了非常直观的提示**。因此，要激活针对测试环境的构建，需要发出以下命令来激活 env-test：

```bash
mvn -Denv=test <phase>
```

只需将配置文件 id 中的`=`替换为`-`，即可获得正确的命令行选项。
