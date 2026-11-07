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

1. Table of Contents
{:toc}

In the previous blog posts, we introduced the basic concept and applications of Autoencoders (AE). Compared with traditional AEs, a **Variational Autoencoder (VAE)** is a more powerful generative model that has been widely used in tasks such as image generation, dimensionality reduction, and anomaly detection. Unlike a standard autoencoder, a VAE introduces a probabilistic generative process and assumes a distribution over the latent variables. This not only enables effective data reconstruction but also allows the model to generate new samples with better continuity and diversity. This generative capability makes VAE significantly stronger in capturing and modeling data distributions. In addition, VAE optimizes the model by maximizing the Evidence Lower Bound (ELBO), which simultaneously optimizes reconstruction error and regularization of the latent space. This mechanism leads to improved training stability and higher-quality generation. In this article, we will dive into the principle of VAEs, their optimization objective, key concepts such as KL divergence, and provide PyTorch code to help you understand how a VAE works.

## What Is a Variational Autoencoder (VAE)?

An Autoencoder is a neural network that compresses input data into a low-dimensional representation and then reconstructs it. Unlike traditional autoencoders, a **Variational Autoencoder** not only reconstructs the input but also generates new samples similar to the training data. VAE achieves this by introducing a probabilistic model that encourages continuity and interpretability in the latent space, thereby enabling more effective generative capabilities.

## VAE Architecture: Encoder and Decoder

A VAE consists of two main components:

1. **Encoder**: Maps input data to the latent space and outputs the **mean (μ)** and **standard deviation (σ)** of the latent variables.
2. **Decoder**: Generates new data from latent variables sampled from the latent space.

Let’s take a look at the following PyTorch implementation for reference:

```python
import torch
from torch import nn

class VAE(nn.Module):

    def __init__(self):
        super(VAE, self).__init__()

        # Encoder: input 784 (flattened 28x28 image) -> hidden 256 -> hidden 64 -> output 20 (μ and σ, each 10 dims)
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 20),
            nn.ReLU()
        )
        # Decoder: latent variable 10 dims -> hidden 64 -> hidden 256 -> output 784
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
        :return: reconstructed image and KL divergence
        """
        batchsz = x.size(0)
        # Flatten the image into [b, 784]
        x = x.view(batchsz, 784)
        # Encoder output [b, 20], consisting of μ and σ
        h_ = self.encoder(x)
        # Split into μ and σ, each [b, 10]
        mu, sigma = h_.chunk(2, dim=1)
        # Reparameterization trick: h = μ + σ * ε where ε ~ N(0,1)
        h = mu + sigma * torch.randn_like(sigma)

        # Decoder generates reconstructed image
        x_hat = self.decoder(h)
        # Restore shape to [b, 1, 28, 28]
        x_hat = x_hat.view(batchsz, 1, 28, 28)

        # Compute KL divergence, P: ε ~ N(0,1); q: N(mu, sigma)
        kld = 0.5 * torch.sum(
            torch.pow(mu, 2) +
            torch.pow(sigma, 2) -
            torch.log(1e-8 + torch.pow(sigma, 2)) - 1
        ) / (batchsz * 28 * 28)

        return x_hat, kld
````

## Latent Space and the Reparameterization Trick

In a VAE, the **latent space** represents a low-dimensional compressed representation of the data. The encoder maps inputs to this space by outputting μ and σ, and uses the **reparameterization trick** to generate the latent variable **z**:

$$
z = \mu + \sigma \cdot \epsilon \quad \text{where} \quad \epsilon \sim \mathcal{N}(0, 1)
$$

This allows gradients to propagate through the sampling process, enabling end-to-end training.

In the code, the reparameterization is performed with:

```python
mu, sigma = h_.chunk(2, dim=1)
h = mu + sigma * torch.randn_like(sigma)
```

From the neural-network perspective, the VAE architecture can be visualized as follows:

<img src='\images\posts\vae.png'
style="
 display: block;
 margin-left: auto;
 margin-right: auto; 
 zoom:100%;" />

## Optimization Objective: Reconstruction Loss and KL Divergence

VAE aims to maximize the **Evidence Lower Bound (ELBO)**, which corresponds to minimizing the following loss function:

$$
\mathcal{L} = \mathbb{E}_{q(z|x)}[\log p(x|z)] - \text{KL}(q(z|x) | p(z))
$$

Where:

* $ \mathbb{E}_{q(z|x)}[\log p(x|z)] $ is the **reconstruction loss**, measuring similarity between reconstructed and original data.
* $ \text{KL}(q(z|x) | p(z)) $ is the **KL divergence**, measuring how close the encoder’s distribution is to the prior distribution ( p(z) = \mathcal{N}(0,1) ).

In the code, reconstruction uses MSE, and the KL divergence is computed as:

```python
kld = 0.5 * torch.sum(
    torch.pow(mu, 2) +
    torch.pow(sigma, 2) -
    torch.log(1e-8 + torch.pow(sigma, 2)) - 1
) / (batchsz * 28 * 28)
```

### KL Divergence Explained

**KL divergence** measures the difference between two probability distributions. In a VAE, it ensures that the encoder outputs a latent distribution close to the prior, preserving structure and continuity in the latent space.

For Gaussian distributions, KL divergence is:

$$
\text{KL}(\mathcal{N}(\mu, \sigma^2) | \mathcal{N}(0, 1))
= \frac{1}{2} \sum_{i=1}^{D}
\left( \mu_i^2 + \sigma_i^2 - \log(\sigma_i^2) - 1 \right)
$$

The code computes this term element-wise and averages over the batch.

## Mathematical Formulation of VAE

Combining everything, the VAE loss is:

$$
\mathcal{L}
= \mathbb{E}_{q(z|x)}[|x - \hat{x}|^2]

* \text{KL}(\mathcal{N}(\mu, \sigma^2) | \mathcal{N}(0, 1))
  $$

Where:

* The first term enforces accurate reconstruction.
* The second term regularizes the latent distribution toward the standard normal.

## Code Walkthrough

Let’s summarize the implementation step by step:

1. **Encoder**:

   * Input: flattened 28×28 image (784 dimensions)
   * Output: a 20-dim vector containing μ and σ (each 10 dims)

2. **Reparameterization**:

   * Uses $ z = \mu + \sigma \cdot \epsilon $, where ε is Gaussian noise

3. **Decoder**:

   * Input: 10-dim latent vector z
   * Output: 784-dim reconstructed image passed through Sigmoid

4. **Loss**:

   * MSE for reconstruction
   * KL divergence to regularize the latent distribution

## Summary

Variational Autoencoders (VAEs) introduce probabilistic modeling and the reparameterization trick to map data into a structured latent space. The optimization objective combines reconstruction loss and KL divergence, enabling the model to reconstruct input data while possessing strong generative ability.