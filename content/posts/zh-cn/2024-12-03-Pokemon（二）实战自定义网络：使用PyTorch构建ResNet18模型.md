---
layout: post
title: Pokemon（二）实战自定义网络：使用PyTorch构建ResNet18模型
description:
date: 2024-12-03 20:12:52 +0800
image: https://miro.medium.com/v2/0*Y9_WRbhh2ZanZGRP.png
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. 目录
{:toc}

本文将通过Pokemon分类的案例，详细拆解如何使用PyTorch自定义构建一个简化版的ResNet18模型，对五种不同的Pokemon进行分类。

## 项目概述

我们将实现两个关键组件：

1. **ResBlk**：ResNet的基本残差块，用于构建深层网络。
2. **ResNet18**：基于多个ResBlk堆叠而成的完整网络，用于图像分类任务。

此外，主函数将演示如何实例化这些模块并检查其输出形状和参数量。

## 代码解析

### 导入必要库

```python
import torch
from torch import nn
from torch.nn import functional as F
```

- `torch`：PyTorch的核心库。
- `nn`：包含各种神经网络层和损失函数。
- `functional`：提供了许多不需要状态的函数，如激活函数、卷积函数等。

### 定义ResBlk模块

```python
class ResBlk(nn.Module):
    """
    ResNet块（Residual Block）
    """
    ...
```

ResBlk是ResNet的基本构建单元，通过引入残差连接，有助于缓解深层网络中的梯度消失问题。

#### 初始化方法 `__init__`

```python
def __init__(self, ch_in, ch_out, stride=1):
    """
    初始化ResBlk模块
    :param ch_in: 输入通道数
    :param ch_out: 输出通道数
    :param stride: 卷积步幅
    """
    super(ResBlk, self).__init__()

    self.conv1 = nn.Conv2d(ch_in, ch_out, kernel_size=3, stride=stride, padding=1)
    self.bn1 = nn.BatchNorm2d(ch_out)
    self.conv2 = nn.Conv2d(ch_out, ch_out, kernel_size=3, stride=1, padding=1)
    self.bn2 = nn.BatchNorm2d(ch_out)

    self.extra = nn.Sequential()
    if ch_out != ch_in:
        # 当输入通道数不等于输出通道数时，通过1x1卷积调整维度
        self.extra = nn.Sequential(
            nn.Conv2d(ch_in, ch_out, kernel_size=1, stride=stride),
            nn.BatchNorm2d(ch_out)
        )
```

**功能解析：**

1. **卷积层和批归一化层：**
   - `conv1`：3x3卷积，将输入通道数`ch_in`转换为`ch_out`，步幅为`stride`，填充为1以保持空间维度。
   - `bn1`：对`conv1`的输出进行批归一化。
   - `conv2`：另一层3x3卷积，保持通道数不变，步幅为1。
   - `bn2`：对`conv2`的输出进行批归一化。

2. **残差连接（Shortcut Connection）：**
   - 当`ch_in`不等于`ch_out`时，需要通过1x1卷积调整输入的通道数，以匹配输出。这通过`self.extra`实现。
   - 如果`ch_in == ch_out`，`self.extra`为一个空的序列，即输入直接与输出相加。

#### 前向传播方法 `forward`

```python
def forward(self, x):
    """
    前向传播
    :param x: 输入张量，形状为 [batch_size, ch_in, height, width]
    :return: 输出张量，形状为 [batch_size, ch_out, height, width]
    """
    out = F.relu(self.bn1(self.conv1(x)))
    out = self.bn2(self.conv2(out))
    # 残差连接，即短接x和out
    out = self.extra(x) + out
    out = F.relu(out)

    return out
```

**功能解析：**

1. **主路径（Main Path）：**
   - 输入`x`经过`conv1`、`bn1`和ReLU激活函数，得到中间输出。
   - 中间输出经过`conv2`和`bn2`，得到主路径的最终输出`out`。

2. **残差连接（Shortcut Connection）：**
   - 输入`x`通过`self.extra`（可能是1x1卷积）调整后，与主路径的输出`out`相加。
   - 相加后的结果再次通过ReLU激活函数，得到最终输出。

