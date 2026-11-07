---
layout: post
title: Reconstructing the MNIST Dataset Using VAE
description:
date: 2024-12-08 19:12:54 +1100
image: https://about.fb.com/wp-content/uploads/2022/09/PyTorch-Foundation-Launch_Header.jpg
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

In previous blog posts, we introduced the Autoencoder, a neural network architecture used in unsupervised learning with widespread applications in dimensionality reduction, feature learning, and data generation. The Variational Autoencoder (VAE) is an extension of the Autoencoder that incorporates concepts from probabilistic graphical models, enabling it to generate more coherent and higher-quality samples.

A VAE is a generative model that learns the latent distribution of data to generate new samples. Unlike traditional autoencoders, which output a fixed latent vector, a VAE outputs the parameters of a latent distribution (mean μ and standard deviation σ). This allows the VAE to generate diverse outputs by sampling latent variables.

In this post, we will implement a VAE using PyTorch and perform image reconstruction on the MNIST dataset.

The main steps include:

1. **Encoder**: Maps input data to the latent distribution parameters (μ and σ).  
2. **Reparameterization**: Samples latent variables using μ and σ while keeping the computation differentiable.  
3. **Decoder**: Maps latent variables back to the input space to generate reconstructed data.  
4. **Loss Function**: Combines reconstruction loss with KL divergence for optimization.

## Project Structure

This project contains two main components:

1. **Main training script**: Handles data loading, model training, testing, and visualization.  
2. **VAE model definition**: Defines both the encoder and decoder modules.

```plaintext
project/
│
├── main.py          # Main training script
└── vae.py           # VAE model definition
````

## Code Explanation

### Defining the VAE Model

In `vae.py`, we define the VAE architecture:

```python
import torch
from torch import nn

class VAE(nn.Module):

    def __init__(self):
        super(VAE, self).__init__()

        # encoder: input 784 (flattened 28x28 image) -> hidden 256 -> hidden 64 -> output 20 (μ and σ, each 10 dims)
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 20),
            nn.ReLU()
        )
        # decoder: latent dim 10 -> hidden 64 -> hidden 256 -> output 784
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
        # flatten to [b, 784]
        x = x.view(batchsz, 784)
        # encoder output [b, 20], containing μ and σ
        h_ = self.encoder(x)
        # split into μ and σ, each of size [b, 10]
        mu, sigma = h_.chunk(2, dim=1)
        # Reparameterization trick: h = μ + σ * ε, where ε ~ N(0,1)
        h = mu + sigma * torch.randn_like(sigma)

        # decoder reconstructs image
        x_hat = self.decoder(h)
        x_hat = x_hat.view(batchsz, 1, 28, 28)

        # KL divergence between N(mu, sigma) and standard normal N(0,1)
        kld = 0.5 * torch.sum(
            torch.pow(mu, 2) +
            torch.pow(sigma, 2) -
            torch.log(1e-8 + torch.pow(sigma, 2)) - 1
        ) / (batchsz * 28 * 28)

        return x_hat, kld
```

#### Model Structure

* **Encoder**:

  * Input layer: 784 dimensions (flattened 28×28 image)
  * Hidden Layer 1: 256 units, ReLU
  * Hidden Layer 2: 64 units, ReLU
  * Output Layer: 20 units (μ and σ, each 10-dimensional), ReLU

* **Decoder**:

  * Input: 10-dimensional latent variable
  * Hidden Layer 1: 64 units, ReLU
  * Hidden Layer 2: 256 units, ReLU
  * Output Layer: 784 units, Sigmoid (maps values to [0,1])

#### Forward Pass

1. **Flatten the input**: `[b, 1, 28, 28] → [b, 784]`
2. **Encode**: Generate μ and σ.
3. **Reparameterize**: Sample latent variable using μ + σ * ε.
4. **Decode**: Generate reconstructed image `x_hat`.
5. **Compute KL divergence**: Measures difference between the learned latent distribution and a standard Gaussian.

### Training and Testing Workflow

In `main.py`, we define the overall training and evaluation logic.

```python
import torch
from torch.utils.data import DataLoader
from torch import nn, optim
from torchvision import transforms, datasets

from vae import VAE

import visdom


def main():
    # Load MNIST training data
    mnist_train = datasets.MNIST('.', True, transform=transforms.Compose([
        transforms.ToTensor()
    ]), download=True)
    mnist_train = DataLoader(mnist_train, batch_size=32, shuffle=True)

    # Load MNIST testing data
    mnist_test = datasets.MNIST('.', False, transform=transforms.Compose([
        transforms.ToTensor()
    ]), download=True)
    mnist_test = DataLoader(mnist_test, batch_size=32, shuffle=True)

    # Inspect a batch
    x, _ = iter(mnist_train).next()
    print('x:', x.shape)

    # Device setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = VAE().to(device)
    criteon = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    print(model)

    # Start Visdom dashboard
    # Run in terminal: python -m visdom.server
    viz = visdom.Visdom()

    for epoch in range(1000):

        model.train()
        for batchidx, (x, _) in enumerate(mnist_train):
            x = x.to(device)

            x_hat, kld = model(x)
            loss = criteon(x_hat, x)

            if kld is not None:
                elbo = - loss - 1.0 * kld
                loss = - elbo

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        print(epoch, 'loss:', loss.item(), 'kld:', kld.item())

        # Evaluation
        model.eval()
        x, _ = iter(mnist_test).next()
        x = x.to(device)
        with torch.no_grad():
            x_hat, kld = model(x)

        # visualize original and reconstructed images
        viz.images(x.cpu(), nrow=8, win='x', opts=dict(title='x'))
        viz.images(x_hat.cpu(), nrow=8, win='x_hat', opts=dict(title='x_hat'))


if __name__ == '__main__':
    main()
```

#### Detailed Steps

1. **Data Loading**

   * Use `torchvision.datasets.MNIST` to load MNIST.
   * Wrap with `DataLoader` (batch size 32, shuffle for training).

2. **Device Setup**

   * Use GPU when available.

3. **Model, Loss, Optimizer**

   * Instantiate the VAE and move it to the device.
   * Use Mean Squared Error for reconstruction loss.
   * Adam optimizer with learning rate `1e-3`.

4. **Visualization**

   * Visdom is used for real-time visualization.
   * Start with:

     ```bash
     python -m visdom.server
     ```

5. **Training Loop**

   * Train for 1000 epochs.
   * For each batch:

     * Forward pass to compute `x_hat` and `kld`.
     * Compute loss = reconstruction loss + KL divergence.
     * Backpropagate and update parameters.

6. **Testing & Visualization**

   * After each epoch, evaluate on one test batch.
   * Visualize original images and reconstructed outputs.

## Results

After about 50 epochs, the reconstructed images look like this:

<img src='\images\posts\vae_practice.jpg'
style="
 display: block;
 margin-left: auto;
 margin-right: auto; 
 zoom:100%;" />

We can observe that the model captures the main structure of digits quite well, although some reconstructions still contain incorrect digits. This may be due to limited training time or the simplicity of the model architecture.

## Summary

In this post, we demonstrated how to implement a Variational Autoencoder using PyTorch and apply it to MNIST image reconstruction. VAEs allow not only reconstruction of input images but also exploration and sampling of the latent structure of data. They have broad applications in generative modeling, anomaly detection, semi-supervised learning, and more.