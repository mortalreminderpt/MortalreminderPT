---
layout: post
title: Classification Problems
description:
date: 2024-11-25 05:17:42 +0800
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

### Classification with PyTorch

Classification is one of the core tasks in machine learning. With PyTorch, we can build complete solutions ranging from logistic regression to multi-layer neural networks. This article systematically explains six key aspects of applying PyTorch to classification tasks:

---

#### 1. Logistic Regression

Logistic regression is the foundational tool for solving binary classification problems. Its core idea is to use the sigmoid function to map the output of a linear function into the interval $[0, 1]$, representing a probability.

**Core formulas**:
- Linear prediction:  
  $ y = xw + b $
- Probability output using sigmoid:  
  $ y = \sigma(xw + b) $, where $\sigma(x)$ is the sigmoid function.

**Implementation highlights**:
- The output is passed through the sigmoid activation.
- Binary cross-entropy is typically used as the loss function.
- `criterion` does not require labels to be one-hot encoded.
- The `forward` method should not apply softmax manually — PyTorch handles this internally.

**Code example**:
```python
import torch
import torch.nn as nn
import torch.optim as optim

# Data preparation
x_data = torch.tensor([[1.0], [2.0], [3.0]], dtype=torch.float32)
y_data = torch.tensor([[0.0], [0.0], [1.0]], dtype=torch.float32)

# Define logistic regression model
class LogisticRegressionModel(nn.Module):
    def __init__(self):
        super(LogisticRegressionModel, self).__init__()
        self.linear = nn.Linear(1, 1)  # 1 input feature, 1 output feature

    def forward(self, x):
        return torch.sigmoid(self.linear(x))

model = LogisticRegressionModel()
criterion = nn.BCELoss()  # Binary cross-entropy
optimizer = optim.SGD(model.parameters(), lr=0.01)

# Training loop
for epoch in range(10000):
    y_pred = model(x_data)
    loss = criterion(y_pred, y_data)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 2000 == 0:
        print(f"Epoch {epoch + 1}, Loss: {loss.item():.4f}")

# Print learned parameters
print("Training complete.")
print("Model parameters:")
for name, param in model.named_parameters():
    print(f"{name}: {param.data}")

# Test model
with torch.no_grad():
    test_data = torch.tensor([[1.0], [2.0], [3.0], [4.0]], dtype=torch.float32)
    predictions = model(test_data)
    print("Test Predictions:")
    for i, pred in enumerate(predictions):
        print(f"Input: {test_data[i].item()}, Predicted Probability: {pred.item():.4f}, Predicted Class: {1 if pred.item() >= 0.5 else 0}")
````

```bash
Epoch 2000, Loss: 0.3870
Epoch 4000, Loss: 0.2911
Epoch 6000, Loss: 0.2380
Epoch 8000, Loss: 0.2034
Epoch 10000, Loss: 0.1786
Training complete.
Model parameters:
linear.weight: tensor([[2.5076]])
linear.bias: tensor([-6.0840])
Test Predictions:
Input: 1.0, Predicted Probability: 0.0272, Predicted Class: 0
Input: 2.0, Predicted Probability: 0.2556, Predicted Class: 0
Input: 3.0, Predicted Probability: 0.8083, Predicted Class: 1
Input: 4.0, Predicted Probability: 0.9810, Predicted Class: 1
```

---

#### 2. Cross-Entropy

Cross-entropy is one of the most commonly used loss functions for classification tasks, especially when comparing probability distributions.

**Key concept**:

* Measures the difference between two probability distributions.
* For one-hot labels:
  $ H(p, q) = -\sum p(x) \log q(x) $

**Compared with MSE**:

* MSE often leads to vanishing gradients in classification tasks.
* Cross-entropy provides better optimization behavior.

**Code example**:

```python
criterion = nn.CrossEntropyLoss()
# Model outputs logits rather than softmax probabilities
outputs = model(inputs)
loss = criterion(outputs, labels)
```

---

#### 3. Multi-Class Classification

Multi-class classification extends binary classification so the model predicts $N$ class probabilities.

**Core steps**:

1. Use softmax to convert logits into a probability distribution.
2. Use cross-entropy as the loss function.

**Code example**:

```python
import torch.nn.functional as F

class MultiClassModel(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(MultiClassModel, self).__init__()
        self.fc = nn.Linear(input_dim, num_classes)

    def forward(self, x):
        return self.fc(x)  # No softmax — CrossEntropyLoss expects raw logits

model = MultiClassModel(input_dim=10, num_classes=3)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
```

---

#### 4. Fully Connected Layers

Fully connected layers are a key component of neural networks, mapping input features to output space.

**Implementation**:

* Use `nn.Linear` to define the fully connected layers.
* Call them inside `forward()`.

**Code example**:

```python
class FullyConnectedModel(nn.Module):
    def __init__(self):
        super(FullyConnectedModel, self).__init__()
        self.fc1 = nn.Linear(28 * 28, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x
```

---

#### 5. Choosing Activation Functions

Activation functions provide non-linearity for neural networks. Common choices include:

* **ReLU**: Fast and effective, but may cause “dead neurons.”
* **Leaky ReLU**: A solution to dead ReLU units.
* **Softplus**: A smooth version of ReLU.
* **SELU**: Works best under special normalization conditions.

**Code comparison**:

```python
x = torch.tensor([-1.0, 0.0, 1.0])
relu = F.relu(x)
leaky_relu = F.leaky_relu(x)
softplus = F.softplus(x)
```

---

#### 6. MNIST Hands-On Example

The MNIST dataset is a classic benchmark for image classification, consisting of handwritten digits.

**Workflow**:

1. Load the dataset.
2. Define the model (with fully connected layers and activations).
3. Train and evaluate the model.

**Code example**:

```python
# Data preprocessing and loading
transform = transforms.ToTensor()
train_loader = DataLoader(datasets.MNIST('.', train=True, download=True, transform=transform), batch_size=64, shuffle=True)
test_loader = DataLoader(datasets.MNIST('.', train=False, transform=transform), batch_size=1000)

# Initialize device, model, loss function, optimizer
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = FullyConnectedModel().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(5):
    model.train()
    for data, target in train_loader:
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}")

# Testing
model.eval()
correct = 0
with torch.no_grad():
    for data, target in test_loader:
        data, target = data.to(device), target.to(device)
        output = model(data)
        pred = output.argmax(dim=1)
        correct += (pred == target).sum().item()
print(f"Test Accuracy: {100. * correct / len(test_loader.dataset):.2f}%")
```

```bash
Epoch 1, Loss: 0.1609
Epoch 2, Loss: 0.1509
Epoch 3, Loss: 0.0351
Epoch 4, Loss: 0.1062
Epoch 5, Loss: 0.0408
Test Accuracy: 97.61%
```