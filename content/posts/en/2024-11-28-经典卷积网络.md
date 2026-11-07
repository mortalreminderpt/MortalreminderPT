---
layout: post
title: Classic Convolutional Networks
description:
date: 2024-11-28 08:38:25 +0800
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

### The Development of Classic Convolutional Neural Networks

In this post, we will review several classic convolutional neural network architectures from modern deep learning. By outlining their backgrounds and key innovations, we aim to help readers understand how convolutional networks have evolved and what core ideas drive their design.

---

#### LeNet-5: A Pioneer of Neural Networks
**Background**: LeNet-5, introduced in 1998 by Yann LeCun and colleagues, is one of the earliest representative CNN architectures. It was primarily used for handwritten digit recognition (e.g., the MNIST dataset).

**Key Innovations**:
- **Hierarchical structure**: The combination of convolution, pooling, and fully connected layers laid the foundation for modern CNN architectures.
- **Parameter sharing**: Convolution operations drastically reduced the number of parameters.
- **Use of the Sigmoid activation function**: Enabled nonlinear modeling.

**Impact**: LeNet-5 achieved a 99.2% accuracy on handwritten digit recognition, demonstrating the potential of neural networks.

---

#### AlexNet: The Rise of Deep Learning
**Background**: Proposed by Alex Krizhevsky in 2012, AlexNet delivered a breakthrough performance in the ImageNet competition. Its success greatly surpassed traditional approaches and marked a major milestone for deep learning.

**Key Innovations**:
- **GPU-accelerated training**: Greatly reduced training time and signaled the beginning of modern deep learning.
- **Deeper architecture**: Composed of 8 layers, making it significantly deeper than LeNet-5.
- **ReLU activation**: Replaced Sigmoid, alleviating vanishing gradients.
- **Dropout regularization**: Effectively reduced overfitting.

---

#### VGG: The Power of Simplicity
**Background**: In 2014, the VGG architecture was proposed by Oxford University. Its core idea is increasing network depth by simply stacking convolutional layers.

**Key Innovations**:
- **Uniform kernel sizes**: Primarily used 3×3 and 1×1 convolutions, improving representation ability.
- **Depth-performance relationship**: Demonstrated that deeper networks can achieve better performance.
- **Multiple variants**: Ranging from 11 to 19 layers, suitable for different needs.

---

#### GoogLeNet: Introducing the Inception Module
**Background**: Also in 2014, GoogLeNet won the ILSVRC competition. It introduced the revolutionary Inception module.

**Key Innovations**:
- **Inception module**: Applied multiple convolution kernels (1×1, 3×3, 5×5) in parallel for multi-scale feature extraction.
- **Parameter optimization**: Used 1×1 convolutions to reduce computation and parameter count.
- **Deep structure**: 22 layers deep, yet highly efficient due to modular design.

---

#### ResNet: A Revolution in Deep Networks
**Background**: As networks grew deeper, vanishing gradients and training difficulties became prominent issues. ResNet, introduced in 2015 by Kaiming He et al., addressed these challenges.

**Key Innovations**:
- **Residual connections**: Skip connections mitigate gradient vanishing and enhance feature propagation.
- **Training ultra-deep networks**: Successfully trained networks exceeding 1000 layers.
- **Modular design**: Residual blocks made extension and modification more flexible.

---

#### DenseNet: Further Optimizing Information Flow
**Background**: Building on ResNet, DenseNet introduced a new perspective with dense connections for enhanced feature reuse.

**Key Innovations**:
- **Dense connectivity**: All layers are directly connected, ensuring efficient information and gradient flow.
- **Parameter efficiency**: Despite more connections, total parameters remain moderate due to feature sharing.
- **Computational efficiency**: Improved training and inference efficiency.

---

### Summary
From LeNet to ResNet and DenseNet, convolutional neural networks have advanced in depth and complexity, with each step bringing significant performance improvements. These classic architectures laid the foundation for modern computer vision and inspired model design across many domains. If LeNet represents the starting point, then ResNet and DenseNet are major milestones that opened new possibilities for the development of deep learning.