---
layout: post
title: Prisma - Filtering
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

1. Table of Contents
{:toc}

Prisma provides a wide range of powerful filtering options that allow developers to query data based on various conditions. Below are the major filter types along with concrete examples for each one.

## **Equality Filter**

**Description**: Retrieves records where a field is equal to the specified value.

**Example**:
```typescript
const users = await prisma.user.findMany({
  where: {
    email: {
      equals: "user@example.com",
    },
  },
});
````

## **Not Equals Filter**

**Description**: Retrieves records where a field is *not* equal to the specified value.

**Example**:

```typescript
const activeUsers = await prisma.user.findMany({
  where: {
    status: {
      not: "inactive",
    },
  },
});
```

## **Contains Filter**

**Description**: Retrieves records where a string field contains the specified substring. Commonly used for text searching.

**Example**:

```typescript
const postsWithPrisma = await prisma.post.findMany({
  where: {
    title: {
      contains: "Prisma",
      mode: "insensitive", // optional, case-insensitive search
    },
  },
});
```

## **Starts With Filter**

**Description**: Retrieves records where a string field starts with the specified substring.

**Example**:

```typescript
const productsStartingWithPro = await prisma.product.findMany({
  where: {
    name: {
      startsWith: "Pro",
    },
  },
});
```

## **Ends With Filter**

**Description**: Retrieves records where a string field ends with the specified substring.

**Example**:

```typescript
const imageFiles = await prisma.file.findMany({
  where: {
    filename: {
      endsWith: ".jpg",
    },
  },
});
```

## **Greater Than / Less Than Filters**

**Description**: Retrieves records where a numerical or date field is greater than, less than, or otherwise compared to a specified value.

**Example**:

```typescript
const recentOrders = await prisma.order.findMany({
  where: {
    createdAt: {
      gt: new Date('2024-01-01'),
    },
  },
});
```

## **In / Not In Filters**

**Description**: Retrieves records where a field’s value is (or is not) within a specified list of values.

**Example**:

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

## **Logical Filters (AND, OR, NOT)**

**Description**: Combine multiple filtering conditions using logical operators.

**Example** (using AND):

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

**Example** (using OR):

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

**Example** (using NOT):

```typescript
const nonAdmins = await prisma.user.findMany({
  where: {
    NOT: { role: "admin" },
  },
});
```

## **List Filters**

**Description**: Filters records based on array (list-type) fields.

**Example**:

```typescript
const postsWithTagPrisma = await prisma.post.findMany({
  where: {
    tags: {
      has: "prisma",
    },
  },
});
```

## **Relation Filters**

**Description**: Filters records based on fields of related models.

**Example**:

```typescript
const postsBySpecificAuthor = await prisma.post.findMany({
  where: {
    author: {
      email: "author@example.com",
    },
  },
});
```

## **JSON Filters**

**Description**: Allows advanced filtering on JSON-type fields.

**Example**:

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

## **Full-text Search Filter**

**Description**: Performs full-text search on text fields (supported depending on the database).

**Example** (PostgreSQL):

```typescript
const searchResults = await prisma.post.findMany({
  where: {
    searchVector: {
      search: "Prisma ORM",
    },
  },
});
```

## **Between Filter**

**Description**: Retrieves records where a field’s value falls within a specified range.

**Example**:

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

## **Null Filters**

**Description**: Filters records based on whether a field is null or not null.

**Example**:

```typescript
const usersWithoutProfile = await prisma.user.findMany({
  where: {
    profile: {
      is: null,
    },
  },
});
```

These filtering options can be used individually or combined to construct complex and powerful query conditions.