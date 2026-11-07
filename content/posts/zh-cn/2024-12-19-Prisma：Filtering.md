---
layout: post
title: Prisma：Filtering
description:
date: 2024-12-19 15:40:02 +1100
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

Prisma 提供了丰富的过滤（Filtering）选项，允许开发者根据各种条件筛选数据库中的数据。以下是主要的过滤类型及每种过滤的具体示例：

## **等于过滤（Equality Filter）**

**描述**：筛选字段等于指定值的记录。

**示例**：
```typescript
const users = await prisma.user.findMany({
  where: {
    email: {
      equals: "user@example.com",
    },
  },
});
```

## **不等于过滤（Not Equals Filter）**

**描述**：筛选字段不等于指定值的记录。

**示例**：
```typescript
const activeUsers = await prisma.user.findMany({
  where: {
    status: {
      not: "inactive",
    },
  },
});
```

## **包含过滤（Contains Filter）**

**描述**：筛选字段包含指定子字符串的记录，通常用于字符串字段。

**示例**：
```typescript
const postsWithPrisma = await prisma.post.findMany({
  where: {
    title: {
      contains: "Prisma",
      mode: "insensitive", // 可选，忽略大小写
    },
  },
});
```

## **以...开头过滤（Starts With Filter）**

**描述**：筛选字段以指定子字符串开头的记录。

**示例**：
```typescript
const productsStartingWithPro = await prisma.product.findMany({
  where: {
    name: {
      startsWith: "Pro",
    },
  },
});
```

## **以...结尾过滤（Ends With Filter）**

**描述**：筛选字段以指定子字符串结尾的记录。

**示例**：
```typescript
const imageFiles = await prisma.file.findMany({
  where: {
    filename: {
      endsWith: ".jpg",
    },
  },
});
```

## **大于、小于过滤（Greater Than / Less Than Filters）**

**描述**：筛选数值或日期字段大于、小于指定值的记录。

**示例**：
```typescript
const recentOrders = await prisma.order.findMany({
  where: {
    createdAt: {
      gt: new Date('2024-01-01'),
    },
  },
});
```

## **范围过滤（In / Not In Filters）**

**描述**：筛选字段值在（或不在）指定值列表中的记录。

**示例**：
```typescript
const categories = ['Electronics', 'Books', 'Clothing'];
const products = await prisma.product.findMany({
  where: {
    category: {
      in: categories,
    },
  },
});
```

## **逻辑过滤（AND, OR, NOT）**

**描述**：使用逻辑运算符组合多个过滤条件。

**示例**（使用 AND）：
```typescript
const activeAdmins = await prisma.user.findMany({
  where: {
    AND: [
      { role: "admin" },
      { isActive: true },
    ],
  },
});
```

**示例**（使用 OR）：
```typescript
const adminsOrModerators = await prisma.user.findMany({
  where: {
    OR: [
      { role: "admin" },
      { role: "moderator" },
    ],
  },
});
```

**示例**（使用 NOT）：
```typescript
const nonAdmins = await prisma.user.findMany({
  where: {
    NOT: { role: "admin" },
  },
});
```

## **列表过滤（List Filters）**

**描述**：针对列表类型字段（如数组）进行过滤。

**示例**：
```typescript
const postsWithTagPrisma = await prisma.post.findMany({
  where: {
    tags: {
      has: "prisma",
    },
  },
});
```

## **关联过滤（Relation Filters）**

**描述**：基于关联模型的字段进行过滤。

**示例**：
```typescript
const postsBySpecificAuthor = await prisma.post.findMany({
  where: {
    author: {
      email: "author@example.com",
    },
  },
});
```

## **JSON 过滤（JSON Filters）**

**描述**：针对 JSON 类型字段进行复杂的过滤。

**示例**：
```typescript
const usersWithDarkTheme = await prisma.user.findMany({
  where: {
    metadata: {
      path: ['preferences', 'theme'],
      equals: 'dark',
    },
  },
});
```

## **全文搜索过滤（Full-text Search Filter）**

**描述**：对文本字段进行全文搜索（取决于数据库支持）。

**示例**（以 PostgreSQL 为例）：
```typescript
const searchResults = await prisma.post.findMany({
  where: {
    searchVector: {
      search: "Prisma ORM",
    },
  },
});
```

## **区间过滤（Between Filter）**

**描述**：筛选字段值在指定范围内的记录。

**示例**：
```typescript
const ordersInRange = await prisma.order.findMany({
  where: {
    total: {
      gte: 100,
      lte: 500,
    },
  },
});
```

## **Null 值过滤（Null Filters）**

**描述**：筛选字段是否为 null 或不为 null。

**示例**：
```typescript
const usersWithoutProfile = await prisma.user.findMany({
  where: {
    profile: {
      is: null,
    },
  },
});
```

这些过滤选项可以单独使用，也可以组合使用，以构建复杂的查询条件。