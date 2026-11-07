---
layout: post
title: Pokemon（一）实战Dataset：使用PyTorch构建自定义Pokemon数据集
description:
date: 2024-12-02 19:21:54 +0800
image: https://miro.medium.com/v2/0*Y9_WRbhh2ZanZGRP.png
tags:
- Algorithm
- Python
- Pytorch
category: ['Algorithm']
---

1. 目录
{:toc}

PyTorch提供了灵活的`Dataset`和`DataLoader`接口，使得自定义数据集的创建变得简便高效。本文将通过一个实际案例，详细拆解如何使用PyTorch构建一个用于分类的Pokemon图像数据集，并结合可视化工具进行数据展示。

## 项目概述

我们将构建一个名为`Pokemon`的自定义数据集类，该类能够：

1. 从指定目录加载Pokemon图像。
2. 自动生成或读取一个CSV文件，存储图像路径及其对应的标签。
3. 将数据集划分为训练集、验证集和测试集。
4. 应用一系列图像变换以增强数据。
5. 使用Visdom进行数据的可视化展示。

## 目录结构

在深入代码之前，我们先了解一下数据的目录结构。假设我们的Pokemon数据集存放在一个名为`pokemon`的文件夹中，目录结构如下：

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
```

每个子文件夹代表一个Pokemon类别，里面包含了该类别的图像文件（支持`.png`, `.jpg`, `.jpeg`格式）。

## 自定义Dataset类：Pokemon

### 初始化方法 `__init__`

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

    # 加载图像路径和标签
    self.images, self.labels = self.load_csv('images.csv')

    # 根据mode划分数据集
    if mode == 'train':  # 60%
        self.images = self.images[:int(0.6 * len(self.images))]
        self.labels = self.labels[:int(0.6 * len(self.labels))]
    elif mode == 'val':  # 20%
        self.images = self.images[int(0.6 * len(self.images)):int(0.8 * len(self.images))]
        self.labels = self.labels[int(0.6 * len(self.labels)):int(0.8 * len(self.labels))]
    else:  # test 20%
        self.images = self.images[int(0.8 * len(self.images)):]
        self.labels = self.labels[int(0.8 * len(self.labels)):]
```

**功能解析：**

1. **参数说明：**
   - `root`: 数据集根目录路径。
   - `resize`: 图像调整后的尺寸。
   - `mode`: 数据集模式，支持`train`、`val`和`test`。

2. **类别标签映射：**
   - 遍历根目录下的所有子文件夹（每个子文件夹代表一个类别），并为每个类别分配一个唯一的标签编号，存储在`self.name2label`字典中。

3. **加载图像和标签：**
   - 调用`self.load_csv('images.csv')`方法加载图像路径和对应的标签。如果`images.csv`不存在，则会自动生成该文件。

4. **数据集划分：**
   - 根据`mode`参数，将数据集划分为训练集（60%）、验证集（20%）和测试集（20%）。

### 加载或生成CSV文件 `load_csv`

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

    # 读取CSV文件
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

**功能解析：**

1. **检查CSV文件是否存在：**
   - 如果`images.csv`不存在，程序会遍历所有类别文件夹，收集所有支持格式的图像文件路径，并将其存储在`images`列表中。

2. **随机打乱数据：**
   - 使用`random.shuffle`对图像列表进行随机打乱，以确保数据分布的随机性。

3. **生成CSV文件：**
   - 将每个图像路径及其对应的标签写入`images.csv`文件，格式为`[image_path, label]`。

4. **读取CSV文件：**
   - 无论是新生成的还是已有的`images.csv`，都会被读取并分别存储图像路径和标签到`self.images`和`self.labels`列表中。

### 获取数据集长度 `__len__`

```python
def __len__(self):
    return len(self.images)
```

返回数据集中样本的总数量，便于`DataLoader`进行批处理。

### 数据反标准化 `denormalize`

