---
layout: post
title: Pokemon (IV) Practical Transfer Learning
description:
date: 2024-12-05 21:45:12 +0800
image: https://miro.medium.com/v2/0*Y9_WRbhh2ZanZGRP.png
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

In the previous posts, we introduced how to use PyTorch to customize a `Dataset` class for loading and preprocessing the Pokemon image dataset, build a simplified ResNet18 model, and perform model training, validation, and testing.  
This post focuses on **Transfer Learning** and its application to the Pokemon image classification task. By leveraging a pretrained ResNet18 model, we can further improve performance and training efficiency.

## Overview of Transfer Learning

**Transfer Learning** is a machine learning technique in which a model trained on a large dataset (e.g., ImageNet) is reused for a new but related task. It is especially effective in the following scenarios:

- **Limited data**: When the target task lacks enough data to train a deep neural network from scratch, transfer learning allows us to reuse the pretrained model's feature extraction capability.
- **Limited training time**: Since the pretrained model has already learned rich representations, training time can be significantly reduced.
- **Performance improvement**: In many tasks, transfer learning leads to substantial performance gains, particularly when the target and source tasks share similar characteristics.

In this project, we will use the pretrained ResNet18 model from `torchvision`, then fine-tune it for our Pokemon classification task.

## Differences Between Transfer Learning and Training From Scratch

In earlier posts, we trained a custom ResNet18 model entirely from scratch. This approach requires a large amount of data and computational resources, and the training process is long. Transfer learning optimizes this process in the following ways:

1. **Reuse pretrained weights**: Instead of learning everything from zero, we load weights already trained on a large-scale dataset.
2. **Modify the output layer**: We adjust the last layer based on the number of classes in our target task.
3. **Accelerate training**: Pretrained models already capture useful image features, enabling faster convergence and better performance.

Below is the key transfer-learning code, and we will explain how it differs from normal training.

```python
from torchvision.models import resnet18
from .utils import Flatten

# Load the pretrained ResNet18 model
trained_model = resnet18(pretrained=True)

# Modify the model: remove the final fully connected layer and add custom layers
model = nn.Sequential(
    *list(trained_model.children())[:-1],  # Remove the original final FC layer
    Flatten(),                              # Flatten feature maps into vectors
    nn.Linear(512, 5)                       # New FC layer for 5 Pokemon classes
).to(device)
````

### Loading the Pretrained Model

```python
from torchvision.models import resnet18

# Load the pretrained ResNet18 model
trained_model = resnet18(pretrained=True)
```

**Explanation:**

* **Pretrained parameters**: Setting `pretrained=True` loads the model weights trained on the ImageNet dataset. These weights contain rich visual feature representations that help speed up training and improve performance.
* **Model architecture**: The pretrained model includes the full ResNet18 structure, consisting of convolutional layers, batch normalization layers, residual connections, and the final fully connected layer.

### Modifying the Model Structure

```python
from .utils import Flatten

# Modify the model: remove the final FC layer and add custom layers
model = nn.Sequential(
    *list(trained_model.children())[:-1],  # Remove the final FC layer from ResNet18
    Flatten(),                              # Flatten multi-dimensional tensors
    nn.Linear(512, 5)                       # New FC layer for 5 output classes
).to(device)
```

**Explanation:**

1. **Removing the final layer**

   * `*list(trained_model.children())[:-1]` extracts all child modules of ResNet18 except the final fully connected (`fc`) layer.
   * This preserves the feature extraction backbone.

2. **Adding the Flatten layer**

   * `Flatten()` reshapes the tensor into a 2D matrix.
     For example, an input of shape `[batch_size, 512, 1, 1]` becomes `[batch_size, 512]`.
   * Example implementation:

     ```python
     import torch.nn as nn

     class Flatten(nn.Module):
         def forward(self, x):
             return x.view(x.size(0), -1)
     ```

3. **Adding a new fully connected layer**

   * `nn.Linear(512, 5)` maps the 512-dimensional feature vector to the 5 Pokemon classes.

## Training Results

The overall training workflow is similar to the previous posts, so here we directly present the results:

```
best acc: 0.9871244635193133 best epoch: 9
loaded from ckpt!
test acc: 0.9399141630901288
```

<img src='\images\posts\train-transfer.png'
style="
 display: block;
 margin-left: auto;
 margin-right: auto; 
 zoom:100%;" />

Compared with training from scratch, transfer learning improved the test accuracy by about **5%**.
