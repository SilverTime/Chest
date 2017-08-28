# 弹出框组件
mooshroom  2015-6-21

email：<mooshroom@tansuyun.cn>

---
## 功能
1. 在点击触发按钮的位置开始弹出
1. 可以任意扩展，这里只是提供了弹出框的弹出关闭的动作，其样式根据所需自定义
1. 规范化了在一个网站上不同的弹出框公用一套弹出动作的实现方法

## 用法
在需要使用的地方编写DOM结构并且引入组件的JS文件，就搞定了，暂时还没有设计多余的配置，所以这里就不用传配置了。

关键部分的代码如下：
```html
<!--关键代码-->
<div ms-widget="modal,modal1,$opt"></div>

<script>

    //引入组件，引入了就搞定了~
    require(["../../ui/modal/modal.js"],function(){
        avalon.scan()
    })

</script>
```
这样就创建了一个弹出框组件了，弹出框组件的调用方法如下：
```javascript
// 开启弹出框
modal1.getIn();

// 关闭弹出框
modal1.getOut();
```
---

demo的代码如下：
```html
<div ms-controller="modal_demo">
    <button class="btn btn-primary pull-right" ms-click="show">点击弹出</button>
    <div ms-widget="modal,modal1,$opt">
        <div style="width: 600px">
            akldjfklasj flkasj fklsj dl;fkj asklfj alskj fl;ksjd fkl asj flk ajs ;f
        </div>
    </div>
</div>
<script>
    require(['../../ui/modal/modal.js'],function(){
        var modal_demo=avalon.define({
            $id:"modal_demo",
            $opt:{

            },
            show:function(){
                modal1.getIn()
            }
        })
        avalon.scan()
    })
</script>
```
食用愉快~