```python
def denormalize(self, x_hat):

    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    # x_hat = (x - mean) / std
    # x = x_hat * std + mean
    # x: [c, h, w]
    mean = torch.tensor(mean).unsqueeze(1).unsqueeze(1)
    std = torch.tensor(std).unsqueeze(1).unsqueeze(1)
    x = x_hat * std + mean

    return x
```

**功能解析：**

在图像预处理时，我们通常会对图像进行标准化，使其均值为0，方差为1。此方法用于将标准化后的图像数据恢复到原始的像素值范围，便于可视化展示。

### 获取单个样本 `__getitem__`

```python
def __getitem__(self, idx):
    img, label = self.images[idx], self.labels[idx]

    tf = transforms.Compose([
        lambda x: Image.open(x).convert('RGB'),  # 加载图像并转换为RGB格式
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

**功能解析：**

1. **加载图像：**
   - 使用PIL库打开图像，并确保其为RGB格式。

2. **图像变换：**
   - **Resize:** 将图像调整为指定大小的1.25倍，保持长宽比例。
   - **RandomRotation:** 随机旋转图像，角度范围为±15度，以增强数据的多样性。
   - **CenterCrop:** 从中心裁剪出指定大小的区域。
   - **ToTensor:** 将图像转换为Tensor格式，并将像素值归一化到[0,1]范围。
   - **Normalize:** 使用预定义的均值和标准差对图像进行标准化处理。

3. **返回样本：**
   - 返回处理后的图像Tensor和对应的标签Tensor。

## 主函数与数据可视化

```python
def main():
    import visdom
    import time

    viz = visdom.Visdom()

    # ...

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

1. **初始化Visdom：**
   - Visdom是一个灵活的可视化工具，用于实时监控训练过程中的各类数据。

2. **创建数据集实例：**
   - 创建一个`Pokemon`数据集实例，指定根目录为`'pokemon'`，图像尺寸为64，模式为`'train'`。

3. **展示单个样本：**
   - 使用`next(iter(db))`获取数据集中的第一个样本，并打印其形状和标签。
   - 使用`viz.image`将反标准化后的图像显示在Visdom窗口中。

4. **创建DataLoader：**
   - 使用`DataLoader`将数据集加载为批次，设置批量大小为32，启用数据洗牌，并使用8个工作线程加速数据加载。

5. **批量数据可视化：**
   - 遍历数据加载器中的每个批次，将反标准化后的图像批量展示在Visdom窗口中。
   - 同时，将对应的标签以文本形式展示。
   - 每展示一个批次后，暂停10秒，以便观察。

## 运行代码

