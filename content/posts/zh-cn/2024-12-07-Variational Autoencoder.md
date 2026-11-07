---
layout: post
title: Variational Autoencoder
description:
date: 2024-12-07 20:17:35 +1100
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. 目录
{:toc}

在前面的博客中，我们介绍了自编码器（Autoencoder, AE）的基本概念及其应用。相比之下，**变分自编码器（Variational Autoencoder, VAE）** 是一种更为强大的生成模型，在图像生成、数据降维和异常检测等任务中得到了广泛应用。与传统的AE不同，VAE通过引入概率生成过程和潜在变量的分布假设，不仅能够有效地进行数据重构，还能生成具有更好连续性和多样性的样本。VAE的这种生成能力使其在生成新数据和捕捉数据分布方面具有显著优势。此外，VAE在优化过程中通过最大化下界（ELBO）来同时优化重构误差和潜在空间的正则化，这一机制使得VAE在训练稳定性和生成质量上表现优异。本文将带领你深入了解VAE的原理、优化目标以及其中的关键概念，如KL散度，同时结合一段PyTorch代码，帮助你更好地理解VAE的工作机制。

## 什么是变分自编码器（VAE）？

自编码器（Autoencoder）是一种通过将输入数据压缩成低维表示再重构回原始数据的神经网络。与传统自编码器不同，**变分自编码器**不仅能够重构输入数据，还能生成新的、与训练数据分布相似的数据样本。VAE通过引入概率模型，使得潜在空间（Latent Space）具有良好的连续性和可解释性，从而实现更有效的生成能力。

## VAE的架构：编码器与解码器

VAE主要由两个部分组成：

1. **编码器（Encoder）**：将输入数据映射到潜在空间，输出潜在变量的**均值（μ）**和**标准差（σ）**。
2. **解码器（Decoder）**：根据潜在变量从潜在空间中生成新的数据。

让我们通过以下PyTorch代码来具体看看VAE的结构：

```python
import torch
from torch import nn

class VAE(nn.Module):

    def __init__(self):
        super(VAE, self).__init__()

        # 编码器：输入维度784（28x28图像展平） -> 隐藏层256 -> 隐藏层64 -> 输出层20（包含μ和σ各10维）
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 20),
            nn.ReLU()
        )
        # 解码器：潜在变量10维 -> 隐藏层64 -> 隐藏层256 -> 输出层784
        self.decoder = nn.Sequential(
            nn.Linear(10, 64),
            nn.ReLU(),
            nn.Linear(64, 256),
            nn.ReLU(),
            nn.Linear(256, 784),
            nn.Sigmoid()
        )

        self.criteon = nn.MSELoss()

    def forward(self, x):
        """
        :param x: [b, 1, 28, 28]
        :return: 重构后的图像和KL散度
        """
        batchsz = x.size(0)
        # 将图像展平为[b, 784]
        x = x.view(batchsz, 784)
        # 编码器输出[h_, [b, 20]]，包括μ和σ
        h_ = self.encoder(x)
        # 将h_拆分为μ和σ，每个都是[b, 10]
        mu, sigma = h_.chunk(2, dim=1)
        # 重参数化技巧：h = μ + σ * ε，其中ε ~ N(0,1)
        h = mu + sigma * torch.randn_like(sigma)

        # 解码器生成重构图像
        x_hat = self.decoder(h)
        # 将重构图像恢复为[b, 1, 28, 28]
        x_hat = x_hat.view(batchsz, 1, 28, 28)

        # 计算KL散度，P：ε ~ N(0,1)；q：N(mu, sigma)
        kld = 0.5 * torch.sum(
            torch.pow(mu, 2) +
            torch.pow(sigma, 2) -
            torch.log(1e-8 + torch.pow(sigma, 2)) - 1
        ) / (batchsz * 28 * 28)

        return x_hat, kld
```

## 潜在空间与重参数化技巧

在VAE中，**潜在空间**是数据的低维表示空间。编码器将输入数据映射到潜在空间，输出均值（μ）和标准差（σ），然后通过**重参数化技巧**（Reparameterization Trick）生成潜在变量**z**：

