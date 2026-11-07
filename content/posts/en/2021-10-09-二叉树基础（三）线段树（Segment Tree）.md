---
layout: post

title: Binary Tree Basics (Part 3) - Segment Tree

description: A binary tree is an ordered tree where each node has a maximum of two children. It is the simplest and most essential type of tree.

date: 2021-10-09 19:00:50 +0800

image: /images/covers/数据结构-cover1.png

tags:
- Algorithms
- Data Structures
- Binary Tree
- Tree Data Structures
---

1. Table of Contents
{:toc}

## Concept
A segment tree is a data structure commonly used for **maintaining interval information**.

Segment trees can perform operations like single-point modification, interval modification, and interval queries (such as interval sum, maximum value, minimum value) in $O(\log n)$ time complexity.

### Structure

A segment tree divides each interval of non-unit length into left and right sub-intervals recursively. It forms a tree structure where the entire segment is divided. The information of the interval is obtained by merging the information of the left and right sub-intervals. This data structure facilitates most interval operations.

Suppose we have an array $a=[6,7,8,9,10]$. Let the root node of the segment tree be numbered $1$, and we use an array $node$ to store the segment tree, where $node[i]$ stores the value of the node with index $i$ in the segment tree.

The structure of this segment tree is as follows:

![Segment Tree Structure](/images/posts/segmenttree1.png)

Here's the corresponding code:

```cpp
    vector<int> node; // Segment tree indexing starts from 1
    vector<int> nums; // Auxiliary for building the tree
    int N;
```

## Basic Operations
### Building the Segment Tree

For a node $i$, its child nodes are numbered $2i$ and $2i+1$. If node $i$ stores the interval $[a,b]$, then node $2i$ should store the interval $[a,\frac{a+b}{2}]$, and similarly, node $2i+1$ should store the interval $[\frac{a+b}{2}+1,b]$. We can build the tree recursively. Here's the code:

```cpp
void build(int i, int l, int r) { // i represents the current node, l represents the left boundary, r represents the right boundary
    if (l == r) {
        node[i] = nums[l];
        return;
    }
    int mid = (l + r) / 2;
    build(2 * i, l, mid);
    build(2 * i + 1, mid + 1, r);
    node[i] = node[2 * i] + node[2 * i + 1];
}
```

### Interval Query
If the query interval is $[1,5]$, we can directly return $node[1]$. But if the query is $[3,5]$, we need to merge the answers of $[3,3]$ and $[4,5]$. Here's the code:

```cpp
int query(int i, int l, int r, int s, int t) { // i represents the current node, [l,r] is the query interval, [s,t] represents the interval covered by the current node
    if (l <= s && r >= t) // If [s,t] is a sub-interval of [l,r], directly return
        return node[i];
    int sum = 0, mid = (s + t) / 2; // Recursively query sub-intervals with intersections
    if (l <= mid) sum += query(2 * i, l, r, s, mid); // Recursively query left subtree
    if (r >= mid + 1) sum += query(2 * i + 1, l, r, mid + 1, t); // Recursively query right subtree
    return sum;
}
```

### Interval Modification
Similar to interval queries, if there's a containment relationship, we can directly add the value to be updated. If there's an intersection, we perform recursive updates. Here's the code:

```cpp
void update(int i, int l, int r, int s, int t, int add) {
    if (l <= s && r >= t) { // If [s,t] is a sub-interval of [l,r], directly update
        node[i] += (t - s + 1) * add;
        return;
    }
    int mid = (s + t) / 2; // Recursively update sub-intervals with intersections
    if (l <= mid) update(2 * i, l, r, s, mid, add); // Recursively update left subtree
    if (r >= mid + 1) update(2 * i + 1, l, r, mid + 1, t, add); // Recursively update right subtree
    node[i] = node[2 * i] + node[2 * i + 1];
}
```

### Lazy Propagation
When updating the interval $[3,5]$ of the array $[6,7,8,9,10]$ by adding $2$, the updated segment tree structure becomes:

![Segment Tree Lazy Propagation](/images/posts/segmenttree2.png)

We notice that when recursively updating, the process stops at node $3$, leaving its two child nodes unchanged.

To handle this, we introduce lazy propagation. We mark the nodes where recursion ends with a flag. During the next query operation, we update the unprocessed child nodes. This flag is called a lazy tag. The effect of updating is as follows:

![Segment Tree Lazy Propagation Update](/images/posts/segmenttree3.png)

And the effect after querying is as follows:

![Segment Tree Lazy Propagation Query](/images/posts/segmenttree4.png)

We can use a `vector<int> lazy` to store the lazy tags. Here's the lazy propagation code:

```cpp
void push_down(int i, int l, int r) {
    if (!lazy[i])
        return;
    int mid = (l + r) / 2;
    lazy[2 * i] += lazy[i];
    lazy[2 * i + 1] += lazy[i];             // Propagate lazy tag down
    node[2 * i] += (mid - l + 1) * lazy[i];
    node[2 * i + 1] += (r - mid) * lazy[i]; // Add the value of the lazy tag to the child nodes
    lazy[i] = 0;
}
```

Then call `push_down()` in the query and update functions accordingly.

## Complete Code

```cpp
class SegmentTree {
public:
    vector<int> node; // Segment tree indexing starts from 1
    vector<int> lazy; // Lazy tags
    vector<int> nums; // Auxiliary for building the tree
    int N = 1;

    SegmentTree(vector<int> nums, int n) : node(n + 1, 0), lazy(n + 1, 0), nums(nums) {}

    void build(int i, int l, int r) { // i represents the current node

, l represents the left boundary, r represents the right boundary
        N++;
        if (l == r) {
            node[i] = nums[l - 1];
            return;
        }
        int mid = (l + r) / 2;
        build(2 * i, l, mid);
        build(2 * i + 1, mid + 1, r);
        node[i] = node[2 * i] + node[2 * i + 1];
    }

    void push_down(int i, int l, int r) {
        if (!lazy[i])
            return;
        int mid = (l + r) / 2;
        lazy[2 * i] += lazy[i];
        lazy[2 * i + 1] += lazy[i];             // Propagate lazy tag down
        node[2 * i] += (mid - l + 1) * lazy[i];
        node[2 * i + 1] += (r - mid) * lazy[i]; // Add the value of the lazy tag to the child nodes
        lazy[i] = 0;
    }

    int query(int i, int l, int r, int s, int t) { // i represents the current node, [l,r] is the query interval, [s,t] represents the interval covered by the current node
        if (l <= s && r >= t) // If [s,t] is a sub-interval of [l,r], directly return
            return node[i];
        push_down(i, s, t);
        int sum = 0, mid = (s + t) / 2; // Recursively query sub-intervals with intersections
        if (l <= mid) sum += query(2 * i, l, r, s, mid); // Recursively query left subtree
        if (r >= mid + 1) sum += query(2 * i + 1, l, r, mid + 1, t); // Recursively query right subtree
        return sum;
    }

    void update(int i, int l, int r, int s, int t, int add) {
        if (l <= s && r >= t) { // If [s,t] is a sub-interval of [l,r], directly update
            lazy[i] += add;
            node[i] += (t - s + 1) * add;
            return;
        }
        push_down(i, s, t);
        int mid = (s + t) / 2; // Recursively update sub-intervals with intersections
        if (l <= mid) update(2 * i, l, r, s, mid, add); // Recursively update left subtree
        if (r >= mid + 1) update(2 * i + 1, l, r, mid + 1, t, add); // Recursively update right subtree
        node[i] = node[2 * i] + node[2 * i + 1];
    }
};
```
