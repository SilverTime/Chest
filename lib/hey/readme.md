#系统弹出提出框组件 hey.js说明文档
张功 2015年5月18日

---

## 功能
* 蓝色信息、红色错误、黄色错误提示框

## 依赖
avalon.js 1.5+

## 使用方式

1. 引入依赖以及hey.js
2. 再插入点插入
```javascript
<tsy:hey config="$opthey"></tsy:hey> ```
3. 编写配置参数，

```
//三个函数可供调用hey.success(成功),hey.error（错误）,hey.fail（失败）
 hey.success("提示标题（如"成功"）","提示内容")

```

## 实例

```
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>弹出框组件实例</title>
    <script src="../../src/js/avalon.modern.1.5.min.js"></script>
</head>
<body ms-controller="heyDemo">

<tsy:hey config="$opthey"></tsy:hey>
<button ms-click="openhey0()">成功</button>
<button ms-click="openhey1()">错误</button>
<button ms-click="openhey2()">失败</button>
<script>
    avalon.ready(function () {
        require(['../../lib/hey/hey'], function () {
            var vm=avalon.define({
                $id:'heyDemo',
                ready: function () {
                    avalon.scan()
                },
                $opthey:{
                    id:'hey',
//                    width:"",
//                    height:"",
//                    x:"360",
                },
                openhey0: function () {
                        hey.success("成功","主要提示内容是这样的suc")
                },
                openhey1: function () {
                        hey.error("错误","主要提示内容是这样的err")
                },
                openhey2: function () {
                        hey.fail("失败","主要提示内容是这样的fail")
                }
            })

            window[vm.$id]=vm
            vm.ready()
        })
    })
</script>
</body>
</html>
```


## 配置参数

参数名|说明|类型|必要性
----|
id|弹出框作用域的id|number|必要
width|弹出框宽度|number|可选
height|弹出框高度|number|可选
x|弹出框水平位置|number|可选
success|蓝色消息弹出框|function|必要
error|红色消息弹出框|function|必要
fail|橙色消息弹出框|function|必要

* 注意页面中对必要的依赖项的路径配置和引入
