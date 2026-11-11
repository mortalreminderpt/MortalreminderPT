---
title: 样式指南
description: ''
---

{% include toc.html %}

* g
{:toc}

一个段落看起来是这样的——dolor amet cray stumptown fingerstache neutra food truck seitan poke cardigan waistcoat VHS snackwave celiac hella。Godard seitan shoreditch flexitarian next level trust fund man braid vegan listicle keytar bitters。Disrupt cray fashion axe unicorn lomo shaman poke glossier keffiyeh snackwave austin tattooed seitan hexagon lo-fi。Lumbersexual irony vaporware，butcher shaman。

***

## 默认标题：

# H1 示例
## H2 示例
### H3 示例
#### H4 示例
##### H5 示例
###### H6 示例

{% highlight markdown %}
## 一级标题
### 二级标题
#### 三级标题
{% endhighlight %}

***

## 列表

#### 有序列表示例：

1. Poutine drinking vinegar bitters。
2. Coloring book distillery fanny pack。
3. Venmo biodiesel gentrify enamel pin meditation。
4. Jean shorts shaman listicle pickled portland。
5. Salvia mumblecore brunch iPhone migas。

{% highlight markdown %}
1. 有序列表项 1
2. 有序列表项 1
{% endhighlight %}

***

#### 无序列表示例：

* Bitters semiotics vice thundercats synth。
* Literally cred narwhal bitters wayfarers。
* Kale chips chartreuse paleo tbh street art marfa。
* Mlkshk polaroid sriracha brooklyn。
* Pug you probably haven't heard of them air plant man bun。

{% highlight markdown %}
* 无序列表项 1
* 无序列表项 2
{% endhighlight %}

***

### 表格

<div class="table-container">
  <table>
    <tr><th>表头 1</th><th>表头 2</th><th>表头 3</th><th>表头 4</th><th>表头 5</th></tr>
    <tr><td>行:1 单元格:1</td><td>行:1 单元格:2</td><td>行:1 单元格:3</td><td>行:1 单元格:4</td><td>行:1 单元格:5</td></tr>
    <tr><td>行:2 单元格:1</td><td>行:2 单元格:2</td><td>行:2 单元格:3</td><td>行:2 单元格:4</td><td>行:2 单元格:5</td></tr>
    <tr><td>行:3 单元格:1</td><td>行:3 单元格:2</td><td>行:3 单元格:3</td><td>行:3 单元格:4</td><td>行:3 单元格:5</td></tr>
    <tr><td>行:4 单元格:1</td><td>行:4 单元格:2</td><td>行:4 单元格:3</td><td>行:4 单元格:4</td><td>行:4 单元格:5</td></tr>
    <tr><td>行:5 单元格:1</td><td>行:5 单元格:2</td><td>行:5 单元格:3</td><td>行:5 单元格:4</td><td>行:5 单元格:5</td></tr>
    <tr><td>行:6 单元格:1</td><td>行:6 单元格:2</td><td>行:6 单元格:3</td><td>行:6 单元格:4</td><td>行:6 单元格:5</td></tr>
  </table>
</div>

***

## 引用

#### 引用看起来是这样的：

> 我活得越久，就越意识到我在任何事情上从来都不会错，而我如此谦卑地花费在验证自己想法上的所有痛苦，只是浪费了我的时间！
>
> <cite>George Bernard Shaw</cite>

{% highlight html %}
> 我活得越久，就越意识到我在任何事情上从来都不会错，而我如此谦卑地花费在验证自己想法上的所有痛苦，只是浪费了我的时间！
>
> <cite>George Bernard Shaw</cite>
{% endhighlight %}

***

## 语法高亮

{% highlight js %}
  $('.top').click(function () {
    $('html, body').stop().animate({ scrollTop: 0 }, 'slow', 'swing');
  });
  $(window).scroll(function () {
    if ($(this).scrollTop() > $(window).height()) {
      $('.top').addClass("top-active");
    } else {
      $('.top').removeClass("top-active");
    };
  });
{% endhighlight %}

***

## 图片

  <div class="gallery-box">
    <div class="gallery">
      <img src="/images/501.jpg">
      <img src="/images/901.jpg">
      <img src="/images/509.jpg">
      <img src="/images/511.jpg">
      <img src="/images/520.jpg">
      <img src="/images/516.jpg">
      <img src="/images/517.jpg">
      <img src="/images/519.jpg">
      <img src="/images/521.jpg">
    </div>
    <em>图库 / <a href="https://unsplash.com/" target="_blank">Unsplash</a></em>
  </div>

{% highlight markdown %}
  <div class="gallery-box">
    <div class="gallery">
      <img src="/images/501.jpg">
      <img src="/images/901.jpg">
      <img src="/images/509.jpg">
      <img src="/images/511.jpg">
      <img src="/images/520.jpg">
      <img src="/images/516.jpg">
      <img src="/images/517.jpg">
      <img src="/images/519.jpg">
      <img src="/images/521.jpg">
    </div>
    <em>图库 / <a href="https://unsplash.com/" target="_blank">Unsplash</a></em>
  </div>
{% endhighlight %}

![]({{site.baseurl}}/images/140.jpg)
*极简主义*

{% highlight markdown %}
  ![]({{site.baseurl}}/images/140.jpg)
  *极简主义*
{% endhighlight %}

***

## YouTube 嵌入

<div class="video">
    <iframe src="https://www.youtube.com/embed/fP2w_UAK6B4" frameborder="0" allowfullscreen></iframe>
    <em>传送门场景 / <a href="https://www.youtube.com/watchv?=fP2w_UAK6B4&t=164s&ab_channel=MediaClips">YouTube</a></em>
</div>

{% highlight html %}
  <iframe src="https://www.youtube.com/embed/Hd1_EXhr_fg" frameborder="0" allowfullscreen></iframe>
{% endhighlight %}

## Vimeo 嵌入

<p><iframe src="https://player.vimeo.com/video/107654760" width="640" height="360" frameborder="0" allowfullscreen></iframe></p>

{% highlight html %}
  <iframe src="https://player.vimeo.com/video/107654760" width="640" height="360" frameborder="0" allowfullscreen></iframe>
{% endhighlight %}

***
