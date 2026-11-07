---
layout: post
title: Prisma：事务处理：Batch和Interactive
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

1. 目录
{:toc}

在前面的博客中，我们介绍了Prisma基本的事务操作和错误处理。但是当我接触到Prisma Playground后，我发现了一些更加优雅的事务操作的方法。本篇博客将深入探讨两种主要的事务处理方法：**Batch处理**和**Interactive处理**，并对它们进行详细的对比分析，帮助你在实际开发中选择最合适的事务管理策略。

## Batch处理与Interactive处理的区别

Prisma提供了两种主要的事务处理方式：**Batch处理**（批量处理）和**Interactive处理**（交互式处理）。这两种方法在事务的组织和执行方式上有所不同，各有其适用场景和优缺点。

### Batch处理（批量处理）

**Batch处理**是一种将多个数据库操作打包成一个事务，并一次性提交给数据库执行的方法。这种方式的特点是所有操作在同一个事务中同时执行，确保了操作的原子性。以下是Batch处理的主要特点：

- **并行执行**：所有操作被一次性提交，数据库会尽可能并行地执行这些操作。
- **简单易用**：适用于多个独立操作需要同时成功或失败的场景。
- **性能优势**：减少了事务的启动和提交次数，提升了性能，特别是在需要执行大量相似操作时。

**示例代码：**

```typescript
const [bob, carol, nilu] = await prisma.$transaction([
    createUser,
    updateUser,
    deleteUser,
]);
```

在这个例子中，创建用户、更新用户和删除用户的操作被打包成一个事务，一旦其中任何一个操作失败，整个事务都会回滚。

### Interactive处理（交互式处理）

**Interactive处理**允许在事务中进行更复杂的操作，支持在事务执行过程中依赖前一个操作的结果。这种方式的特点是：

- **顺序执行**：操作按照代码中的顺序依次执行，后续操作可以基于前一个操作的结果。
- **灵活性高**：适用于需要在事务中进行条件判断、分支逻辑或依赖前置结果的复杂场景。
- **错误处理更细致**：可以在事务执行过程中捕获和处理特定的错误，提高代码的健壮性。

**示例代码：**

```typescript
await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ /* ... */ });
    const count = await tx.user.count();
    await tx.post.create({ /* 使用 count 作为信息 */ });
});
```

在这个例子中，创建用户后获取用户总数，再基于用户总数创建帖子。这些操作依赖于前一个操作的结果，因此需要顺序执行。

### 对比分析

| 特性               | Batch处理                     | Interactive处理                |
|--------------------|-------------------------------|---------------------------------|
| **执行方式**       | 并行提交多个操作               | 顺序执行依赖前置结果的操作      |
| **适用场景**       | 多个独立操作需要原子性         | 需要在事务中进行依赖性操作      |
| **代码复杂度**     | 相对简单                       | 代码结构更复杂，但更灵活        |
| **性能**           | 更高，减少事务启动和提交次数   | 略低，因为需要逐步执行操作        |
| **错误处理**       | 全局回滚，较难进行细粒度控制 | 可以在事务中逐步处理错误        |
| **灵活性**         | 较低，操作之间不能相互依赖     | 高，支持复杂的业务逻辑          |

### 选择合适的事务处理方法

根据上述对比，可以根据具体的业务需求选择合适的事务处理方法：

- **选择Batch处理**：
  - 当需要执行多个独立的数据库操作，这些操作之间没有依赖关系，并且希望这些操作要么全部成功要么全部失败时。
  - 适用于批量创建、更新或删除数据的场景，可以显著提升性能。

- **选择Interactive处理**：
  - 当事务中的操作需要依赖前一个操作的结果，或者需要在事务中进行复杂的逻辑判断时。
  - 适用于需要根据前置结果进行后续操作的业务逻辑，例如创建用户后根据用户信息创建关联的数据。

## Batch处理代码

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

## Interactive处理代码
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.$transaction(async (tx) => {
            // 1. Create a new user ...
            const user = await tx.user.create({  // 使用 tx 而不是 prisma
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

## 实践中的最佳实践

1. **事务的粒度**：
   - 避免在单个事务中包含过多的操作，以防止长时间锁定数据库资源，影响系统性能。
   - 根据业务逻辑合理划分事务的粒度，保持事务的简洁和高效。

2. **错误处理**：
   - 无论选择哪种事务处理方法，都应当实现健全的错误处理机制，确保在事务失败时能够正确回滚，避免数据不一致。
   - 使用Prisma提供的错误类型，如`PrismaClientKnownRequestError`，进行细粒度的错误捕获和处理。

3. **性能优化**：
   - 对于需要高性能的批量操作，优先考虑Batch处理，充分利用数据库的并行处理能力。
   - 在需要顺序执行的复杂事务中，合理组织代码结构，减少不必要的数据库查询，提升事务执行效率。

4. **事务隔离级别**：
   - 根据业务需求，选择合适的事务隔离级别，平衡数据一致性和系统性能。
   - Prisma默认使用数据库的默认隔离级别，但在复杂场景下，可以通过数据库配置进行调整。

## 总结

Prisma提供了灵活的事务处理方式，既支持Batch处理的高效并行，又支持Interactive处理的灵活顺序执行。理解两者的区别和适用场景，能够帮助开发者在实际项目中更好地管理数据库事务，确保数据的一致性和系统的高性能。根据具体的业务需求，合理选择事务处理方法，并结合最佳实践，能够构建出健壮且高效的数据库操作逻辑。