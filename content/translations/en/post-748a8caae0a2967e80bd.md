---
layout: post
title: Loss Functions and Gradients
description:
date: 2024-11-23 19:03:11 +0800
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

### What Is a Gradient?

A gradient is the rate of change of a function at a specific point. It represents the direction of the steepest ascent in a multi-dimensional space. Gradients allow us to find minima or maxima of functions, which is crucial in machine learning because they drive optimization.

**Key Concepts**:
- **Derivative**: The slope of a one-dimensional function.
- **Partial Derivative**: The rate of change with respect to one variable in a multi-variable function.
- **Gradient**: A vector of partial derivatives indicating the direction in which a function grows the fastest.

**Code Example**:
```python
import torch

# Example: compute the gradient of y = x^2
x = torch.tensor([2.0], requires_grad=True)
y = x ** 2
y.backward()
print(x.grad)  # dy/dx = 2x = 4
````

```bash
tensor([4.])
```

Gradient descent is a common optimization algorithm that updates parameters in the negative direction of the gradient to reduce the value of the loss function.

---

### Common Functions and Their Gradients

In machine learning, model predictions are usually outputs of parameterized functions. Understanding common functions and their gradient derivations is fundamental for optimization.

**Function Examples**:

Linear function:
$ y = wx + b $

* Gradient:
  $ \frac{\partial y}{\partial w} = x $,
  $ \frac{\partial y}{\partial b} = 1 $

Quadratic function:
$ y = (wx + b)^2 $

* Gradient:
  $ \frac{\partial y}{\partial w} = 2(wx + b)x $,
  $ \frac{\partial y}{\partial b} = 2(wx + b) $

**Code Example**:

```python
# Compute gradients using PyTorch autograd
w = torch.tensor([2.0], requires_grad=True)
b = torch.tensor([1.0], requires_grad=True)
x = torch.tensor([3.0])
y = (w * x + b) ** 2
y.backward()
print(w.grad)  # gradient of w
print(b.grad)  # gradient of b
```

```bash
tensor([42.])
tensor([14.])
```

---

### Activation Functions and Their Gradients

Activation functions introduce nonlinearity into neural networks. Common examples include Sigmoid, Tanh, and ReLU. Their gradients determine how well the network can learn.

**Activation Functions and Gradients**:

Sigmoid:

* Function:
  $ \sigma(x) = \frac{1}{1 + e^{-x}} $
* Gradient:
  $ \sigma'(x) = \sigma(x)(1 - \sigma(x)) $

Tanh:

* Function:
  $ \tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}} $
* Gradient:
  $ \tanh'(x) = 1 - \tanh^2(x) $

ReLU:

* Function:
  $ \text{ReLU}(x) = \max(0, x) $
* Gradient:
  $ \text{ReLU}'(x) = 1 $ (if $ x > 0 $);
  $ 0 $ (if $ x \leq 0 $)

**Code Example**:

```python
import torch.nn.functional as F

x = torch.tensor([-1.0, 0.0, 1.0], requires_grad=True)

# Activation functions
y_sigmoid = torch.sigmoid(x)
y_relu = F.relu(x)

# Compute gradients
y_sigmoid.sum().backward()
print(x.grad)  # Sigmoid gradient

x.grad.zero_()  # reset gradients
y_relu.sum().backward()
print(x.grad)  # ReLU gradient
```

```bash
tensor([0.1966, 0.2500, 0.1966])
tensor([0., 0., 1.])
```

---

### Loss Functions and Their Gradients

Loss functions measure the difference between predictions and ground-truth labels. Common ones include Mean Squared Error (MSE) and Cross-Entropy.

**Typical Loss Functions**:

**Mean Squared Error (MSE)**:

* Formula:
  $ \text{MSE} = \frac{1}{n} \sum (y - \hat{y})^2 $
* Gradient:
  $ \frac{\partial \text{MSE}}{\partial \hat{y}} = -2(y - \hat{y}) $

**Cross-Entropy (CE)** (multiclass):

* Formula:
  $ \text{CE} = -\sum y \log(\hat{y}) $
* Gradient:
  $ \frac{\partial \text{CE}}{\partial \hat{y}} = -\frac{y}{\hat{y}} $

**Code Example**:

```python
# MSE Loss gradient
y_true = torch.tensor([1.0, 0.0])
y_pred = torch.tensor([0.9, 0.1], requires_grad=True)
loss = torch.nn.functional.mse_loss(y_pred, y_true)
loss.backward()
print(y_pred.grad)

# Cross-Entropy Loss gradient
y_pred.grad.zero_()
loss = torch.nn.functional.cross_entropy(y_pred, y_true)
loss.backward()
print(y_pred.grad)
```

```bash
tensor([-0.1000,  0.1000])
tensor([-0.3100,  0.3100])
```

---

### Conclusion

Understanding gradients and loss functions is essential for optimizing deep learning models. With automatic differentiation tools provided by frameworks like PyTorch, we can efficiently compute gradients and update parameters, forming the foundation for building complex neural networks.