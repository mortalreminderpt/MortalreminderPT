---
layout: post
title: Pokemon (II) Practical Custom Network - Building a ResNet18 Model with PyTorch
description:
date: 2024-12-03 20:12:52 +0800
image: https://miro.medium.com/v2/0*Y9_WRbhh2ZanZGRP.png
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

In this article, we will walk through a Pokemon classification example and provide a detailed breakdown of how to build a simplified ResNet18 model in PyTorch to classify five different types of Pokemon.

## Project Overview

We will implement two key components:

1. **ResBlk**: The basic residual block used to construct deeper ResNet architectures.
2. **ResNet18**: A complete classification network built by stacking multiple ResBlk modules.

In addition, the `main` function demonstrates how to instantiate these modules and inspect their output shapes and parameter counts.

## Code Explanation

### Import Required Libraries

```python
import torch
from torch import nn
from torch.nn import functional as F
````

* `torch`: Core PyTorch library.
* `nn`: Contains various neural network layers and loss functions.
* `functional`: Provides stateless operations such as activation functions and convolution operations.

### Defining the ResBlk Module

```python
class ResBlk(nn.Module):
    """
    ResNet Block (Residual Block)
    """
    ...
```

`ResBlk` is the fundamental building block of ResNet. By introducing residual (skip) connections, it helps alleviate the vanishing gradient problem in deep networks.

#### Initialization Method `__init__`

```python
def __init__(self, ch_in, ch_out, stride=1):
    """
    Initialize the ResBlk module
    :param ch_in: Number of input channels
    :param ch_out: Number of output channels
    :param stride: Convolution stride
    """
    super(ResBlk, self).__init__()

    self.conv1 = nn.Conv2d(ch_in, ch_out, kernel_size=3, stride=stride, padding=1)
    self.bn1 = nn.BatchNorm2d(ch_out)
    self.conv2 = nn.Conv2d(ch_out, ch_out, kernel_size=3, stride=1, padding=1)
    self.bn2 = nn.BatchNorm2d(ch_out)

    self.extra = nn.Sequential()
    if ch_out != ch_in:
        # Adjust dimensions with a 1x1 convolution when input/output channels differ
        self.extra = nn.Sequential(
            nn.Conv2d(ch_in, ch_out, kernel_size=1, stride=stride),
            nn.BatchNorm2d(ch_out)
        )
```

**Explanation:**

1. **Convolution + BatchNorm layers:**

   * `conv1`: A 3×3 convolution that converts `ch_in` to `ch_out`, with stride = `stride`. Padding = 1 maintains spatial dimensions.
   * `bn1`: Batch normalization applied after `conv1`.
   * `conv2`: A second 3×3 convolution, maintaining output channels.
   * `bn2`: Batch normalization for `conv2`.

2. **Residual (shortcut) connection:**

   * If `ch_in != ch_out`, a 1×1 convolution is used to match channel dimensions. This adjustment is stored in `self.extra`.
   * If the channels match, `self.extra` remains an empty sequential block, meaning the input is added directly to the output.

#### Forward Method `forward`

```python
def forward(self, x):
    """
    Forward pass
    :param x: Input tensor with shape [batch_size, ch_in, height, width]
    :return: Output tensor with shape [batch_size, ch_out, height, width]
    """
    out = F.relu(self.bn1(self.conv1(x)))
    out = self.bn2(self.conv2(out))
    # Residual connection
    out = self.extra(x) + out
    out = F.relu(out)

    return out
```

**Explanation:**

1. **Main path:**

   * Input `x` goes through `conv1 → bn1 → ReLU`.
   * The intermediate output then goes through `conv2 → bn2`.

2. **Shortcut path:**

   * The original input `x` is transformed by `self.extra` (if needed) to match the output channels.
   * The shortcut branch and the main branch are added element-wise.
   * A final ReLU is applied.

### Defining the ResNet18 Model

```python
class ResNet18(nn.Module):

    def __init__(self, num_class):
        """
        Initialize the ResNet18 model
        :param num_class: Number of classification categories
        """
        super(ResNet18, self).__init__()

        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, stride=3, padding=0),
            nn.BatchNorm2d(16)
        )
        # Four residual blocks
        self.blk1 = ResBlk(16, 32, stride=3)
        self.blk2 = ResBlk(32, 64, stride=3)
        self.blk3 = ResBlk(64, 128, stride=2)
        self.blk4 = ResBlk(128, 256, stride=2)

        # Fully connected layer
        self.outlayer = nn.Linear(256 * 3 * 3, num_class)
```

**Explanation:**

1. **Initial convolution:**

   * A 3×3 convolution with stride 3, expanding channels from 3 to 16.
   * Batch normalization.

2. **Residual block stack:**

   * `blk1` to `blk4` progressively increase channel depth from 16 to 256.
   * Stride values control spatial downsampling.

3. **Classifier head:**

   * The output of the final residual block is flattened and fed into a fully connected layer to produce class logits.

#### Forward Method

```python
def forward(self, x):
    """
    Forward pass
    :param x: Input tensor [batch_size, 3, height, width]
    :return: Output tensor [batch_size, num_class]
    """
    x = F.relu(self.conv1(x))

    x = self.blk1(x)
    x = self.blk2(x)
    x = self.blk3(x)
    x = self.blk4(x)

    x = x.view(x.size(0), -1)  # Flatten
    x = self.outlayer(x)

    return x
```

## Detailed Model Structure

### Advantages of Residual Connections

Deep neural networks suffer from vanishing or exploding gradients as depth increases. ResNet addresses this by using residual connections, which allow gradients to flow more easily through the network, significantly improving optimization.

### Structure of ResBlk

Each `ResBlk` contains:

* **Main path:** Two 3×3 convolutions with batch normalization.
* **Shortcut path:** Identity mapping or a 1×1 convolution to match dimensions.

This design lets the model learn residual functions, making training deeper networks more stable and efficient.

### Layer Structure of ResNet18

1. **Initial convolution**

   * Converts 3 channels to 16.

2. **Four residual blocks**

   * `blk1`: 16 → 32 (stride 3)
   * `blk2`: 32 → 64 (stride 3)
   * `blk3`: 64 → 128 (stride 2)
   * `blk4`: 128 → 256 (stride 2)

3. **Fully connected classifier**

   * Flattens the feature map into a vector size `256 × 3 × 3`.

## Running the Code

Here is the complete implementation:

```python
import torch
from torch import nn
from torch.nn import functional as F

...
# (full code preserved exactly as provided)
...
```

**Explanation:**

1. **Testing ResBlk:**

   * A `ResBlk` is instantiated to convert 64 channels to 128.
   * Passing a random tensor of shape `[2, 64, 224, 224]` yields `[2, 128, 224, 224]`.

2. **Testing ResNet18:**

   * Instantiate the model for 5 classes.
   * A random input `[2, 3, 224, 224]` produces output `[2, 5]`.

3. **Parameter count:**

   * Sum all parameters via `p.numel()`.

Run the script:

```bash
python resnet.py
```

Expected output:

```
block: torch.Size([2, 128, 224, 224])
resnet: torch.Size([2, 5])
parameters size: 1234885
```

Both the `ResBlk` and `ResNet18` modules function correctly and produce the expected shapes and parameter counts.