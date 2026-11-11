---
layout: post
featured: false
title: "Dynamic Programming (Part 2) - Optimal Subsequence Series"
image: /images/covers/village.jpg
description: The core idea of dynamic programming lies in breaking down a problem into smaller subproblems, retaining previously computed results to reduce computational effort.
date: 2021-09-28 11:12:38 +0800
tags:
- Algorithms
- Dynamic Programming
category: ['Dynamic Programming Fundamentals']
---

1. Table of Contents
{:toc}

## Core Idea of Dynamic Programming
The core idea of dynamic programming lies in breaking down a problem into smaller subproblems, retaining previously computed results to reduce computational effort.

{{page.categories[-1]}}

Let's illustrate this with an example:

> A: 1+1+1+1+1+1+1+1 = ? 
> 
> B ( Calculation ): 8 
> 
> A: What if we add "1+" to the left side of the equation? 
> 
> B ( Instantly ): 9 
> 
> A: How did you arrive at the answer so quickly? 
> 
> B: Just add 1 to 8 
> 
> A: So, you don't need to recalculate because you remembered that the value of the first equation was 8. The dynamic programming algorithm can be said to remember the solutions it has found to save time.

## [198. House Robber](https://leetcode-cn.com/problems/house-robber/)

1. When there is only one house, we choose to rob that house.
2. When there are two houses, we choose to rob the one with the larger value.
3. If there are more than two houses, for example, the third house, we need to consider whether the total value of the first and third houses is greater than that of the second house. If the total value of the first and third houses is greater, we choose to rob both the first and third houses; otherwise, we choose not to rob the first and third houses and rob the second house instead.
4. Generalizing this, for the first i houses, we have two options for robbery:
   1. Rob the ith house, obtaining the total amount equal to the value of the ith house plus the total amount obtained by robbing the first i-2 houses.
   2. Do not rob the ith house, obtaining the total amount equal to the total amount obtained by robbing the first i-1 houses.

We always choose the option that gives a higher amount from 1 and 2. Here, we use $d[i]$ to represent the total amount obtained by robbing the first i houses, and $d[i]$ to represent options 1 and 2:

$$
\begin{equation}
\left\{
\begin{aligned}
%\nonumber
&d[i] = d[i-2] + \text{nums}[i], \\
&d[i] = d[i-1].
\end{aligned}
\right.
\end{equation}
$$