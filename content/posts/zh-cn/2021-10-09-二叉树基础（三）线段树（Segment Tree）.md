---
layout: post

title: 二叉树基础（三） 线段树（Segment Tree）

description: 二叉树（Binary tree）是指树中节点的度不大于2的有序树，它是一种最简单且最重要的树。

date: 2021-10-09 19:00:50 +0800

image: /images/covers/数据结构-cover1.png

tags:
- 算法
- 数据结构
- 二叉树
- 树型数据结构
---

1. 目录
{:toc}

## 概念
线段树是常用于**维护区间信息**的数据结构

线段树可以在$O(logn)$的时间复杂度内实现单点修改、区间修改、区间查询（区间求和，求区间最大值，求区间最小值）等操作

### 结构

线段树将每个长度不为$1$的区间划分成左右两个区间递归求解，把整个线段划分为一个树形结构，通过合并左右两区间信息来求得该区间的信息。这种数据结构可以方便的进行大部分的区间操作。

假设以线段树存储数组$a=[6,7,8,9,10]$，设线段树的根节点编号为$1$，用数组$node$来保存线段树，$node[i]$用来保存线段树上编号为$i$的节点的值

该线段树的结构如下

![在这里插入图片描述](/images/posts/segmenttree1.png)
代码如下

```cpp
    vector<int> node; // 线段树下标从1开始
    vector<int> nums; // 辅助建树
    int N;
```

## 基本操作
### 线段树的建立

对于节点$i$，其子节点的编号为$2i$以及$2i+1$，若节点$i$存储的区间为$[a,b]$，则节点$2i$存储的区间应该是$[a,\frac{a+b}{2}]$，相应地，节点$2i+1$存储的区间为$[\frac{a+b}{2}+1,b]$。我们可以采用递归的方式建树，代码如下

```cpp
void build(int i, int l, int r) { // i表示当前节点, l表示左边界, r表示右边界
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

### 区间查询
若查询的区间为$[1,5]$，我们只需直接返回$node[1]$，但如果我们查询的是$[3,5]$，则需要合并$[3,3]$和$[4,5]$的答案，代码如下

```cpp
int query(int i, int l, int r, int s, int t) { //i表示当前节点, [l,r]是查询区间, [s,t]表示当前节点包含区间
    if (l <= s && r >= t) // 若[s,t]是[l,r]的子区间，直接返回
        return node[i];
    int sum = 0, mid = (s + t) / 2; //递归查询存在交集的子区间
    if (l <= mid) sum += query(2 * i, l, r, s, mid); // 递归查询左字串
    if (r >= mid + 1) sum += query(2 * i + 1, l, r, mid + 1, t); // 递归查询右字串
    return sum;
}
```
### 区间修改
和区间查询相同，若区间存在包含关系，我们可以为其直接加上所需要更新的值，而当区间存在交集时，进行递归更新，代码如下

```cpp
void update(int i, int l, int r, int s, int t, int add) {
    if (l <= s && r >= t) { // 若[s,t]是[l,r]的子区间，直接更新
        node[i] += (t - s + 1) * add;
        return;
    }
    int mid = (s + t) / 2; //递归更新存在交集的子区间
    if (l <= mid) update(2 * i, l, r, s, mid, add); // 递归更新左字串
    if (r >= mid + 1) update(2 * i + 1, l, r, mid + 1, t, add); // 递归更新右字串
    node[i] = node[2 * i] + node[2 * i + 1];
}
```
### 懒惰标记
当我们按照上面的方法对$[6,7,8,9,10]$的区间$[3,5]$加上$2$后，更新后的线段树结构如下
![在这里插入图片描述](/images/posts/segmenttree2.png)
我们会发现，在进行递归更新时，递归执行到节点$3$时就已经结束了，因此节点$3$的两个子节点没有被更新

遇到这种情况，我们需要给递归结束的节点打上一个标记，在下一次查询操作时将没有更新的子节点更新，这个标记被称为懒惰标记，这样更新时效果如图

![在这里插入图片描述](/images/posts/segmenttree3.png)

而查询后的效果如下

![在这里插入图片描述](/images/posts/segmenttree4.png)
我们可以用`vector<int> lazy`来存储懒惰标记，下方懒惰标记的代码如下
```cpp
void push_down(int i, int l, int r) {
    if (!lazy[i])
        return;
    int mid = (l + r) / 2;
    lazy[2 * i] += lazy[i];
    lazy[2 * i + 1] += lazy[i];             // 下放懒惰标记
    node[2 * i] += (mid - l + 1) * lazy[i];
    node[2 * i + 1] += (r - mid) * lazy[i]; // 将懒惰标记的值加给子树
    lazy[i] = 0;
}
```
然后在查询和更新函数中调用`push_down()`即可

## 整体代码

```cpp
class SegmentTree {
public:
    vector<int> node; // 线段树下标从1开始
    vector<int> lazy; // 懒惰标记
    vector<int> nums; // 辅助建树
    int N = 1;

    SegmentTree(vector<int> nums, int n) : node(n + 1, 0), lazy(n + 1, 0), nums(nums) {}

    void build(int i, int l, int r) { // i表示当前节点, l表示左边界, r表示右边界
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
        lazy[2 * i + 1] += lazy[i];             // 下放懒惰标记
        node[2 * i] += (mid - l + 1) * lazy[i];
        node[2 * i + 1] += (r - mid) * lazy[i]; // 将懒惰标记的值加给子树
        lazy[i] = 0;
    }

    int query(int i, int l, int r, int s, int t) { //i表示当前节点, [l,r]是查询区间, [s,t]表示当前节点包含区间
        if (l <= s && r >= t) // 若[s,t]是[l,r]的子区间，直接返回
            return node[i];
        push_down(i, s, t);
        int sum = 0, mid = (s + t) / 2; //递归查询存在交集的子区间
        if (l <= mid) sum += query(2 * i, l, r, s, mid); // 递归查询左字串
        if (r >= mid + 1) sum += query(2 * i + 1, l, r, mid + 1, t); // 递归查询右字串
        return sum;
    }

    void update(int i, int l, int r, int s, int t, int add) {
        if (l <= s && r >= t) { // 若[s,t]是[l,r]的子区间，直接更新
            lazy[i] += add;
            node[i] += (t - s + 1) * add;
            return;
        }
        push_down(i, s, t);
        int mid = (s + t) / 2; //递归更新存在交集的子区间
        if (l <= mid) update(2 * i, l, r, s, mid, add); // 递归更新左字串
        if (r >= mid + 1) update(2 * i + 1, l, r, mid + 1, t, add); // 递归更新右字串
        node[i] = node[2 * i] + node[2 * i + 1];
    }
};
```
