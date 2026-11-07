---
layout: post
title: Prisma - Transaction Handling — Batch and Interactive
description:
date: 2024-12-19 15:20:09 +1100
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

In the previous blog, we covered Prisma’s basic transaction operations and error handling. However, after exploring the Prisma Playground, I discovered some more elegant transaction-handling approaches. This post dives deeper into the two major transaction mechanisms: **Batch Transactions** and **Interactive Transactions**, comparing them in detail to help you choose the most suitable strategy in real-world development.

## Differences Between Batch and Interactive Transactions

Prisma offers two primary ways to execute transactions: **Batch Transactions** and **Interactive Transactions**. They differ in how operations are organized and executed, and each approach has its own strengths and ideal use cases.

---

## Batch Transactions (Batch Processing)

**Batch processing** is a way of bundling multiple database operations into a single transaction and submitting them together. ALL operations run within the same transaction, guaranteeing atomicity. Here are the key characteristics:

- **Parallel Execution**: All operations are submitted at once. The database may execute them in parallel when possible.
- **Simple to Use**: Ideal for scenarios where multiple independent operations should succeed or fail together.
- **Performance Advantage**: Reduces the number of transaction start/commit cycles, improving performance—especially helpful for large sets of similar operations.

**Example:**

```typescript
const [bob, carol, nilu] = await prisma.$transaction([
    createUser,
    updateUser,
    deleteUser,
]);
````

In this example, the create, update, and delete operations are bundled into a single transaction. If any one fails, the entire transaction rolls back.

---

## Interactive Transactions

**Interactive transactions** allow for more complex transaction logic. Subsequent operations can depend on the results of earlier operations, and you can introduce business logic, conditions, and branching within the transaction.

Key characteristics:

* **Sequential Execution**: Operations run in order; later operations can rely on earlier results.
* **Highly Flexible**: Suitable for complex logic that cannot be expressed in a single batch.
* **Granular Error Handling**: Errors can be managed step-by-step, improving robustness.

**Example:**

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ /* ... */ });
    const count = await tx.user.count();
    await tx.post.create({ /* using count as info */ });
});
```

Here, we create a user, retrieve the total number of users, and use that count to create a related post. Because each step depends on the previous one, sequential execution is required.

---

## Comparison

| Feature             | Batch Transactions                       | Interactive Transactions                 |
| ------------------- | ---------------------------------------- | ---------------------------------------- |
| **Execution**       | Sends multiple operations at once        | Sequential execution                     |
| **Use Cases**       | Independent operations requiring atomicy | Operations depending on previous results |
| **Code Complexity** | Simple                                   | More complex but extremely flexible      |
| **Performance**     | Higher performance                       | Slightly slower due to sequential flow   |
| **Error Handling**  | Rolls back all at once                   | Fine-grained error control               |
| **Flexibility**     | Limited                                  | Very high                                |

---

## Which Should You Choose?

Choose **Batch Transactions** when:

* You need multiple independent DB operations to succeed or fail together.
* You're doing mass insert/update/delete operations.
* Performance is a key requirement.

Choose **Interactive Transactions** when:

* Logic depends on data from earlier steps.
* You need branching, validation, or complex business rules.
* The result of one query affects later queries.

---

## Batch Transaction Example

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function prepare() {
    await prisma.user.create({
        data: {
            name: "Lomo",
            email: "lomo@prisma.io",
            age: 10,
            country: "USA",
        },
    });
    await prisma.user.create({
        data: {
            name: "Bava",
            email: "bava@prisma.io",
            age: 10,
            country: "USA",
        },
    });
}

async function main() {
    /**
     * 0. Prepare some initial records.
     */
    await prepare();

    /**
     * 1. We first create three unresolved queries ...
     */
    const createUser = prisma.user.create({
        data: {
            name: "Bob",
            email: "bob@prisma.io",
            age: 49,
            country: "USA",
        },
    });

    const updateUser = prisma.user.update({
        where: { email: "lomo@prisma.io" },
        data: { country: "Germany" },
    });

    const deleteUser = prisma.user.delete({ where: { email: "bava@prisma.io" } });

    /**
     * 2. ... and then submit all three at once to be executed in a single database transaction.
     */

    const [bob, carol, nilu] = await prisma.$transaction([
        createUser,
        updateUser,
        deleteUser,
    ]);

    console.log(
        "Created, updated and deleted 3 user records in a single transaction.",
        bob,
        carol,
        nilu
    );
}


main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
```

**Output:**

```bash
Created, updated and deleted 3 user records in a single transaction. {
  id: 11,
  createdAt: 2024-12-19T05:48:39.212Z,
  updatedAt: 2024-12-19T05:48:39.212Z,
  email: 'bob@prisma.io',
  name: 'Bob',
  age: 49,
  country: 'USA'
} {
  id: 9,
  createdAt: 2024-12-19T05:48:39.167Z,
  updatedAt: 2024-12-19T05:48:39.212Z,
  email: 'lomo@prisma.io',
  name: 'Lomo',
  age: 10,
  country: 'Germany'
} {
  id: 10,
  createdAt: 2024-12-19T05:48:39.211Z,
  updatedAt: 2024-12-19T05:48:39.211Z,
  email: 'bava@prisma.io',
  name: 'Bava',
  age: 10,
  country: 'USA'
}
```

---

## Interactive Transaction Example

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.$transaction(async (tx) => {
            // 1. Create a new user ...
            const user = await tx.user.create({
                data: {
                    email: "burk@prisma.io",
                    age: 42,
                    country: "Germany",
                    name: "Nikolas Burk",
                },
            });

            // 2. ... then load the number of users in the database ...
            const count = await tx.user.count();

            // 3. ... and use the `count` as information in a new query
            await tx.post.create({
                data: {
                    title: `I am user #${count} in the database.`,
                    authorId: user.id,
                },
            });
        },
        {
            timeout: 5000,
        }
    );

    // Validate that the transaction was executed successfully
    const user = await prisma.user.findUnique({
        where: { email: "burk@prisma.io" },
        include: { posts: true },
    });
    console.dir(user, { depth: null });
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
```

**Output:**

```bash
{
  id: 8,
  createdAt: 2024-12-19T05:47:59.931Z,
  updatedAt: 2024-12-19T05:47:59.931Z,
  email: 'burk@prisma.io',
  name: 'Nikolas Burk',
  age: 42,
  country: 'Germany',
  posts: [
    {
      id: 5,
      createdAt: 2024-12-19T05:47:59.969Z,
      title: 'I am user #1 in the database.',
      published: false,
      authorId: 8
    }
  ]
}
```

---

## Best Practices in Real-World Development

1. **Transaction Granularity**

   * Avoid putting too many operations into a single transaction to prevent locking resources too long.
   * Keep transactions small and efficient.

2. **Error Handling**

   * Regardless of the transaction type, always implement proper error handling.
   * For fine-grained control, use `PrismaClientKnownRequestError` and related error classes.

3. **Performance Optimization**

   * Prefer Batch transactions for high-performance bulk operations.
   * For interactive flows, reduce unnecessary queries and structure logic efficiently.

4. **Transaction Isolation Levels**

   * Choose appropriate isolation levels based on business needs.
   * Prisma defaults to the database’s isolation level, but you may configure it for advanced use cases.

---

## Summary

Prisma offers flexible transaction management through both Batch and Interactive transactions. Batch transactions provide high performance and simplicity, while Interactive transactions offer maximum flexibility for complex logic. Understanding their differences helps you design systems that maintain strong consistency and optimal performance. By choosing the right approach and applying best practices, you can build robust and efficient database logic for your applications.