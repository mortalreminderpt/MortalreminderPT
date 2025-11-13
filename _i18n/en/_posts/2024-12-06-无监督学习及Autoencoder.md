---
layout: post
title: Unsupervised Learning and Autoencoders
description:
date: 2024-12-06 21:53:06 +1100
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

In machine learning, unsupervised learning has become an important direction for research and practice due to its unique advantages and wide range of applications. This article takes a deep dive into Autoencoder models, introducing their basic concepts, comparing them with Principal Component Analysis (PCA), and explaining Denoising Autoencoders and Dropout Autoencoders.

## Advantages of Unsupervised Learning

### What Is Unsupervised Learning?
Unsupervised learning is a machine learning method designed to discover underlying patterns, structures, or relationships from data without labels. Unlike supervised learning—which requires labeled datasets—unsupervised learning allows the model to explore the intrinsic features of the data on its own.

### Advantages of Unsupervised Learning
1. **Low Data Acquisition Cost**: In real-world scenarios, unlabeled data is often far more abundant and easier to obtain than labeled data. Labeling requires significant human effort and time, whereas unsupervised learning can fully leverage large amounts of unlabeled data.
2. **Discovering Hidden Structures**: Unsupervised learning can reveal hidden structures and patterns in data, such as clusters and association rules—particularly valuable during data exploration and feature engineering.
3. **Data Preprocessing and Dimensionality Reduction**: Through dimensionality reduction techniques, unsupervised learning reduces data dimensionality, lowers computational cost, removes redundancy, and provides more efficient representations for downstream supervised tasks.

## Concept of Autoencoders

### What Is an Autoencoder?
An Autoencoder is a classic unsupervised learning model that aims to learn a low-dimensional representation (encoding) of data and reconstruct the original data from it (decoding). An Autoencoder consists of two parts:
- **Encoder**: Maps high-dimensional input to a low-dimensional latent space.
- **Decoder**: Reconstructs high-dimensional data from the latent representation.

### Structure of an Autoencoder
Below is a simple Autoencoder implemented in PyTorch:

```python
from torch import nn

class AE(nn.Module):
    def __init__(self):
        super(AE, self).__init__()

        # Encoder: [b, 784] => [b, 20]
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 20),
            nn.ReLU()
        )
        # Decoder: [b, 20] => [b, 784]
        self.decoder = nn.Sequential(
            nn.Linear(20, 64),
            nn.ReLU(),
            nn.Linear(64, 256),
            nn.ReLU(),
            nn.Linear(256, 784),
            nn.Sigmoid()
        )

    def forward(self, x):
        """
        :param x: [b, 1, 28, 28]
        :return:
        """
        batchsz = x.size(0)
        # Flatten
        x = x.view(batchsz, 784)
        # Encode
        x = self.encoder(x)
        # Decode
        x = self.decoder(x)
        # Reshape
        x = x.view(batchsz, 1, 28, 28)

        return x, None
````

### Code Explanation

* **Encoder**:

  * Input layer: flattens a 28×28 image into a 784-dimensional vector.
  * Hidden layers: progressively reduce dimensionality to 20 using fully connected layers with ReLU activations for nonlinearity.
* **Decoder**:

  * Recovers the 20-dimensional latent vector back to 784 dimensions via fully connected layers and ReLU.
  * The final Sigmoid layer constrains reconstruction values to [0, 1], suitable for image tasks.
* **Forward Pass**:

  * The input image is encoded into a low-dimensional vector, then decoded back into the reconstructed image.
  * Returns the reconstructed output.

### Applications of Autoencoders

* **Data Compression**: Learn compact representations for efficient storage.
* **Denoising**: Denoising Autoencoders can remove noise from inputs.
* **Feature Extraction**: Extract meaningful features for downstream supervised tasks.
* **Generative Modeling**: Generate new samples similar to training data.

## PCA vs. Autoencoder

### What Is PCA?

Principal Component Analysis (PCA) is a classical linear dimensionality reduction technique that projects high-dimensional data onto directions (principal components) with the largest variance.

### Characteristics of PCA

* **Linear Method**: Only captures linear relationships; cannot model complex nonlinear structures.
* **Computationally Efficient**: Simple and efficient due to its linear formulation.
* **Strong Interpretability**: Principal components have clear statistical meaning and are easy to interpret.

### Characteristics of Autoencoders

* **Nonlinear**: With activation functions, Autoencoders can capture complex nonlinear patterns.
* **Flexible Architecture**: Layer depth and structure can be customized for different data types.
* **Structured Latent Space**: Variants like Variational Autoencoders (VAEs) enforce specific latent distributions, beneficial for generating new samples.

### Comparison Summary

| Feature                      | PCA                                 | Autoencoder (AE)                     |
| ---------------------------- | ----------------------------------- | ------------------------------------ |
| **Dimensionality Reduction** | Linear                              | Nonlinear                            |
| **Computational Complexity** | Low                                 | Higher                               |
| **Interpretability**         | Strong (clear principal components) | Weaker (abstract latent variables)   |
| **Suitable Data Type**       | Linear data                         | Complex, nonlinear data              |
| **Reconstruction Ability**   | Good (linear reconstruction)        | Excellent (nonlinear reconstruction) |

### When to Use Which?

* **PCA**: Best for linear data structures and fast dimensionality reduction.
* **Autoencoder**: Best for complex nonlinear data (images, audio, etc.) requiring more expressive modeling.

## Denoising Autoencoder

A Denoising Autoencoder (DAE) improves Autoencoder robustness by adding noise during training so the model learns to recover clean data.

### Working Principle

1. **Inject Noise**: Add random noise (Gaussian or masking) to inputs.
2. **Encode & Decode**: Use encoder to extract features and decoder to reconstruct.
3. **Training Objective**: Minimize reconstruction error between clean targets and noisy inputs.

### Code Example

Based on the previous Autoencoder, implementing a denoising variant only requires adding noise in the forward pass:

```python
import torch
import torch.nn.functional as F

