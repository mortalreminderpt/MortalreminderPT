---
layout: post
featured: false
title: "Dynamic Programming Series on Stock Problems"
image: /images/covers/village.jpg
description: The core idea of dynamic programming lies in breaking down a problem into subproblems, retaining previous computational results to reduce the amount of computation needed.
date: 2021-09-29 20:29:46 +0800
tags:
- Algorithms
- Dynamic Programming
category: ['Dynamic Programming Fundamentals']
---

1. Table of Contents
{:toc}

## [121. Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
### State Transition Equation
We can use $dp[i]$ to represent the maximum profit we can get before day $i$. So, on day $i$, we have two choices:

	1. Selling on day $i$ might yield a higher profit compared to the previous profit ($dp[i-1]$).
	2. The previous profit is higher, so we don't do anything.

For case 1, the state transition equation is $dp[i]=prices[i]-price_{min}$.
For case 2, it's $dp[i]=dp[i-1]$.
Combining both cases, we get the state transition equation for this problem:

$dp[i]=max(dp[i-1],prices[i]-price_{min})$

The challenge now is how to represent $price_{min}$.

#### Representing $price_{min}$
We realize that calculating $price_{min}$ is also a problem of optimal substructure. We can solve it using dynamic programming too. Let $dp_{price_{min}}[i]$ represent the lowest price of the stock for the first $i$ days. The state transition equation for $dp_{price_{min}}[i]$ can be written as:

$dp_{price_{min}}[i]$ = $min(prices[i],dp_{price_{min}}[i-1])$

Now, let's use $dp[i][j]$ to represent the maximum profit when we have $j$ stocks on day $i$. With this, we can formulate the state transition equation for $dp[i][j]$:

$dp[i][0] = max(dp[i - 1][0], prices[i]+dp[i - 1][1]);$
$dp[i][1] = max(-prices[i], dp[i - 1][1]);$

#### Boundary Conditions
$dp[0][0]$ represents the maximum profit when we have 0 stocks on day 0, so $dp[0][0]=0$.

$dp[0][1]$ represents the maximum profit when we have 1 stock on day 0, so $dp[0][0]=-prices[0]$.

### Code

```cpp
int maxProfit(vector<int>& prices) {
     const int MAX = 100100;
     int dp[MAX][2];
     dp[0][1] = -prices[0],dp[0][0] = 0;
     for (int i = 1; i < prices.size(); i++) 
         dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] + prices[i]),
         dp[i][1] = max(-prices[i], dp[i - 1][1]);
     return dp[prices.size()-1][0];
}
```
Due to space limitations, optimizing space complexity is left for the reader to contemplate.

## [122. Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)
### State Transition Equation
The difference between this and problem 121 lies in the fact that multiple buying operations are allowed here. Consequently, the state transition equation changes accordingly.

Based on the state transition equation from problem 121, when we sell on day $i$, our profit can keep accumulating because there's no restriction on the number of buying operations. Thus, if our maximum profit before day $i-1$ was $dp[i-1][0]$, after selling on day $i$, it becomes $dp[i-1][0]-prices[i]$. Hence, the state transition equation for $dp[i][1]$ becomes:

$dp[i][1] = max(dp[i-1][0]-prices[i], dp[i - 1][1]);$

### Code

```cpp
int maxProfit(vector<int>& prices) {
     const int MAX = 100100;
     int dp[MAX][2];
     dp[0][1] = -prices[0],dp[0][0] = 0;
     for (int i = 1; i < prices.size(); i++)
         dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] + prices[i]),
         dp[i][1] = max(dp[i - 1][0]-prices[i], dp[i - 1][1]);
     return dp[prices.size()-1][0];
}
```

## [714. Best Time to Buy and Sell Stock with Transaction Fee](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)
### State Transition Equation
This problem introduces a fixed transaction fee when selling. If the profit from selling on day $i$ isn't enough to cover the fee, we would prefer the previous profit. Hence, the state transition equation for this problem becomes:

$dp[i][0] = max(dp[i - 1][0], prices[i] - fee+dp[i - 1][1]);$

### Code

