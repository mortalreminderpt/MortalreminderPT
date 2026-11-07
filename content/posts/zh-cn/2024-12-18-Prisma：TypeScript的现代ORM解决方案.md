---
layout: post
title: Prisma：TypeScript的现代ORM解决方案
description:
date: 2024-12-18 14:02:52 +1100
image: https://miro.medium.com/v2/1*1d4T0TNb33A7Dus2ePdN_g.jpeg
tags:
- Node.js
- Next.js
- Typescript
- Prisma
category: ['Node.js']
---

1. 目录
{:toc}

在现代Web开发中，数据库操作是不可或缺的一部分。随着TypeScript的普及，开发者们越来越需要一种既能提供类型安全，又能简化数据库操作的解决方案。Prisma作为一款现代的ORM（对象关系映射）工具，正好满足了这些需求。本文将深入探讨Prisma的优势，指导你完成环境配置及搭建，并通过示例展示基本数据插入及查询以及多表数据插入及查询的操作。

## Prisma的优势

Prisma作为现代ORM解决方案，具有以下显著优势：

1. **类型安全**：Prisma与TypeScript深度集成，自动生成类型定义，确保数据库操作的类型安全，减少运行时错误。

2. **自动生成查询**：Prisma提供直观且强大的查询API，允许开发者以编程方式构建复杂的查询，而无需手写SQL。

3. **迁移管理**：内置的迁移工具（Prisma Migrate）简化了数据库模式的演进，支持版本控制和团队协作。

4. **性能优化**：Prisma通过连接池和查询优化，提高数据库访问的性能，适应高并发需求。

5. **丰富的数据库支持**：支持多种关系型数据库，如 PostgreSQL、MySQL、SQLite、SQL Server 等，方便不同项目的需求。

6. **社区和文档**：拥有活跃的社区和详尽的文档，开发者可以轻松获取支持和学习资源。

## 环境配置及搭建

在开始使用Prisma之前，我们需要配置开发环境。以下步骤将指导你完成从安装到初始配置的全过程。

### 安装Node.js和TypeScript

确保你已经安装了Node.js（建议使用最新的LTS版本）和TypeScript。你可以通过以下命令检查是否已安装：

```bash
node -v
npm -v
tsc -v
```

如果没有安装TypeScript，可以使用以下命令安装：

```bash
npm install -g typescript
```

### 初始化项目

创建一个新的项目目录，并初始化为一个Node.js项目：

```bash
mkdir prisma-typescript-demo
cd prisma-typescript-demo
npm init -y
```

### 安装Prisma和相关依赖

安装Prisma CLI和数据库驱动（以SQLite为例）：

```bash
npm install prisma --save-dev
npm install @prisma/client
npm install typescript ts-node @types/node --save-dev
```

### 初始化Prisma

使用Prisma CLI初始化Prisma：

```bash
npx prisma init
```

此命令将在项目根目录创建一个 `prisma` 文件夹，包含 `schema.prisma` 文件，以及一个 `.env` 文件用于配置数据库连接。

### 配置数据库

以SQLite为例，编辑 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
```

SQLite无需额外配置，Prisma会自动创建 `dev.db` 文件。

### 定义数据模型

编辑 `prisma/schema.prisma` 文件，定义你的数据模型。例如，创建一个简单的用户模型：

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
  author    User    @relation(fields: [authorId], references: [id])
}
```

### 生成Prisma Client并应用迁移

运行以下命令生成Prisma Client并应用数据库迁移：

```bash
npx prisma migrate dev --name init
```

此命令会根据 `schema.prisma` 文件创建数据库结构，并生成Prisma Client。

## 基本数据插入及查询

在完成环境配置后，我们可以开始进行基本的数据操作。以下示例展示如何插入和查询用户数据。

### 创建TypeScript文件

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 插入数据
  const newUser = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
    },
  })
  console.log('新用户:', newUser)

  // 查询数据
  const allUsers = await prisma.user.findMany()
  console.log('所有用户:', allUsers)

  // 根据条件查询
  const specificUser = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  })
  console.log('特定用户:', specificUser)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
新用户: { id: 1, name: 'Alice', email: 'alice@example.com' }
所有用户: [ { id: 1, name: 'Alice', email: 'alice@example.com' } ]
特定用户: { id: 1, name: 'Alice', email: 'alice@example.com' }
```

以上代码展示了如何使用Prisma Client进行基本的数据插入和查询操作。`prisma.user.create` 用于创建新用户，`prisma.user.findMany` 用于查询所有用户，`prisma.user.findUnique` 用于根据特定条件查询单个用户。

## 多表数据插入及查询

Prisma支持多表操作，允许开发者轻松处理关联数据。以下示例将展示如何插入和查询用户及其关联的帖子。

### 更新数据模型

确保 `schema.prisma` 中定义了用户与帖子之间的关系，如前文所示；添加创建用户及其帖子的方法如下：

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 插入用户及其帖子
  const userWithPosts = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      posts: {
        create: [
          {
            title: '我的第一篇帖子',
            content: '这是内容',
            published: true,
          },
          {
            title: '我的第二篇帖子',
            content: '更多内容',
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  })
  console.log('用户及其帖子:', userWithPosts)

  // 查询用户及其帖子
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  })
  console.log('所有用户及其帖子:', users)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
用户及其帖子: {
  id: 2,
  name: 'Bob',
  email: 'bob@example.com',
  posts: [
    {
      id: 1,
      title: '我的第一篇帖子',
      content: '这是内容',
      published: true,
      authorId: 2
    },
    {
      id: 2,
      title: '我的第二篇帖子',
      content: '更多内容',
      published: false,
      authorId: 2
    }
  ]
}
所有用户及其帖子: [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    posts: []
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    posts: [
      {
        id: 1,
        title: '我的第一篇帖子',
        content: '这是内容',
        published: true,
        authorId: 2
      },
      {
        id: 2,
        title: '我的第二篇帖子',
        content: '更多内容',
        published: false,
        authorId: 2
      }
    ]
  }
]
```

### 更新查询以获取特定关联数据

你还可以根据需要，进行更复杂的查询。例如，查询所有已发布的帖子及其作者信息：

```typescript
const publishedPosts = await prisma.post.findMany({
  where: { published: true },
  include: { author: true },
})
console.log('已发布的帖子及作者:', publishedPosts)
```

运行后，将输出所有已发布的帖子及其对应的作者信息：
```bash
已发布的帖子及作者: [
  {
    id: 1,
    title: '我的第一篇帖子',
    content: '这是内容',
    published: true,
    authorId: 2,
    author: { id: 2, name: 'Bob', email: 'bob@example.com' }
  }
]
```

## 参考

[【编程】Prisma 教程 \| 快速入门 \| 下一代 Node.js 和 TypeScript ORM](https://www.bilibili.com/video/BV1yo4y1x7e7)。