### 定义ResNet18模型

```python
class ResNet18(nn.Module):

    def __init__(self, num_class):
        """
        初始化ResNet18模型
        :param num_class: 分类类别数
        """
        super(ResNet18, self).__init__()

        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, stride=3, padding=0),
            nn.BatchNorm2d(16)
        )
        # 四个残差块
        self.blk1 = ResBlk(16, 32, stride=3)
        self.blk2 = ResBlk(32, 64, stride=3)
        self.blk3 = ResBlk(64, 128, stride=2)
        self.blk4 = ResBlk(128, 256, stride=2)

        # 全连接层，用于将卷积后的数据分成num_class种类型
        self.outlayer = nn.Linear(256 * 3 * 3, num_class)

    def forward(self, x):
        """
        前向传播
        :param x: 输入张量，形状为 [batch_size, 3, height, width]
        :return: 输出张量，形状为 [batch_size, num_class]
        """
        x = F.relu(self.conv1(x))

        x = self.blk1(x)
        x = self.blk2(x)
        x = self.blk3(x)
        x = self.blk4(x)

        x = x.view(x.size(0), -1)  # 展平
        x = self.outlayer(x)

        return x
```

**功能解析：**

1. **初始卷积层：**
   - `self.conv1`：包含一个3x3卷积，将输入图像的3个通道转换为16个通道，步幅为3，填充为0。这将大幅度减少空间维度。
   - 批归一化层`nn.BatchNorm2d(16)`用于稳定训练过程。

2. **残差块堆叠：**
   - `self.blk1`至`self.blk4`分别为四个ResBlk模块，通道数逐渐增加，从16到256。步幅的设置影响输出特征图的空间维度：
     - `blk1`和`blk2`的步幅为3，进一步缩小空间维度。
     - `blk3`和`blk4`的步幅为2，继续缩小空间维度。

3. **全连接层：**
   - `self.outlayer`：将最后一个残差块的输出展平后，通过一个全连接层输出最终的分类结果。输入特征数为`256 * 3 * 3`，输出特征数为`num_class`。

#### 前向传播方法 `forward`

**功能解析：**

1. **初始卷积层：**
   - 输入图像`x`经过`self.conv1`和ReLU激活函数处理。

2. **残差块堆叠：**
   - 依次通过`blk1`、`blk2`、`blk3`和`blk4`进行特征提取和处理。

3. **展平和全连接层：**
   - 将特征图展平为一维向量，便于通过全连接层进行分类。

## 模型结构详解

让我们更深入地了解ResNet18模型的结构及其优势。

### 残差连接的优势

传统的深层网络在增加层数时，可能会遇到梯度消失或爆炸的问题，导致训练困难。而ResNet通过引入残差连接，使得梯度能够更容易地在网络中反向传播，从而有效缓解了这一问题。

### ResBlk模块的构成

每个ResBlk模块包含两个3x3卷积层和相应的批归一化层。关键在于残差连接：

- **主路径（Main Path）：** 包含两层卷积和批归一化，负责提取特征。
- **残差路径（Shortcut Path）：** 直接将输入`x`与主路径的输出相加，形成残差连接。如果输入和输出的通道数不一致，通过1x1卷积调整输入的通道数。

这种设计使得网络更容易优化，同时允许信息在网络中更自由地流动。

### ResNet18模型的层次结构

1. **初始卷积层：**
   - 3x3卷积，步幅为3，将输入图像的通道数从3扩展到16。

2. **四个残差块：**
   - **blk1：** 将通道数从16扩展到32，步幅为3，进一步缩小空间维度。
   - **blk2：** 将通道数从32扩展到64，步幅为3。
   - **blk3：** 将通道数从64扩展到128，步幅为2。
   - **blk4：** 将通道数从128扩展到256，步幅为2。

3. **全连接层：**
   - 将最终的特征图展平，通过全连接层输出最终的分类结果。

## 运行代码

以下是完整的代码实现。

