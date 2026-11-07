---
layout: post 
title: Maven (Part 10) - Introduction to Configuration Files (Profiles)
description:
date: 2023-12-05 11:33:35 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. Table of Contents
{:toc}

Apache Maven strives to ensure the portability of builds. Among other things, this means allowing build configurations in the POM, avoiding **all filesystem references** (in inheritance, dependencies, and elsewhere), and relying more on local repositories to store the metadata needed to achieve this.

However, sometimes portability isn't entirely feasible. In some cases, plugins may need to configure local filesystem paths. In others, slightly different sets of dependencies might be required, and even the artifact names of projects might need slight adjustments. Sometimes, entire plugins might need to be included in the build lifecycle depending on the detected build environment.

For these scenarios, Maven supports configuration files. Configuration files are specified using a subset of elements available in the POM (plus an additional part) and are triggered in various ways. They modify the POM during the build, aiming to provide equivalent but different parameters for a set of target environments through complementary sets (e.g., providing paths to appserver root directories in development, testing, and production environments). As a result, configuration files can easily lead to different build results among different members of a team. However, when used properly, they can still maintain the project's portability. This also minimizes the use of Maven's `-f` option, which allows users to create another POM and build with different parameters or configurations, making it easier to maintain as it only uses one POM.

## Different Types of Configuration Files and Where They're Defined

- Project Configuration

  - Defined in the POM file `(pom.xml)`.

- User Configuration

  - Defined in the user's [Maven settings](https://maven.apache.org/ref/current/maven-settings/settings.html) `(%USER_HOME%/.m2/settings.xml)`.

