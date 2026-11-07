---
layout: post
title: Prisma - A Modern ORM Solution for TypeScript
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

1. Table of Contents
{:toc}

In modern web development, database operations are an indispensable part of building applications. With the rising popularity of TypeScript, developers increasingly need a solution that provides both type safety and simplified database interactions. Prisma, as a modern ORM (Object-Relational Mapping) tool, fits these needs perfectly. This article explores Prisma’s advantages, walks you through environment setup, and demonstrates basic data insertion and queries as well as multi-table operations.

## Advantages of Prisma

As a modern ORM solution, Prisma offers the following key advantages:

1. **Type Safety**: Prisma integrates deeply with TypeScript, automatically generating type definitions to ensure type-safe database operations and reduce runtime errors.

2. **Auto-Generated Queries**: Prisma provides an intuitive and powerful query API, allowing developers to construct complex queries programmatically without writing SQL manually.

3. **Migration Management**: The built-in migration tool (Prisma Migrate) simplifies schema evolution and supports version control and team collaboration.

4. **Performance Optimization**: Through connection pooling and optimized queries, Prisma improves database performance and handles high-concurrency environments efficiently.

5. **Rich Database Support**: Supports a variety of relational databases—PostgreSQL, MySQL, SQLite, SQL Server, and more—making it adaptable to diverse project needs.

6. **Active Community and Documentation**: Prisma has an active community and excellent documentation, making it easy for developers to get support and learn quickly.

## Environment Setup and Initialization

Before using Prisma, you need to configure your development environment. The following steps guide you through installation and initial setup.

### Install Node.js and TypeScript

Make sure you have Node.js (preferably the latest LTS version) and TypeScript installed. Check your installation using:

```bash
node -v
npm -v
tsc -v
````

If TypeScript is not installed, install it via:

```bash
npm install -g typescript
```

### Initialize Your Project

Create a new project directory and initialize a Node.js project:

```bash
mkdir prisma-typescript-demo
cd prisma-typescript-demo
npm init -y
```

### Install Prisma and Dependencies

Install the Prisma CLI and database driver (using SQLite as an example):

```bash
npm install prisma --save-dev
npm install @prisma/client
npm install typescript ts-node @types/node --save-dev
```

### Initialize Prisma

Initialize Prisma with:

```bash
npx prisma init
```

This command creates a `prisma` folder containing the `schema.prisma` file, and a `.env` file for database configuration.

### Configure the Database

For SQLite, edit your `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

No additional configuration is required; Prisma will automatically create the `dev.db` file.

### Define Your Data Models

Edit `prisma/schema.prisma` to define your data models. For example, a simple user model:

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

### Generate the Prisma Client and Apply Migrations

Run the following command to generate the Prisma client and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

This will create the database schema and generate Prisma Client based on your model definitions.

## Basic Data Insertion and Querying

Once the environment is set up, you can begin performing basic operations. The following example demonstrates inserting and querying user data.

### Create a TypeScript File

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Insert data
  const newUser = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
    },
  })
  console.log('New user:', newUser)

  // Query all users
  const allUsers = await prisma.user.findMany()
  console.log('All users:', allUsers)

  // Query a specific user by condition
  const specificUser = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  })
  console.log('Specific user:', specificUser)
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
New user: { id: 1, name: 'Alice', email: 'alice@example.com' }
All users: [ { id: 1, name: 'Alice', email: 'alice@example.com' } ]
Specific user: { id: 1, name: 'Alice', email: 'alice@example.com' }
```

This demonstrates how to insert and query data using Prisma Client.

* `prisma.user.create` creates a new user
* `prisma.user.findMany` retrieves all users
* `prisma.user.findUnique` fetches a specific user via unique fields

## Multi-Table Data Insertion and Querying

Prisma supports relational operations, making it easy to work with related data. The example below shows how to insert and query users and their associated posts.

### Update the Data Model

Ensure that the user–post relationship is defined, as shown earlier. Then add the following operations:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Insert user with posts
  const userWithPosts = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      posts: {
        create: [
          {
            title: 'My First Post',
            content: 'This is the content',
            published: true,
          },
          {
            title: 'My Second Post',
            content: 'More content',
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  })
  console.log('User and posts:', userWithPosts)

  // Query all users and their posts
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  })
  console.log('All users and posts:', users)
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
User and posts: {
  id: 2,
  name: 'Bob',
  email: 'bob@example.com',
  posts: [
    {
      id: 1,
      title: 'My First Post',
      content: 'This is the content',
      published: true,
      authorId: 2
    },
    {
      id: 2,
      title: 'My Second Post',
      content: 'More content',
      published: false,
      authorId: 2
    }
  ]
}
All users and posts: [
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
        title: 'My First Post',
        content: 'This is the content',
        published: true,
        authorId: 2
      },
      {
        id: 2,
        title: 'My Second Post',
        content: 'More content',
        published: false,
        authorId: 2
      }
    ]
  }
]
```

### Query Specific Related Data

For example, query all published posts along with their authors:

```typescript
const publishedPosts = await prisma.post.findMany({
  where: { published: true },
  include: { author: true },
})
console.log('Published posts and authors:', publishedPosts)
```

Output example:

```bash
Published posts and authors: [
  {
    id: 1,
    title: 'My First Post',
    content: 'This is the content',
    published: true,
    authorId: 2,
    author: { id: 2, name: 'Bob', email: 'bob@example.com' }
  }
]
```

## Reference

[【Programming】Prisma Tutorial | Quick Start | Next-Generation Node.js & TypeScript ORM](https://www.bilibili.com/video/BV1yo4y1x7e7)