class DenoisingAE(AE):
    def forward(self, x):
        batchsz = x.size(0)
        # Flatten
        x = x.view(batchsz, 784)
        # Add noise
        noise = torch.randn_like(x) * 0.2
        x_noisy = x + noise
        x_noisy = torch.clamp(x_noisy, 0., 1.)
        # Encode
        encoded = self.encoder(x_noisy)
        # Decode
        decoded = self.decoder(encoded)
        # Reshape
        decoded = decoded.view(batchsz, 1, 28, 28)

        return decoded, None
```

### Applications

* **Image Denoising**: Recover clean images from noisy inputs.
* **Data Augmentation**: Improve model generalization by making data more robust.

### Advantages

* **Improved Robustness**: Handles noisy or missing data more effectively.
* **Better Feature Learning**: Learns more essential and discriminative representations.

## Dropout Autoencoder

### What Is a Dropout Autoencoder?

A Dropout Autoencoder incorporates dropout into the Autoencoder architecture. By randomly dropping neurons, it enhances generalization and prevents overfitting.

### Working Principle

1. **Apply Dropout**: Randomly drop a proportion of neurons in encoding/decoding layers.
2. **Training Dynamics**: Model trains on different neuron subsets each iteration.
3. **Goal**: Encourage reliance on diverse feature combinations for more robust learning.

### Code Example

Dropout layers inserted inside the encoder and decoder:

```python
class DropoutAE(nn.Module):
    def __init__(self):
        super(DropoutAE, self).__init__()

        # Encoder: [b, 784] => [b, 20]
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 20),
            nn.ReLU()
        )
        # Decoder: [b, 20] => [b, 784]
        self.decoder = nn.Sequential(
            nn.Linear(20, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 784),
            nn.Sigmoid()
        )

    def forward(self, x):
        batchsz = x.size(0)
        # Flatten
        x = x.view(batchsz, 784)
        # Encode
        x = self.encoder(x)
        # Decode
        x = self.decoder(x)
        # Reshape
        x = x.view(batchsz, 1, 28, 28)

        return x, None
```

### Applications

* **Image Reconstruction**: Works even when data has noise or missing regions.
* **Feature Extraction**: Learns more stable and generalizable representations.

### Advantages

* **Prevents Overfitting**: Randomly dropping neurons reduces reliance on memorizing noise.
* **Improved Generalization**: Learns more robust features across different data distributions.

## Summary

Autoencoders are powerful unsupervised learning models capable of learning compact representations for compression, denoising, and feature extraction. Compared with traditional linear methods such as PCA, Autoencoders provide stronger nonlinear modeling abilities and capture more complex data structures. Extensions such as Denoising Autoencoders and Dropout Autoencoders further improve robustness and generalization, making them highly effective in practical applications.