```python
import torch
from torch import nn
from torch.nn import functional as F


class ResBlk(nn.Module):
    """
    ResNet块（Residual Block）
    """

    def __init__(self, ch_in, ch_out, stride=1):
        """
        初始化ResBlk模块
        :param ch_in: 输入通道数
        :param ch_out: 输出通道数
        :param stride: 卷积步幅
        """
        super(ResBlk, self).__init__()

        self.conv1 = nn.Conv2d(ch_in, ch_out, kernel_size=3, stride=stride, padding=1)
        self.bn1 = nn.BatchNorm2d(ch_out)
        self.conv2 = nn.Conv2d(ch_out, ch_out, kernel_size=3, stride=1, padding=1)
        self.bn2 = nn.BatchNorm2d(ch_out)

        self.extra = nn.Sequential()
        if ch_out != ch_in:
            # 当输入通道数不等于输出通道数时，通过1x1卷积调整维度
            self.extra = nn.Sequential(
                nn.Conv2d(ch_in, ch_out, kernel_size=1, stride=stride),
                nn.BatchNorm2d(ch_out)
            )

    def forward(self, x):
        """
        前向传播
        :param x: 输入张量，形状为 [batch_size, ch_in, height, width]
        :return: 输出张量，形状为 [batch_size, ch_out, height, width]
        """
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        # 残差连接
        out = self.extra(x) + out
        out = F.relu(out)

        return out


class ResNet18(nn.Module):

    def __init__(self, num_class):
        """
        初始化ResNet18模型
        :param num_class: 分类类别数
        """
        super(ResNet18, self).__init__()

        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, stride=3, padding=0),
            nn.BatchNorm2d(16)
        )
        # 四个残差块
        self.blk1 = ResBlk(16, 32, stride=3)
        self.blk2 = ResBlk(32, 64, stride=3)
        self.blk3 = ResBlk(64, 128, stride=2)
        self.blk4 = ResBlk(128, 256, stride=2)

        # 全连接层
        self.outlayer = nn.Linear(256 * 3 * 3, num_class)

    def forward(self, x):
        """
        前向传播
        :param x: 输入张量，形状为 [batch_size, 3, height, width]
        :return: 输出张量，形状为 [batch_size, num_class]
        """
        x = F.relu(self.conv1(x))

        x = self.blk1(x)
        x = self.blk2(x)
        x = self.blk3(x)
        x = self.blk4(x)

        x = x.view(x.size(0), -1)  # 展平
        x = self.outlayer(x)

        return x


def main():
    # 测试ResBlk
    blk = ResBlk(64, 128)
    tmp = torch.randn(2, 64, 224, 224)
    out = blk(tmp)
    print('block output shape:', out.shape)  # 预期输出形状：[2, 128, 224, 224]

    # 测试ResNet18
    model = ResNet18(5)
    tmp = torch.randn(2, 3, 224, 224)
    out = model(tmp)
    print('resnet output shape:', out.shape)  # 预期输出形状：[2, 5]

    # 计算模型参数量
    p = sum(map(lambda p: p.numel(), model.parameters()))
    print('Total parameters:', p)


if __name__ == '__main__':
    main()
```

**功能解析：**

1. **测试ResBlk模块：**
   - 实例化一个ResBlk，将输入通道数64转换为输出通道数128。
   - 创建一个随机张量`tmp`，形状为[2, 64, 224, 224]，模拟批量大小为2的输入。
   - 将`tmp`输入到ResBlk中，输出形状应为[2, 128, 224, 224]。

2. **测试ResNet18模型：**
   - 实例化ResNet18模型，假设分类任务有5个类别。
   - 创建一个随机张量`tmp`，形状为[2, 3, 224, 224]，模拟批量大小为2的输入图像。
   - 将`tmp`输入到ResNet18中，输出形状应为[2, 5]，对应5个类别的预测分数。

3. **计算模型参数量：**
   - 使用`model.parameters()`获取模型所有参数。
   - 通过`p.numel()`计算每个参数的元素数量，并求和得到模型的总参数量。

确保已经安装了PyTorch。然后，运行脚本：

```bash
python resnet.py
```

预期输出示例：

```
block: torch.Size([2, 128, 224, 224])
resnet: torch.Size([2, 5])
parameters size: 1234885
```

这表明ResBlk和ResNet18模块均已成功运行，并输出了预期的形状和参数量。