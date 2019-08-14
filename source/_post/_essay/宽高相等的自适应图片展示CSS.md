banner:banner.png
title:宽高相等的自适应图片展示页面CSS
date:2018/05/05
tags:BLOG搭建的记录
---;
要做个画廊页面
## column-count
一开始在瀑布流、网格流之间摇摆不定。看了几个主流的设计类、CG类网站，突然找到TJ大神的摄影站 [tjholowaychuk](http://tjholowaychuk.com) ,就决定是瀑布流了。看了下网站的CSS，发现是用`column-count`来布局。一边写一边查看 [column-count | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/column-count)。缺点是如果图片质量不高，并且量大的时候，排版反倒混乱。
![](140327.png)
## width:calc(100% / 5)
[Artstation](https://www.artstation.com)CG站的网格流中规中矩，适合我po的图(涂鸦...)。预览图从`img`标签改为`background-image:url()`，每个方格用`width:calc( 100% / grid-num )`平分。出现问题：格子的宽高无法相等。又看了下A站的CSS，是用伪元素`::before`的`margin-top:100%`来撑开。至此问题解决。
```
.gallery-link{
    width: calc(100% / 5);
    display:inline-block;
    position: relative;
    animation: gallery-overlay 0.4s;
    overflow: hidden;
    background-position: center;
    background-clip: content-box;
    background-repeat: no-repeat;
    background-size: cover;
}
.gallery-link::before{
    content: '';
    display: block;
    margin-top: 100%;
}
```
## marginleft:calc() 居中
由于我想要页面满屏显示，但我用ajax来获取二级页面，不可避免的css会被顶层样式影响，例
```
    <div id="main">
        <div id="gallery">
            <!--ajax-->
        </div>
    </div>
```

```
html{
    font-size:100px;
    display:flex;
    justify-content: center;
}
#main{
    width:10.92rem;
}
```
在一级宽度小于二级这种情况下，`#gallery`设置`position:absolute; width:100vw`后因为`#main`影响产生左边距,利用`calc`可以很方便的去除使div居中。
![](calc.jpg)
```
    #gallery{
        width:100vw;
        margin-left: calc((10.92rem - 100vw) / 2); 
    }
```
