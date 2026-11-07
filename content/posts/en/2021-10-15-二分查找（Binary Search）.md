---
layout: post
featured: false
title: "Binary Search"
image: /images/covers/blackrock2.jpg
description: Binary search is a common method for finding a specific value in a sorted array. It doesn't need to traverse the entire sequence; it only needs to focus on the boundaries and the middle value of the sequence. Therefore, its time complexity can reach O(log n).
date: 2021-10-15 20:51:55 +0800
tags:
- Algorithms
---

1. Table of Contents
{:toc}

## Concept
Binary search is a common method for finding a specific value in a sorted array. It doesn't need to traverse the entire sequence; it only needs to focus on the boundaries and the middle value of the sequence. Therefore, its time complexity can reach $$O(\log n)$$.

### Template

The template code for finding the key in a sorted sequence is as follows:

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

## Problems

The template for binary search problems is usually fixed. The key is to determine what to binary search and how to perform the binary search.

### [34. Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

This problem requires not only finding the first occurrence of an element but also the last occurrence. In the template code, if `nums[i] < key`, it continues searching on the left side. To continue searching after finding the element, we need to modify it to `nums[i] <= key`. This modification finds the position of the first element greater than or equal to $$key$$. Therefore, the code for this problem is as follows:

```cpp
class Solution {
public:
    int binarySearch(vector<int> &nums, int key, bool last) {
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

### [74. Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/)

According to the problem, the element to be searched must be greater than or equal to the first element in its row. Therefore, we first perform a binary search on the columns to find the largest element not greater than $$target$$.

Then, we perform a basic binary search on that row to find the result. The code for this problem is as follows:

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>> &matrix, int target) {
        int l = 0, r = matrix.size() - 1, ans = matrix.size(), res = matrix[0].size();
        // Find the position of the first element greater than target
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

### [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

This problem only guarantees partial order in the array. However, after binary partitioning the array, we always find that one half of the array is sorted. In this case, we can continue to binary search the sorted part of the array. The code for this problem is as follows:

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

### [153. Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

This problem requires finding the minimum value in the rotated sorted array, which is the value at the rotation point found in the previous problem. We still utilize the partially ordered property and perform binary search to find the minimum value in the array. The code for this problem is as follows:

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

### [162. Find Peak Element](https://leetcode.com/problems/find-peak-element/)

We can use the $$[l,r]$$ range

 to store the possible intervals containing peaks. Based on the midpoint, we perform binary search. If `nums[mid] < nums[mid + 1]`, it means a peak exists in the $$[mid+1,r]$$ interval; otherwise, it exists in the $$[l,mid]$$ interval. The code for this problem is as follows:

```cpp
class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) { // Use l,r to represent possible intervals containing peaks
            int mid = (l + r) / 2;
            if (l == r) return l;
            if (nums[mid] < nums[mid + 1])
                l = mid + 1; // mid+1 to r has a larger value
            else
                r = mid; // l to mid has a larger value
        }
        return -1;
    }
};
```
