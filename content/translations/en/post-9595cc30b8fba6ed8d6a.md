---
layout: post
title: Vanishing and Exploding Gradients
description:
date: 2024-12-01 14:32:37 +0800
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

In deep learning, vanishing gradients and exploding gradients are two common and challenging issues, especially prominent when training deep neural networks such as Convolutional Neural Networks (CNNs) and Recurrent Neural Networks (RNNs). This post explains in detail the principles, effects, and mitigation strategies for these phenomena in CNNs and RNNs, complemented with mathematical formulas to enhance understanding.

## What Are Vanishing and Exploding Gradients?

During neural network training, backpropagation is used to compute gradients of the loss function with respect to parameters at each layer. These gradients are used to update parameters and minimize the loss. However, when a network becomes very deep or has a complex structure, gradients may shrink toward zero (vanishing gradients) or grow uncontrollably large (exploding gradients) as they propagate through the layers.

### Vanishing Gradient

A vanishing gradient refers to a situation where, during backpropagation, gradients gradually shrink as they pass through layers, resulting in parameters near the input layer barely being updated. This prevents the network from learning effective representations, causing training stagnation.

### Exploding Gradient

Exploding gradients occur when gradients grow larger as they propagate backward, eventually becoming excessively large. This leads to unstable parameter updates and even numerical overflow, making training infeasible.

## Mathematical Principles Behind Vanishing and Exploding Gradients

Consider a deep neural network. The gradient of the loss function $ L $ with respect to the parameters of layer $ l $, denoted $ W^l $, can be expressed as:

$$
\frac{\partial L}{\partial W^l} = \frac{\partial L}{\partial a^L} \cdot \prod_{k=l+1}^{L} \frac{\partial a^k}{\partial a^{k-1}} \cdot \frac{\partial a^l}{\partial W^l}
$$

where $ a^k $ is the activation of layer $ k $. We can see that the gradient is the product of derivatives between layers. If the magnitudes of these derivatives are less than 1, the product tends toward zero as depth increases (vanishing gradient). Conversely, if the derivatives are greater than 1, the product increases rapidly (exploding gradient). This is the mathematical root of these problems.

## Vanishing and Exploding Gradients in CNNs

### Introduction to Convolutional Neural Networks (CNNs)

CNNs are primarily used for grid-like data such as images. Their core component is the convolutional layer, which extracts local features using filters and captures higher-level representations by stacking multiple layers.

### Gradient Issues in CNNs

Although CNNs face fewer gradient problems than RNNs due to their local connectivity and absence of long-term dependencies, very deep CNNs can still suffer from vanishing gradients. For example, classic VGG networks contain more than ten convolutional layers and may encounter gradient vanishing in training.

### Mitigation Strategies

1. **Using Appropriate Activation Functions**  
   ReLU and its variants help alleviate vanishing gradients because their derivative is 1 in the positive region.

   $ \text{ReLU}(x) = \max(0, x) $

2. **Weight Initialization**  
   Proper initialization (He or Xavier) maintains stable activation and gradient variance across layers.

   - **Xavier Initialization** (for Sigmoid/Tanh):

     $ W \sim \mathcal{N}\left(0, \frac{2}{n_{\text{in}} + n_{\text{out}}}\right) $

   - **He Initialization** (for ReLU):

     $ W \sim \mathcal{N}\left(0, \frac{2}{n_{\text{in}}}\right) $

3. **Batch Normalization (BN)**  
   BN normalizes layer inputs to keep activations within a reasonable range, stabilizing gradient flow.

   $ \hat{x} = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} $
   
   where $ \mu $ and $ \sigma^2 $ are the mean and variance of the batch data, respectively, and $ \epsilon $ is a small constant to prevent division by zero.

4. **Residual Connections**  
   Skip connections allow gradients to flow directly, greatly reducing vanishing gradients.

   $ y = \mathcal{F}(x, \{W_i\}) + x $
   
   where $ \mathcal{F} $ is a combination of certain layers and $ x $ is the input.

## Vanishing and Exploding Gradients in RNNs

### Introduction to Recurrent Neural Networks (RNNs)

RNNs are designed for sequential data such as natural language and time series. Their recurrent structure allows accumulation of temporal information but also makes them prone to vanishing and exploding gradients, especially over long sequences.

### Gradient Issues in RNNs

In standard RNNs, the hidden state $ h_t $ is computed as:

$ h_t = \tanh(W_h h_{t-1} + W_x x_t + b) $

Backpropagation Through Time (BPTT) involves multiplying gradients across many time steps, causing them to decrease or increase exponentially.

### Mitigation Strategies

1. **Gradient Clipping**  
   Limit the gradient norm to prevent exploding gradients. For example, when the L2 norm of the gradient exceeds a certain threshold, scale it to that threshold.

   $ g \leftarrow \frac{g}{\|g\|_2} \cdot \text{threshold} $

2. **Using More Advanced RNN Units**  
   LSTM and GRU use gating mechanisms to control information flow and preserve long-term dependencies.

   - **LSTM unit** contains input gate, forget gate, and output gate, with the following equations:

$$
\begin{aligned}
f_t &= \sigma\left(W_f \cdot \left[ h_{t-1},\ x_t \right] + b_f\right) \\
i_t &= \sigma\left(W_i \cdot \left[ h_{t-1},\ x_t \right] + b_i\right) \\
\tilde{C}_t &= \tanh\left(W_C \cdot \left[ h_{t-1},\ x_t \right] + b_C\right) \\
C_t &= f_t \cdot C_{t-1} + i_t \cdot \tilde{C}_t \\
o_t &= \sigma\left(W_o \cdot \left[ h_{t-1},\ x_t \right] + b_o\right) \\
h_t &= o_t \cdot \tanh\left(C_t\right)
\end{aligned}
$$

  - Through these gates, LSTM can effectively maintain long-term dependencies and reduce the risk of vanishing gradients.

3. **Weight Initialization and Regularization**  
   Appropriate initialization and regularization help stabilize training.

4. **Alternative Activation Functions**  
   Although less common, some RNN variants use ReLU or other activations to help gradient propagation.

## Practical Tips

1. Choose LSTM or GRU over standard RNNs for long-term dependency tasks.
2. Initialize weights according to the activation function (He or Xavier).
3. Use Batch Normalization in CNNs to improve stability and speed.
4. Apply gradient clipping in RNN training to prevent explosions.
5. Regularly monitor gradient distributions to detect problems early.

## Conclusion

Vanishing and exploding gradients are fundamental issues in deep learning. Understanding their origins and mitigation strategies is essential for building stable and effective neural networks. Through careful architecture design, activation selection, initialization, normalization, and gradient clipping, one can greatly reduce these problems and improve model performance. This article aims to help you better understand and address gradient issues to build more robust deep learning models.

# References

1. *Understanding the difficulty of training deep feedforward neural networks* — Glorot & Bengio  
2. *Deep Residual Learning for Image Recognition* — He et al.  
3. *Long Short-Term Memory* — Hochreiter & Schmidhuber
