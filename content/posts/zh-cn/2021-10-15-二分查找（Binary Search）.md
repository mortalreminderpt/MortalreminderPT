---
layout: post
featured: false
title: "二分查找（Binary Search）"
image: /images/covers/blackrock2.jpg
description: 二分查找是对已排好序的数组查找特定值的常用方法，二分查找不必遍历整个序列，只需关注序列的边界及中间值即可，因此时间复杂度可以达到 O(log n)
date: 2021-10-15 20:51:55 +0800
tags:
- 算法
---

1. 目录
{:toc}

## 概念
二分查找是对已排好序的数组查找特定值的常用方法，二分查找不必遍历整个序列，只需关注序列的边界及中间值即可，因此时间复杂度可以达到$$O(logn)$$

### 模板

在一个有序序列中查找关键字$$key$$的模板代码如下

```cpp
int binarySearch(vector<int>& nums, int key) {
    int l = 0, r = nums.size() - 1, ans = nums.size();
    while (l <= r) {
        int mid = (l + r) / 2;
        if (nums[mid] < key)
            l = mid + 1;
        else
            r = mid - 1, ans = mid;
    }
    return ans;
}
```
## 题目

二分的题目模板一般都是固定的，主要是能否想到的对什么进行二分，怎样二分。

### [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode-cn.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

该题不仅要求元素出现的第一个位置，还要求出元素出现的最后一个位置。在模板代码中，若`nums[i] < key`，才会继续查找左边，如果我们想在已经找到元素后继续查找，则需要修改为`nums[i] <= key`。这样查找的结果是大于$$key$$的第一个元素的位置。因此该题的代码如下

```cpp
class Solution {
public:
    int binarySearch(vector<int> &nums, int key, bool next) {
        int l = 0, r = nums.size() - 1, ans = nums.size();
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[mid] < key || (last && nums[mid] <= key))
                l = mid + 1;
            else
                r = mid - 1, ans = mid;
        }
        return ans;
    }
    vector<int> searchRange(vector<int> &nums, int target) {
        int l = binarySearch(nums, target, false),
                r = binarySearch(nums, target, true) - 1;
        if (l <= r)
            return {l, r};
        else return {-1, -1};
    }
};
```
### [74. 搜索二维矩阵](https://leetcode-cn.com/problems/search-a-2d-matrix/)

依题可知待查找元素必大于或等于该行第一个元素，因此我们先对列进行一次二分查找，寻找不大于$$target$$的最大元素

之后对该行进行基本的二分查找，即可得到结果。代码如下

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>> &matrix, int target) {
        int l = 0, r = matrix.size() - 1, ans = matrix.size(), res = matrix[0].size();
        // 先找小于target的第一个数的位置
        while (l <= r) {
            int mid = (l + r) / 2;
            if (matrix[mid][0] > target) r = mid - 1;
            else  					     l = mid + 1, ans = mid;
        }
        if (ans < 0 || ans >= matrix.size()) return false;
        l = 0, r = matrix[0].size() - 1;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (matrix[ans][mid] > target) r = mid - 1;
            else						   l = mid + 1, res = mid;
        }
        return matrix[ans][res] == target;
    }
};
```
### [33. 搜索旋转排序数组](https://leetcode-cn.com/problems/search-in-rotated-sorted-array/)

该题只保证了数组的局部有序，但对数组进行二分后，会发现总有一半的数组是有序的，此时可以继续对有序的数组进行二分查找，代码如下

```cpp
class Solution {
public:
    int binarySearch(vector<int> nums, int key, int s, int t) {
        int l = s, r = t - 1, ans = t;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[mid] > key) {
                r = mid - 1;
            } else {
                l = mid + 1;
                ans = mid;
            }
        }
        return (ans < t && nums[ans] == key) ? ans : -1;
    }
    int search(vector<int> &nums, int target) {
        int l = 0, r = nums.size() - 1, ans = -1;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] < nums[mid]) {
                ans = binarySearch(nums, target, l, mid);
                l = mid + 1;
            } else {
                ans = binarySearch(nums, target, mid + 1, r + 1);
                r = mid - 1;
            }
            if (ans >= 0) return ans;
        }
        return ans;
    }
};
```



### [153. 寻找旋转排序数组中的最小值](https://leetcode-cn.com/problems/find-minimum-in-rotated-sorted-array/)

该题要查找的是上一题中旋转的排序数组的最小值，也即旋转点的值，我们依然利用部分有序的性质，二分查找数组最小值，代码如下

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int l = 0, r = nums.size() - 1, ans = nums.size();
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[r] > nums[mid])
                r = mid;
            else
                l = mid + 1, ans = mid;
        }
        return nums[ans];
    }
};
```
### [162. 寻找峰值](https://leetcode-cn.com/problems/find-peak-element/)

我们可以用$$[l,r]$$来存储可能存在峰值的区间，根据$$mid$$进行二分，若`nums[mid] < nums[mid + 1]`则说明在区间$$[mid+1,r]$$存在峰值，反之则说明在区间[l,mid]存在峰值，因此代码如下

```cpp
class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) { // 用l,r表示可能存在峰值的区间
            int mid = (l + r) / 2;
            if (l == r) return l;
            if (nums[mid] < nums[mid + 1])
                l = mid + 1;//mid+1-r更大
            else
                r = mid;//l-mid更大
        }
        return -1;
    }
};
```
