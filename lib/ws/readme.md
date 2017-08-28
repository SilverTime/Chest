# WebSocket通信组件
mooshroom  2015-7-30

email：<mooshroom@tansuyun.cn>

---
这是一个碳素云专用的组件，并没有做广泛的使用考虑，当然，可以随意修改，虽然还不如自己写了。
## 功能
1. 与服务器建立WebSocket通道
1. 绑定指令的的处理函数
1. 监听解析返回的json
1. 处理请求为ajax风格的json，并提交给服务器
1. 断线重连

## 用法

### 简单的示例：
```html
<div ms-controller="wsDemo">
    组件示范：
    <div ms-widget="ws,ws,$opt"></div>
    <label for="">
        服务器地址：
        <input type="text" ms-duplex="$opt.server"/>
    </label>
    <label for="">
        要发送的内容：
        <input type="text" ms-duplex="message"/>
    </label>
    <br/>
    <a ms-click="start" class="btn btn-success">连接</a>
    <a ms-click="send" class="btn btn-primary">发送</a>
    <br/>
    接收到的内容：<br/>
    {{back}}
</div>
<script>
    require(['../../ui/ws/ws.js'],function(){
        var wsDemo=avalon.define({
            $id:"wsDemo",
            $opt:{
                server:"ws://10.10.13.188:46030",
                onopen:function(){
                    alert('连接创建成功')
                },
            },
            message:"",
            start: function () {
              ws.start()
            },
            back:"",
            send:function(){
                ws.call({
                    i:'Goods/search',
                    data:{
                        keyword:wsDemo.message
                    },
                    success:function(d){
                        wsDemo.back=d
                    }
                })
            }
        })
        avalon.scan()
    })
</script>
```
创建组件的方法不用说了，和avalon其他组件的一样。

### 配置项：

名称|作用|格式|必须
----|----|----
server|服务器地址|'ws://121.41.115.217:9999'|true
reStartTime|断线重连时间，默认为3000毫秒|整数|
heartTime|心跳间隔时间，默认为50000毫秒|整数|
onopen|连接创建成功时的额外回调函数|函数|
onerror|连接创建出错时的额外回调函数|函数|
onclose|连接关闭时的额外回调函数|函数|
onmessage|消息接收时的额外回调函数|函数|

### 可调用的方法：
**start()**触发创建连接。

**call(opt)**发送消息，传入一个对象，对象格式如下：

```javascript
{
  i:"",//指令,必须有
  data:"",//数据，看情况
  success：function(data){}
/*回调函数，一般都有，
用于执行，本次请求处理完成之后回调的方法，
会在这个函数中传入data，也就是服务器返回过来的数据
*/
}
```

**addListen(name,fn)**创建指令监听函数，传入name与fn，name为字母开头的字符串，fn为函数。


## 注意事项
以上