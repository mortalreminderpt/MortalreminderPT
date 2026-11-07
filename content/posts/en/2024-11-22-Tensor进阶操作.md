---
layout: post
title: Advanced Tensor Operations
description:
date: 2024-11-22 14:21:30 +0800
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

## Concatenation & Splitting: Flexible Data Processing

In data processing, we often need to concatenate (`cat`) or split (`split`) Tensors. These methods allow us to manipulate multidimensional data more flexibly.

### Concatenate (Cat)
Concatenation allows us to merge Tensors along a specific dimension. For example, merging test scores of different classes:

```python
import torch

# Suppose we have two classes’ score data
class1_4_scores = torch.tensor([[80, 85], [90, 92]])
class5_9_scores = torch.tensor([[75, 88], [82, 95]])

# Concatenate along dimension 0
combined_scores = torch.cat([class1_4_scores, class5_9_scores], dim=0)
````

```bash
class1_4_scores: tensor([[80, 85],
        [90, 92]])
class5_9_scores: tensor([[75, 88],
        [82, 95]])
combined_scores: tensor([[80, 85],
        [90, 92],
        [75, 88],
        [82, 95]])
```

### Stack

`stack` creates a new dimension, making it slightly different from `cat`:

```python
# Stack creates a new dimension
stacked_scores = torch.stack([class1_4_scores, class5_9_scores])
```

```bash
stacked_scores: tensor([[[80, 85],
         [90, 92]],

        [[75, 88],
         [82, 95]]])
combined_scores shape: torch.Size([4, 2])
stacked_scores shape: torch.Size([2, 2, 2])
```

### Split

`split` can divide a Tensor by specified lengths or by number of chunks:

```python
# Split by lengths
split_by_len = torch.split(combined_scores, split_size_or_sections=[2, 2], dim=0)

# Split by number of chunks
split_by_chunk = torch.chunk(combined_scores, chunks=2, dim=0)
```

```bash
split_by_len: (tensor([[80, 85],
        [90, 92]]), tensor([[75, 88],
        [82, 95]]))
split_by_chunk: (tensor([[80, 85],
        [90, 92]]), tensor([[75, 88],
        [82, 95]]))
```

## Mathematical Operations: Basic to Advanced

Tensors support a wide range of mathematical operations, from basic arithmetic to complex matrix computations.

### Basic Operations

```python
# Basic arithmetic
a = torch.tensor([1, 2, 3])
b = torch.tensor([4, 5, 6])
add_result = a + b
sub_result = a - b
mul_result = a * b
div_result = a / b

# Matrix multiplication
matrix_a = torch.tensor([[1, 2], [3, 4]])
matrix_b = torch.tensor([[5, 6], [7, 8]])
matmul_result = torch.matmul(matrix_a, matrix_b)  # or use @
```

### Advanced Mathematical Operations

```python
# Power operations & approximations
power_result = torch.pow(a, 2)
sqrt_result = torch.sqrt(a)

# Rounding operations
x = torch.tensor([1.7, 2.3, -1.5])
floor_result = x.floor()    # [1, 2, -2]
ceil_result = x.ceil()      # [2, 3, -1]
round_result = x.round()    # [2, 2, -2]
```

## Statistical Properties: Deep Data Analysis

PyTorch provides rich statistical methods to help analyze data quickly.

```python
# Norm computation
x = torch.tensor([1, 2, 3])
l2_norm = torch.norm(x)  # L2 norm

# Statistical operations
data = torch.tensor([[1, 2, 3], [4, 5, 6]])
mean_value = data.mean()
sum_value = data.sum()
max_value = data.max()
min_value = data.min()

# Get indices of max/min values
argmax_index = data.argmax()
argmin_index = data.argmin()

# Top-K operation
values, indices = torch.topk(data, k=2)
```

## Advanced Operations: Conditional Selection & Retrieval

Advanced operations such as `where` and `gather` enable more complex data manipulation.

```python
# Where: conditional selection
condition = torch.tensor([True, False, True])
x = torch.tensor([1, 2, 3])
y = torch.tensor([4, 5, 6])
result = torch.where(condition, x, y)  # [1, 5, 3]

# Gather: retrieve values based on indices
src = torch.tensor([[1, 2], [3, 4], [5, 6]])
indices = torch.tensor([0, 1, 1])
gathered = torch.gather(src, 1, indices.unsqueeze(1))  # [[1], [4], [6]]
```

```bash
result: tensor([1, 5, 3])
gathered: tensor([[1],
        [4],
        [6]])
```