全部代码如下：
```python
import torch
import os, glob
import random, csv

from torch.utils.data import Dataset, DataLoader

from torchvision import transforms
from PIL import Image


class Pokemon(Dataset):

    def __init__(self, root, resize, mode):
        super(Pokemon, self).__init__()

        self.root = root
        self.resize = resize

        self.name2label = {}  # "sq...":0
        for name in sorted(os.listdir(os.path.join(root))):
            if not os.path.isdir(os.path.join(root, name)):
                continue

            self.name2label[name] = len(self.name2label.keys())

        # print(self.name2label)

        # image, label
        self.images, self.labels = self.load_csv('images.csv')

        if mode == 'train':  # 60%
            self.images = self.images[:int(0.6 * len(self.images))]
            self.labels = self.labels[:int(0.6 * len(self.labels))]
        elif mode == 'val':  # 20% = 60%->80%
            self.images = self.images[int(0.6 * len(self.images)):int(0.8 * len(self.images))]
            self.labels = self.labels[int(0.6 * len(self.labels)):int(0.8 * len(self.labels))]
        else:  # 20% = 80%->100%
            self.images = self.images[int(0.8 * len(self.images)):]
            self.labels = self.labels[int(0.8 * len(self.labels)):]

    def load_csv(self, filename):

        if not os.path.exists(os.path.join(self.root, filename)):
            images = []
            for name in self.name2label.keys():
                # 'pokemon\\mewtwo\\00001.png
                images += glob.glob(os.path.join(self.root, name, '*.png'))
                images += glob.glob(os.path.join(self.root, name, '*.jpg'))
                images += glob.glob(os.path.join(self.root, name, '*.jpeg'))

            # 1167, 'pokemon\\bulbasaur\\00000000.png'
            print(len(images), images)

            random.shuffle(images)
            with open(os.path.join(self.root, filename), mode='w', newline='') as f:
                writer = csv.writer(f)
                for img in images:  # 'pokemon\\bulbasaur\\00000000.png'
                    name = img.split(os.sep)[-2]
                    label = self.name2label[name]
                    # 'pokemon\\bulbasaur\\00000000.png', 0
                    writer.writerow([img, label])
                print('writen into csv file:', filename)

        # read from csv file
        images, labels = [], []
        with open(os.path.join(self.root, filename)) as f:
            reader = csv.reader(f)
            for row in reader:
                # 'pokemon\\bulbasaur\\00000000.png', 0
                img, label = row
                label = int(label)

                images.append(img)
                labels.append(label)

        assert len(images) == len(labels)

        return images, labels

    def __len__(self):

        return len(self.images)

    def denormalize(self, x_hat):

        mean = [0.485, 0.456, 0.406]
        std = [0.229, 0.224, 0.225]

        # x_hat = (x-mean)/std
        # x = x_hat*std = mean
        # x: [c, h, w]
        # mean: [3] => [3, 1, 1]
        mean = torch.tensor(mean).unsqueeze(1).unsqueeze(1)
        std = torch.tensor(std).unsqueeze(1).unsqueeze(1)
        # print(mean.shape, std.shape)
        x = x_hat * std + mean

        return x

    def __getitem__(self, idx):
        # idx~[0~len(images)]
        # self.images, self.labels
        # img: 'pokemon\\bulbasaur\\00000000.png'
        # label: 0
        img, label = self.images[idx], self.labels[idx]

        tf = transforms.Compose([
            lambda x: Image.open(x).convert('RGB'),  # string path= > image data
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


def main():
    import visdom
    import time

    viz = visdom.Visdom()

    # tf = transforms.Compose([
    #                 transforms.Resize((64,64)),
    #                 transforms.ToTensor(),
    # ])
    # db = torchvision.datasets.ImageFolder(root='pokemon', transform=tf)
    # loader = DataLoader(db, batch_size=32, shuffle=True)
    #
    # print(db.class_to_idx)
    #
    # for x,y in loader:
    #     viz.images(x, nrow=8, win='batch', opts=dict(title='batch'))
    #     viz.text(str(y.numpy()), win='label', opts=dict(title='batch-y'))
    #
    #     time.sleep(10)

    db = Pokemon('pokemon', 64, 'train')

    x, y = next(iter(db))
    print('sample:', x.shape, y.shape, y)

    viz.image(db.denormalize(x), win='sample_x', opts=dict(title='sample_x'))

    loader = DataLoader(db, batch_size=32, shuffle=True, num_workers=8)

    for x, y in loader:
        viz.images(db.denormalize(x), nrow=8, win='batch', opts=dict(title='batch'))
        viz.text(str(y.numpy()), win='label', opts=dict(title='batch-y'))

        time.sleep(10)


if __name__ == '__main__':
    main()
```

确保已经安装了所需的库，如PyTorch、Torchvision、PIL和Visdom。然后，在终端中启动Visdom服务器：

```bash
python -m visdom.server
```

接着，运行上述脚本：

```bash
python pokemon.py
```

打开浏览器，访问`http://localhost:8097`，即可看到可视化的图像和标签。

<img src='\images\posts\pokemon.png'
  style="
    display: block;
    margin-left: auto;
    margin-right: auto; 
    zoom:100%;" />