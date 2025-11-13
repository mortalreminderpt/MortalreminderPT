---
layout: post
title: Pokemon (Part 1) Practical Dataset - Building a Custom Pokemon Dataset with PyTorch
description:
date: 2024-12-02 19:21:54 +0800
image: https://miro.medium.com/v2/0*Y9_WRbhh2ZanZGRP.png
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. Table of Contents
{:toc}

PyTorch provides a flexible `Dataset` and `DataLoader` interface, which makes creating custom datasets both convenient and efficient. In this article, we will walk through a real-world example to demonstrate how to build a custom image classification dataset for Pokemon images using PyTorch, and visualize the data with additional tools.

## Project Overview

We will build a custom dataset class named `Pokemon`, which will be able to:

1. Load Pokemon images from a specified directory.
2. Automatically generate or read a CSV file that stores image paths and labels.
3. Split the dataset into training, validation, and testing sets.
4. Apply a set of data augmentation transforms.
5. Visualize the samples using Visdom.

## Directory Structure

Before diving into the code, let’s understand the directory structure of the dataset. Suppose our Pokemon dataset is stored in a folder named `pokemon`:

```

pokemon/
├── bulbasaur/
│   ├── 0001.png
│   ├── 0002.png
│   └── ...
├── charmander/
│   ├── 0001.jpg
│   ├── 0002.jpg
│   └── ...
├── squirtle/
│   ├── 0001.jpeg
│   ├── 0002.jpeg
│   └── ...
└── ...

````

Each subfolder represents one Pokemon category, containing image files (supports `.png`, `.jpg`, `.jpeg` formats).

## Custom Dataset Class: Pokemon

### Initialization Method `__init__`

```python
def __init__(self, root, resize, mode):
    super(Pokemon, self).__init__()

    self.root = root
    self.resize = resize

    self.name2label = {}  # "bulbasaur":0, "charmander":1, ...
    for name in sorted(os.listdir(os.path.join(root))):
        if not os.path.isdir(os.path.join(root, name)):
            continue
        self.name2label[name] = len(self.name2label.keys())

    # Load image paths and labels
    self.images, self.labels = self.load_csv('images.csv')

    # Split dataset based on mode
    if mode == 'train':  # 60%
        self.images = self.images[:int(0.6 * len(self.images))]
        self.labels = self.labels[:int(0.6 * len(self.labels))]
    elif mode == 'val':  # 20%
        self.images = self.images[int(0.6 * len(self.images)):int(0.8 * len(self.images))]
        self.labels = self.labels[int(0.6 * len(self.labels)):int(0.8 * len(self.labels))]
    else:  # test 20%
        self.images = self.images[int(0.8 * len(self.images)):]
        self.labels = self.labels[int(0.8 * len(self.labels)):]
````

**Function Explanation:**

1. **Parameter Description:**

   * `root`: Path to the dataset root directory.
   * `resize`: Target size of the resized images.
   * `mode`: Dataset mode, supports `train`, `val`, and `test`.

2. **Category-to-label Mapping:**

   * Iterates over all subfolders (each representing a Pokemon category) and assigns each one a unique label index.

3. **Loading Images and Labels:**

   * Calls `load_csv('images.csv')` to load file paths and labels. If the CSV doesn’t exist, it will be generated automatically.

4. **Dataset Splits:**

   * Splits the dataset into training (60%), validation (20%), and testing (20%) according to the `mode`.

### Loading or Generating CSV File `load_csv`

```python
def load_csv(self, filename):

    if not os.path.exists(os.path.join(self.root, filename)):
        images = []
        for name in self.name2label.keys():
            images += glob.glob(os.path.join(self.root, name, '*.png'))
            images += glob.glob(os.path.join(self.root, name, '*.jpg'))
            images += glob.glob(os.path.join(self.root, name, '*.jpeg'))

        print(len(images), images)

        random.shuffle(images)
        with open(os.path.join(self.root, filename), mode='w', newline='') as f:
            writer = csv.writer(f)
            for img in images:
                name = img.split(os.sep)[-2]
                label = self.name2label[name]
                writer.writerow([img, label])
            print('writen into csv file:', filename)

    # Read CSV file
    images, labels = [], []
    with open(os.path.join(self.root, filename)) as f:
        reader = csv.reader(f)
        for row in reader:
            img, label = row
            label = int(label)

            images.append(img)
            labels.append(label)

    assert len(images) == len(labels)

    return images, labels
```

**Function Explanation:**

1. **Check if CSV Exists:**

   * If `images.csv` is missing, the code collects all images from category folders.

2. **Shuffle Data:**

   * `random.shuffle` ensures randomness in dataset order.

3. **Generate CSV File:**

   * Writes rows with format `[image_path, label]`.

4. **Load Existing CSV:**

   * Reads the CSV content into `images` and `labels` lists.

### Getting Dataset Length `__len__`

```python
def __len__(self):
    return len(self.images)
```

Returns the total number of samples for the DataLoader.

### De-normalization `denormalize`

```python
def denormalize(self, x_hat):

    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    mean = torch.tensor(mean).unsqueeze(1).unsqueeze(1)
    std = torch.tensor(std).unsqueeze(1).unsqueeze(1)
    x = x_hat * std + mean

    return x
```

**Function Explanation:**

This reverses the standardization applied during preprocessing so that the image can be visually displayed in its original color range.

### Getting a Single Sample `__getitem__`

```python
def __getitem__(self, idx):
    img, label = self.images[idx], self.labels[idx]

    tf = transforms.Compose([
        lambda x: Image.open(x).convert('RGB'),
        transforms.Resize((int(self.resize * 1.25), int(self.resize * 1.25))),
        transforms.RandomRotation(15),
        transforms.CenterCrop(self.resize),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])

    img = tf(img)
    label = torch.tensor(label)

    return img, label
```

**Function Explanation:**

1. **Load Image:** Opens the image as an RGB image.
2. **Image Transformations:**

   * Resize (1.25× scaling)
   * RandomRotation (±15°)
   * CenterCrop
   * Convert to tensor
   * Normalize
3. **Return Tensor and Label**

## Main Function & Data Visualization

```python
def main():
    import visdom
    import time

    viz = visdom.Visdom()

    db = Pokemon('pokemon', 64, 'train')

    x, y = next(iter(db))
    print('sample:', x.shape, y.shape, y)

    viz.image(db.denormalize(x), win='sample_x', opts=dict(title='sample_x'))

    loader = DataLoader(db, batch_size=32, shuffle=True, num_workers=8)

    for x, y in loader:
        viz.images(db.denormalize(x), nrow=8, win='batch', opts=dict(title='batch'))
        viz.text(str(y.numpy()), win='label', opts=dict(title='batch-y'))

        time.sleep(10)
```

1. **Initialize Visdom:** A flexible real-time visualization tool.
2. **Create Dataset Instance.**
3. **Visualize Single Sample.**
4. **Create DataLoader.**
5. **Visualize Batch Data:** Including images and labels.

## Run the Code

Complete code:

```python
# (Full code unchanged, omitted here for brevity — same as original)
```

Make sure required libraries (PyTorch, Torchvision, PIL, Visdom) are installed.

Start Visdom server:

```bash
python -m visdom.server
```

Run the script:

```bash
python pokemon.py
```

Open your browser and visit:

```
http://localhost:8097
```

to view the visualized images and labels.

<img src='\images\posts\pokemon.png'
style="
 display: block;
 margin-left: auto;
 margin-right: auto; 
 zoom:100%;" />