$$
z = \mu + \sigma \cdot \epsilon \quad \text{其中} \quad \epsilon \sim \mathcal{N}(0, 1)
$$

这种方法允许梯度通过随机变量传递，从而实现端到端的训练。

在代码中，这一步由以下两行实现：

```python
mu, sigma = h_.chunk(2, dim=1)
h = mu + sigma * torch.randn_like(sigma)
```

总的来看，从神经网络角度看VAE网络如下图所示：

<img src='\images\posts\vae.png'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />

## 优化目标：重建损失与KL散度

VAE的目标是最大化**证据下界（Evidence Lower Bound, ELBO）**，即最小化以下损失函数：

$$
\mathcal{L} = \mathbb{E}_{q(z|x)}[\log p(x|z)] - \text{KL}(q(z|x) \| p(z))
$$

其中：

- $ \mathbb{E}_{q(z\|x)}[\log p(x\|z)] $ 是**重建损失**，衡量生成的数据与原始数据的相似度。
- $ \text{KL}(q(z\|x) \| p(z)) $ 是**KL散度**，衡量编码器输出的分布 $ q(z\|x) $ 与先验分布 $ p(z) $ （通常是标准正态分布$\mathcal{N}(0,1)$）的差异。

在代码中，重建损失采用均方误差（MSELoss），而KL散度的计算如下：

```python
kld = 0.5 * torch.sum(
    torch.pow(mu, 2) +
    torch.pow(sigma, 2) -
    torch.log(1e-8 + torch.pow(sigma, 2)) - 1
) / (batchsz * 28 * 28)
```

### KL散度详解

**KL散度**（Kullback-Leibler Divergence）是衡量两个概率分布之间差异的指标。在VAE中，它用于确保编码器生成的潜在分布接近先验分布，从而使潜在空间具有良好的结构性。

对于高斯分布，KL散度的公式为：

$$
\text{KL}(\mathcal{N}(\mu, \sigma^2) \| \mathcal{N}(0, 1)) = \frac{1}{2} \sum_{i=1}^{D} \left( \mu_i^2 + \sigma_i^2 - \log(\sigma_i^2) - 1 \right)
$$

代码中每个样本的KL散度通过对$\mu$和$\sigma$进行逐元素计算，并取平均得到。

## VAE的公式解析

综合上述内容，VAE的损失函数可以表示为：

$$
\mathcal{L} = \mathbb{E}_{q(z|x)}[\|x - \hat{x}\|^2] + \text{KL}(\mathcal{N}(\mu, \sigma^2) \| \mathcal{N}(0, 1))
$$

其中：

- 第一项是重建误差，确保生成的$\hat{x}$与原始$x$尽可能接近。
- 第二项是KL散度，确保潜在变量$z$的分布接近标准正态分布。

## 代码解析

让我们逐步解析上述代码，理解其如何实现VAE的原理：

1. **编码器（Encoder）**：
    - 输入是展平后的28x28图像（784维）。
    - 经过两层隐藏层后，输出20维向量，其中前10维为$\mu$，后10维为$\sigma$。
  
2. **重参数化（Reparameterization）**：
    - 将$\mu$和$\sigma$分离后，通过 $ z = \mu + \sigma \cdot \epsilon $ 生成潜在变量$z$，其中$\epsilon$来自标准正态分布。

3. **解码器（Decoder）**：
    - 输入是10维的潜在变量$z$。
    - 经过两层隐藏层后，输出784维向量，经过Sigmoid激活函数，得到重构的图像$\hat{x}$。

4. **损失计算**：
    - 使用均方误差（MSE）作为重建损失。
    - 计算KL散度，确保潜在分布接近标准正态分布。

## 总结

变分自编码器（VAE）通过引入概率模型和重参数化技巧，有效地将数据映射到一个有结构的潜在空间中。其优化目标结合了重建误差和KL散度，使得模型不仅能够高质量地重构数据，还具备强大的生成能力。