```cpp
int maxProfit(vector<int>& prices, int fee) {
     const int MAX = 100100;
     int dp[MAX][2];
     dp[0][1] = -prices[0],dp[0][0] = 0;
     for (int i = 1; i < prices.size(); i++)
         dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] + prices[i] - fee),
         dp[i][1] = max(dp[i - 1][0]-prices[i], dp[i - 1][1]);
     return dp[prices.size()-1][0];
}
```

## [309. Best Time to Buy and Sell Stock with Cooldown](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)
### State Transition Equation
This problem introduces a cooldown period after selling, meaning we can't buy on the next day after selling. This changes the buying state transition equation as it can only happen after a cooldown period. Thus, the state transition equations become:

$dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] + prices[i])$
$dp[i][1] = max(dp[i - 1][2]-prices[i], dp[i - 1][1])$
$dp[i][2] = dp[i - 1][0]$

### Code

```cpp
int maxProfit(vector<int>& prices) {
     const int MAX = 100100;
     int dp[MAX][3];
     dp[0][1] = -prices[0],dp[0][0] = 0;
     for (int i = 1; i < prices.size();

 i++)
         dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] + prices[i]),
         dp[i][1] = max(dp[i - 1][2]-prices[i], dp[i - 1][1]), //
         dp[i][2] = dp[i - 1][0];
     return dp[prices.size()-1][0];
}
```

## [123. Best Time to Buy and Sell Stock III](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/)
### Approach
This problem extends the concept from problem 121 and 122 by introducing a limit on the number of transactions ($k=2$). We use a three-dimensional array to represent the maximum profit with two transactions allowed.

### Code

```cpp
int maxProfit(vector<int>& prices) {
    const int MAX = 100100;
    int dp[MAX][2][2];
    dp[0][1][1] = dp[0][1][0] = -prices[0];
    for (int i = 1; i < prices.size(); i++){
        dp[i][0][0] = max(dp[i - 1][0][0], dp[i - 1][1][0] + prices[i]),
        dp[i][1][0] = max(-prices[i], dp[i - 1][1][0]);
        dp[i][0][1] = max(dp[i - 1][0][1], dp[i - 1][1][1] + prices[i]),
        dp[i][1][1] = max(dp[i - 1][0][0]-prices[i], dp[i - 1][1][1]);
    }
    return dp[prices.size()-1][0][1];
}
```
Although not elegant, this code effectively solves the problem.

## [188. Best Time to Buy and Sell Stock IV](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/)

When the problem extends to $k$, the approach used in problem 123 remains effective. We initialize the boundary as 0 and then use a for loop to calculate the result.

```cpp
 int maxProfit(int k, vector<int>& prices) {
    if(prices.empty()) return NULL;
    const int MAX = 1100;
    int dp[MAX][2][110]={0};
    for(int j = 0; j <= k; j++) dp[0][1][j] = -prices[0];
    for(int i = 1; i < prices.size(); i++)
        for(int  j = 1; j <= k ; j++)
            dp[i][0][j] = max(dp[i-1][1][j] + prices[i], dp[i-1][0][j]),
            dp[i][1][j] = max(dp[i-1][0][j-1] - prices[i], dp[i-1][1][j]);
    return dp[prices.size()-1][0][k];
 }
```

## General Solution for Stock Problems
### State Transition Equation
For stock problems, the three limiting factors are:

 - Current day $i$
 - Stocks held $j$
 - Maximum operations allowed $k$

Let $dp[i][j][k]$ represent the maximum profit on day $i$ with $j$ stocks and $k$ operations allowed. The state transition equation becomes:

$dp[i][0][k] = max(dp[i-1][1][k] + prices[i], dp[i-1][0][k])$
$dp[i][1][k] = max(dp[i-1][0][k-1] - prices[i], dp[i-1][1][k])$

#### Boundary Conditions
$dp[0][1][k] = -prices[0]$
All other values are 0.

## Conclusion
Stock problems have a close relationship with the concept of dynamic programming. Understanding the different types of dynamic programming problems can significantly help in quickly identifying subproblems and formulating state transition equations.