---
layout: post 
title: Maven (Part 13) - Optional Dependencies and Dependency Exclusions
description: 
date: 2023-12-05 17:01:56 +0800 
image: /images/covers/maven-cover.jpg
tags:
- Maven
category: ['Maven']
---

1. Table of Contents
{:toc}

This section will discuss optional dependencies and dependency exclusions. It will help users understand what they are, when and how to use them. This section also explains why exclusions are done based on dependency rather than at the POM level.

## Optional Dependencies

Optional dependencies are used in cases where a project cannot be split into sub-modules for some reason. The idea is that certain dependencies are only needed for specific functionalities within the project. Ideally, such functionalities would be split into a sub-module that depends on the core functionality project. This new sub-project would only have non-optional dependencies because if you decide to use the functionality of that sub-project, you'll need all those dependencies.

However, due to the inability to split the project (again, for whatever reason), these dependencies are declared as optional. If a user wants to use the functionality associated with optional dependencies, they must declare that optional dependency in their own project. It's not the cleanest way to deal with such a situation, but optional dependencies and dependency exclusions are pragmatic solutions.

### Why Use Optional Dependencies?

Optional dependencies can save space and memory. They prevent problematic JARs (violating licensing agreements or causing classpath issues) from being bundled into WARs, EARs, fat JARs, or similar files.

### How to Use the Optional Tag?

By setting the `<optional>` element to true in the dependency declaration, you declare the dependency as optional:

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

### How Optional Dependencies Work?

```
Project-A -> Project-B
```

The above illustrates that Project A depends on Project B. When A declares B as an optional dependency in its POM, this relationship remains unchanged. Just like normal compilation, Project B gets added to Project A's classpath.

```
Project-X -> Project-A
```

When another project (Project-X) declares Project-A as a dependency in its POM, the optional nature of the dependency comes into play. Project-B isn't included in Project-X's classpath. You need to declare it directly in Project-X's POM for it to be included.

### Example

Imagine a project called X2, similar to Hibernate. It supports multiple databases like MySQL, PostgreSQL, and various versions of Oracle. Each supported database requires an additional dependency on a driver JAR. When compiling X2, you need all these dependencies. However, your project only uses a specific database and doesn't need drivers for other databases. X2 can declare these dependencies as optional, so when your project declares X2 as a direct dependency in its POM, all the drivers supported by X2 won't automatically be included in your project's classpath. You'll need to explicitly add dependencies for the specific driver of the database you're using.

## Dependency Exclusions

Since Maven resolves dependencies transiently, it's possible to include unwanted dependencies in a project's classpath. For example, an older JAR might have security issues or be incompatible with the Java version you're using. To address this, Maven allows you to exclude specific dependencies. Exclusions are set on specific dependencies in the POM and target specific groupId and artifactId. When building the project, that artifact won't be added to the project's classpath through the dependency declared with exclusions.

### How to Use Dependency Exclusions

Add the `<exclusions>` element within the `<dependency>` element to include the problematic JAR.

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

### How Dependency Exclusions Work and When to Use (As a Last Resort!)

```
Project-A
   -> Project-B
        -> Project-D <!-- This dependency should be excluded -->
              -> Project-E
              -> Project-F
   -> Project C
```

In the above graph, Project A depends on Project B and C, and Project B depends on Project D. By default, Project A's classpath includes:

```
B, C, D, E, F
```

Suppose you don't want Project D and its dependencies added to Project A's classpath because some of Project D's dependencies are missing from the repository, and you don't need the functionality from Project D that Project B relies on. Project B's developers could have marked Project D's dependencies as `<optional>true</optional>`:

```xml
<dependency>
  <groupId>sample.ProjectD</groupId>
  <artifactId>ProjectD</artifactId>
  <version>1.0-SNAPSHOT</version>
  <optional>true</optional>
</dependency>
```

Unfortunately, they didn't. As a last resort, you can exclude it in your Project A POM:

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

If Project-A is deployed to the repository and Project-X declares a normal dependency on Project-A, will Project-D still be excluded from the classpath?

```
Project-X -> Project-A
```

Yes, it will. Project A has declared it doesn't need Project D to run, so it won't be introduced as a transitive dependency of Project A.

Now, consider Project-X depends on Project-Y, as shown below:

```
Project-X -> Project-Y
               -> Project-B
                    -> Project-D
                       ...
```

Project Y also depends on Project B, and indeed, it needs the functionality supported by Project D. Therefore, it doesn't exclude Project D in its dependency list. Project Y might also provide an

 additional repository to address issues with Project E. In this case, it's important that Project D isn't globally excluded because it's a legitimate dependency of Project Y.

In another scenario, let's say the unwanted dependency is Project-E, not Project-D. How do you exclude it? See the graph below:

```xml
Project-A
   -> Project-B
        -> Project-D 
              -> Project-E <!-- Exclude this dependency -->
              -> Project-F
   -> Project C
```

Exclusions made at the declaration point apply to the entire dependency graph below. If you want to exclude Project-E instead of Project-D, simply point the exclusion to Project-E, but don't move the exclusion down to Project-D. You can't change Project-D's POM. If you could, you might use optional dependencies instead of exclusions, or split Project-D into multiple sub-projects, each containing only necessary dependencies.

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

### Why Exclude Based on Dependency Rather Than at the POM Level

This is primarily to ensure the dependency graph is predictable and to prevent inheritance effects from excluding dependencies that shouldn't be excluded. If you're forced to use exclusions as a last resort, you should be absolutely certain which dependency is bringing in the unwanted transitive dependency.

If you truly want to ensure a specific dependency doesn't end up in the classpath (regardless of the path), you can configure dependency banning rules to fail the build when problematic dependencies are found. When the build fails, you'll need to add specific exclusions on each path Enforcer finds.