- Global Configuration

  - Defined in the global [Maven settings](https://maven.apache.org/ref/current/maven-settings/settings.html) `(${maven.home}/conf/settings.xml)`.

- Configuration File Descriptors

  - Descriptors located in the project basedir ([profiles.xml](https://maven.apache.org/ref/2.2.1/maven-profile/profiles.html)) (Profiles XML is no longer supported in Maven 3.0 and above; see [Maven 3 Compatibility Notes](https://cwiki.apache.org/confluence/display/MAVEN/Maven+3.x+Compatibility+Notes#Maven3.xCompatibilityNotes-profiles.xml))

## Activation of Configurations

Sub POMs do not inherit Profiles like other POM elements. Instead, they are resolved very early by the [Maven Model Builder](https://maven.apache.org/ref/3.9.6/maven-model-builder/), and only the effects of activated profiles will be inherited (e.g., plugins defined in profiles). This also results in implicit profile activation only affecting surrounding profile containers and not any other profiles (even with the same id).

How are configurations triggered? What are the different types of activation based on the type of scenario used?

### Details of Configuration Activation

#### Explicit Activation

Configuration files can be explicitly specified using the `-P` command-line flag.

The flag is followed by a comma-separated list of profile IDs. **In addition to profiles activated through profile activation or the `<activeProfiles>` element in `settings.xml`, profiles specified in this option will also be activated.** Starting from Maven 4, Maven will reject profiles that cannot be resolved for activation or deactivation. To prevent this, prefix the profile identifier with `?`.

```bash
mvn groupId:artifactId:goal -P profile-1,profile-2,?profile-3
```

Profiles can be activated in Maven settings using the `<activeProfiles>` element. This element contains a list of `<activeProfile>` elements, each containing a profile ID:

```xml
<settings>
  ...
  <activeProfiles>
    <activeProfile>profile-1</activeProfile>
  </activeProfiles>
  ...
</settings>
```

Profiles listed in the `<activeProfiles>` tag will be activated by default every time the project is used. You can also use configurations similar to the following in the POM to activate profiles by default:

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

This profile will be automatically activated in all builds unless another profile in the same POM is activated using the aforementioned methods. **When profiles in the POM are activated via command-line or activated profiles, all profiles activated by default are automatically deactivated.**

#### Implicit Activation

Configuration files can be triggered automatically based on the detected build environment state. These triggers are specified through the `<activation>` section of the configuration file itself. **Currently, this detection is limited to matching JDK versions, matching operating systems, or the existence/value of system properties.** Implicit profile activation always applies to profile containers (rather than profiles in other modules with the same id). Below are some examples.

##### JDK Activation

The following configuration will trigger the profile when the JDK version starts with `1.4` (e.g., `1.4.0_08`, `1.4.2_07`, `1.4`). For newer versions like `1.8` or `11`, the profile won't take effect:

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

Ranges can also be used. The range value must start with `[` or `(`; otherwise, the value will be interpreted as a prefix. The following applies to versions `1.3`, `1.4`, and `1.5`.

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

**Note: An upper limit like `,1.5]` is likely to exclude most `1.5` versions as they have an additional patch version like `_05`, which isn't considered in the range above.**

##### OS Activation

Activation based on the detected operating system. For more details on operating system values, refer to the [Maven Enforcer Plugin](https://maven.apache.org/enforcer/enforcer-rules/requireOS.html).

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

##### Property Activation

- The following profile will be activated when the system property `debug` is specified with any value:

```xml
<profiles>
  <profile>
    <activation>
      <property>
        <name>debug</name>
      </property>
    </activation>
    ...
  </

profile>
</profiles>
```

- The following profile will be activated when the system property `debug` is not defined at all:

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

- The following profile will be activated when the system property `debug` is either not defined or defined with a value other than `true`:

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

Both of the following commands can activate the aforementioned profile:

```bash
mvn groupId:artifactId:goal
mvn groupId:artifactId:goal -Ddebug=false
```

- The following profile will be activated when the system property `environment` is specified as `test`:

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

To activate this profile, you can type the following in the command line:

```bash
mvn groupId:artifactId:goal -Denvironment=test
```

Starting from Maven 3.0, profiles in the POM can also be activated based on the attributes in `activeProfiles` from `settings.xml`.

Note: Environment variables like `FOO` can be used as properties in the form of `env.FOO`. Also, note that environment variable names are standardized to uppercase on Windows systems.

- From Maven 3.9.0 onwards, it's also possible to evaluate the packaging of the POM by referencing the `packaging` property. This is only useful when configuration file activation is defined in a common parent POM of multiple Maven modules. The following example will trigger the profile when building a project with packaging `war`:

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

##### File Activation

This example will trigger the profile when the generated file `target/generated-sources/axistools/wsdl2java/org/apache/maven` is missing:

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

Tags `<exists>` and `<missing>` can be interpolated. Supported variables include system properties (like `${user.home}`) and environment variables (like `${env.HOME}`).

**Note that properties and values defined in the POM cannot be used for interpolation here.** For example, the activation in the above example cannot use `${project.build.directory}` and needs to hardcode the target path.

#### Multiple Condition Activation

Different types of implicit activation can be combined in one configuration file. The profile will only be activated if all conditions are met (since Maven 3.2.2, [MNG-4565](https://issues.apache.org/jira/browse/MNG-4565)). Using the same type multiple times in the same profile is not supported ([MNG-5909](https://issues.apache.org/jira/browse/MNG-5909), [MNG-3328](https://issues.apache.org/jira/browse/MNG-3328)).
### Disabling Configuration Files

To disable one or more configuration files via the command line, you can prepend the identifier of the file with either `!` or `-`, as shown below.

Please note that in Bash, ZSH, and other shells, `!` needs to be escaped with `\` or enclosed in quotes because it has a special meaning. Additionally, there's a known bug with command-line option values starting with `-` ([CLI-309](https://issues.apache.org/jira/browse/CLI-309)), so it's recommended to use the syntax `-P=-profilename`.

```bash
mvn groupId:artifactId:goal -P \!profile-1,\!profile-2,\!?profile-3
## Or
mvn groupId:artifactId:goal -P=-profile-1,-profile-2,-?profile-3
```

This can be used to disable configuration files marked as activeByDefault or activated through profile activation.

## Content that can be Specified in Configurations

We've discussed where configurations can be specified and how to activate them, so it's useful to discuss what content can be specified within configurations. Like other aspects of profile configurations, the answer to this question isn't straightforward.

Depending on where you choose to specify configuration files, you'll have access to different POM configuration options.

### External File Configurations

Configuration files specified in external files (such as `settings.xml` or `profiles.xml`) are strictly non-portable. Any content that seems likely to change the build result is limited to the inline configuration files in the POM. Things like repository lists may just be proprietary repositories for existing projects and won't change the build result. Therefore, you can only modify the `<repositories>` and `<pluginRepositories>` sections, along with additional `<properties>` sections.

The `<properties>` section allows you to specify key-value pairs in a free-form manner, which will be included in the POM's interpolation process. This way, you can specify plugin configurations as `${profile.provided.path}`.

### POM Configurations

On the other hand, if it's reasonable to specify configurations within the POM, you'll have more options. Of course, the trade-off here is that you can only modify that project and its submodules. Since these configuration files are specified inline, there's a better chance of maintaining portability, so you can add more information without the risk of other users not getting that information.

Configurations specified within the POM can modify the following POM elements:

- `<repositories>`
- `<pluginRepositories>`
- `<dependencies>`
- `<plugins>`
- `<properties>` (not actually provided in the main POM but used behind the scenes)
- `<modules>`
- `<reports>`
- `<reporting>`
- `<dependencyManagement>`
- `<distributionManagement>`
- A subset of the `<build>` element, including:
  - `<defaultGoal>`
  - `<resources>`
  - `<testResources>`
  - `<directory>`
  - `<finalName>`
  - `<filters>`
  - `<pluginManagement>`
  - `<plugins>`

### POM Elements Outside of `<profiles>`

We don't allow modification of certain POM elements outside of profile configurations because runtime modifications to these elements won't be distributed when the POM is deployed to a version control system, making the project built by that person completely different from other projects. Although you can achieve this to some extent with options in external configuration files, their danger is limited. Another reason is that sometimes this POM information is reused from the parent POM.

Elements outside of the POM configuration files (such as `settings.xml` and `profiles.xml`) also don't support elements outside of POM files. Let's elaborate on this scenario. When a valid POM is deployed to a remote version control system, anyone can retrieve its information from the version control and use it directly for building Maven projects. Now, imagine if **we could set configuration files in dependencies (critical for building) or any other elements outside of `POM-profiles` in `settings.xml`, then it's very likely that we can't expect others to use the POM from that version control and build it**. We also have to consider how to share `settings.xml` with others. Note that having too many configuration files leads to confusion and is hard to maintain. In summary, since this is build data, it should be placed in the POM.

## Configuration Priority

In a POM, all configuration elements from activated configuration files override or extend global elements with the same name in the POM. If multiple configuration files are activated in the same POM or external file, the **configuration files defined later take precedence over those defined earlier** (irrespective of the order of configuration file IDs and activation). 

Example:

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

This will result in the repository list: `profile-2-repo`, `profile-1-repo`, `global-repo`.

## Misconceptions about Configurations

We've mentioned that adding configuration files to builds can potentially disrupt the project's portability. We've even emphasized in which scenarios configuration files might disrupt project portability. However, as some misconceptions to avoid when using configuration files, it's worth reiterating these points.

When using configuration files, there are two main areas of concern. First is **external property definitions**, typically used for plugin configurations. These properties can potentially disrupt project portability. The other, more subtle aspect is **the imprecise configuration of configuration for a set of natural environments**.

### External Property Definitions

External property definitions refer to properties defined outside of `pom.xml` but not defined within the corresponding configuration file. In POMs, the most obvious use case is plugin configuration. The absence of a property, of course, disrupts project portability, and these small errors can have subtle impacts, leading to build failures. For example, specifying the appserver path in a configuration file specified in `settings.xml` could lead to failure when other team members attempt to build integration testing plugins without a similar `settings.xml`. Here's a snippet of a web application project's `pom.xml`:

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
  </build

>
  ...
</project>
```

And in your local `${user.home}/.m2/settings.xml` you have:

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

When you build the integration testing lifecycle phase, your tests pass because the provided path allows the testing plugin to install and test this web application.

However, when your colleague attempts to build the integration test, their build fails, complaining that it can't resolve the plugin configuration parameter `<appserverHome>`, and worse, that the literal value of `${appserver.home}` is invalid (if it warns you).

Congratulations, your project is now non-portable. Embedding this configuration file in `pom.xml` helps mitigate this issue, but the obvious downside is that this information must now be specified at every project hierarchy level (considering the effects of inheritance). Given Maven's support for project inheritance, this kind of configuration can be placed in the `<pluginManagement>` section of a team-level POM or similar, then simply inherit the path.

Another less attractive answer might be standardizing development environments. However, this often impacts the productivity gains that Maven can bring.

### Imprecise Configuration of Natural Environment Sets

In addition to the portability issues mentioned above, your configuration files are also prone to not covering all scenarios. If they don't, it often leaves one environment in the target environment set stranded. Let's revisit the `pom.xml` snippet from above:

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

Now, consider the configuration file below, which will specify inline in `pom.xml`:

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

This configuration file is very similar to the one in the previous example but with some significant exceptions: it's clearly geared towards the development environment, adds a new configuration file named `appserverConfig-dev-2`, and has an activation section that triggers it when the system property contains `env=dev` (for `appserverConfig-dev`) and `env=dev-2` (for `appserverConfig-dev-2`). Thus, running the command:

```bash
mvn -Denv=dev-2 integration-test
```

will successfully build using the properties given by the `appserverConfig-dev-2` configuration. Moreover, when we run:

```bash
mvn -Denv=dev integration-test
```

it will successfully build using the properties given by the `appserverConfig-dev` configuration. However, running:

```bash
mvn -Denv=production integration-test
```

will fail to build. Why? Because the resulting `${appserver.home}` property from this isn't a valid path for deploying and testing the web application. In writing configuration files to handle such scenarios, it's essential to consider the entire set of target environments where you might want to build the integration testing lifecycle phase. 

Additionally, user-specific configuration files can operate similarly. This means that when a team adds new developers, user-specific configurations for different environments will kick in. While I believe this could be useful training for newcomers, throwing them into the fray this way isn't ideal. Again, emphasize the importance of considering the entire set of configuration files.

## How to Determine Which Configuration Files are in Effect during the Build Process?

Identifying activated configuration files helps users understand which specific configuration files were executed during the build process. We can use the [Maven Help Plugin](https://maven.apache.org/plugins/maven-help-plugin/) to understand which configuration files were executed during the build process.

```bash
mvn help:active-profiles
```

Let's further understand the plugin's active-profiles goal through some small examples.

From the last configuration file example in `pom.xml`, you'll find two configuration files named `appserverConfig-dev` and `appserverConfig-dev-2`, each with different property values. If we continue with:

```bash
mvn help:active-profiles -Denv=dev
```

The result will be a list, listing the active profiles with the activation property `env=dev` and the source code declaring that configuration file. Here's the example:

```bash
The following profiles are active:

 - appserverConfig-dev (source: pom)
```

Now, if we declare a configuration file in `settings.xml` (refer to the configuration file example in settings.xml) and set it as an active configuration file and execute:

```bash
mvn help:active-profiles
```

The result should be:

```bash
The following profiles are active:

 - appserverConfig (source: settings.xml)
```

Although we didn't activate the property, a configuration file has been listed as active. Why? As mentioned earlier, configuration files set in `<activeProfiles>` in `settings.xml` are automatically activated.

Now, if we set a configuration file in `settings.xml` as `<activeProfiles>` and trigger a configuration file in POM. Which configuration file do you think will affect the build?

```bash
mvn help:active-profiles -P appserverConfig-dev
```

This will list the activated configuration files:

```bash
The following profiles are active:

 - appserverConfig-dev (source: pom)
 - appserverConfig (source: settings.xml)
```

Although it lists two active configuration files, we're not sure which one is being applied. To see the impact on the build, execute:

```bash
mvn help:effective-pom -P appserverConfig-dev
```

This will print the effective POM for that build configuration to the console. Note that the configuration file set in `settings.xml` takes precedence over the one in the POM. Therefore, the applied configuration file here is `appserverConfig`, not `appserverConfig-dev`.

If you want to redirect the output of the plugin to a file named `effective-pom.xml`, use the command-line option

 `-Doutput=effective-pom.xml`.

## Naming Conventions

Now that you've noticed configuration files are a natural way to address different build configuration requirements for different target environments. It's essential to provide intuitive hints in your configuration file IDs on their intended use. A good practice is to incorporate generic system property triggers as part of the configuration file names. **This can lead to configuration file names triggered by the system property `env` like `env-dev`, `env-test`, and `env-prod`. Such systems provide very intuitive hints on how to activate builds targeting specific environments**. Thus, to activate a build targeting the testing environment, you need to issue the following command to activate `env-test`:

```bash
mvn -Denv=test <phase>
```

Simply replace the `=` in the profile ID with `-` to get the correct command-line option.