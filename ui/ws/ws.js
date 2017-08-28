/**
 * Created by mooshroom on 2015-07-30.
 * webScoket通信组件
 * 版本：V2.0.1
 *
 *
 *
 */
define([
    "avalon",
    'text!../../ui/ws/ws.html',
    'css!../../ui/ws/ws.css'
], function (avalon, html, css) {
    var widget = avalon.ui.ws = function (element, data, vmodels) {
        var options = data.wsOptions
        var objId = data.wsId
        var vm = avalon.define({
            $id: objId,
            $init: function () {
                ///初始化配置
                //扫描
                avalon.scan(element, [vm].concat(vmodels))
                if (typeof vm.onInit === "function") {
                    vm.onInit.call(element, vm, options, vmodels)
                }

                vm.start()

                setInterval(function () {
                    if (vm.state != 1) {
                        window.webSocketLinks[objId].send("\r\n")
                    }
                }, vm.heartTime)


            },
            $remove: function () {
//                element.innerHTML = ""

            },
            onInit: function () {

            },

            /*具体实现*/
            state: 0,//连接状态：0-尚未连接；1-连接正常；2-已经断线
            link: {},//连接实体

            server: '',//服务器地址格式；'ws://121.41.115.217:9999'
            debug: false,
            reStartTime: 3000,//断线重连时间
            heartTime: 50000,//心跳间隔时间

            sendList: [],//被阻塞的请求列表，将在连接成功之后发送
            onopen: function () {//成功连接之后的额外回调

            },
            onerror: function () {//连接失败的额外回调

            },
            onclose: function () {//连接被关闭的额外回调

            },
            onmessage: function () {//消息接受是的额外回调

            },
            /*创建连接*/
            start: function () {
                if (vm.server != '') {
                    var link;
                    var server = vm.server

                    if ('WebSocket' in window) {
                        link = new WebSocket(server);
                    } else if ('MozWebSocket' in window) {
                        link = new MozWebSocket(server);
                    } else {
                        alert('我们的浏览器不支持您所使用的浏览器，请使用正确的google chrome浏览器。');
                        return
                    }


                    /*添加对基本事件的监听*/
                    link.onerror = function (evt) {
                        //产生异常
                        vm.onerror(evt)
                        vm.state = 2;
                        console.log("websocket连接错误：" + server, 1, 3000)
//                        setTimeout(function(){
//                            vm.reStart()
//                        },vm.reStartTime)
                    };

                    link.onopen = function (evt) {
                        //已经建立连接
                        vm.onopen(evt)
                        console.log("websocket连接成功：" + server, 1, 3000);
                        console.log("连接成功：" + evt)
                        vm.state = 1;
                        //发送阻塞列表
                        for (var i = 0; i < vm.sendList.length; i++) {
                            window.webSocketLinks[objId].send(vm.sendList[i])
                        }
                        //清空阻塞列表
                        vm.sendList = []

                    };

                    link.onclose = function (evt) {
                        //已经关闭连接
                        vm.onclose(evt)
                        console.log("websocket连接已关闭：" + server, 1, 3000);
                        console.log("连接关闭：" + evt)
                        vm.state = 2;

                        setTimeout(function () {
                            vm.reStart()
                        }, vm.reStartTime)
                    };

                    link.onmessage = function (evt) {
                        //当接受消息 的时候
                        vm.onmessage(evt)
                        vm.listen(evt)
                    };
                    window.webSocketLinks = {}
                    window.webSocketLinks[objId] = link
                }
            },

            /*发送数据*/
            $tF: {},//缓存的回调方法
            mF: {},//准备执行的回调方法
            op: "",//上一次的传入的参数(下面这个方法)
            call: function (op) {

                /*传入opt标准格式：
                 * {
                 i:"",//指令,必须有
                 data:"",//数据，看情况
                 success：function(data){}
                 //回调函数，一般都有，用于执行，本次请求处理完成之后回调的方法，会在这个函数中传入data，也就是服务器返回过来的数据

                 }

                 * */

                //验证重复性
                var newOp = JSON.stringify(op)+"op"

                if (newOp != vm.op) {
                    //通过

                    //执行
                    var opt = {}
                    for (var x in op) {
                        opt[x] = op[x]
                    }
                    //var opt=opt||{}

                    if (typeof opt == "object" && opt != {}) {
                        //抓取数据区
                        var d = JSON.stringify(opt.data);

                        //抓取指令i
                        var i = opt.i;

                        //生成ticket
                        function guid() {
                            var now = new Date().getTime()

                            function S4() {
                                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                            }

                            return ("t" + (S4() + S4() + now));
                        }

                        var t = guid()

                        //合成发送字符串
                        var obj = {i: i, t: t, d: d}
                        var str = JSON.stringify(obj)

//                    console.log(str)

                        //连接状态检测
                        if (vm.state == 1) {

                            //发送
                            window.webSocketLinks[objId].send(str)
                        }
                        else {
                            vm.sendList.push(str)
                        }

                        //缓存回调函数
                        if (typeof opt.success == "function") {

                            vm.$tF[t] = opt.success
                        }
                        else {
                            console.log('没有正确传入回调函数')
                        }
                        //回收opt
                        opt={}
                        console.log("done!!")
                    }



                    //缓存本次请求的OP，并设置过期时间
                    vm.op = newOp

                    setTimeout(function () {
                        vm.op = ""
                    }, 1000)
                    //console.log("op!!!---->"+vm.op)
                }

                else {
                    //执行过滤
                }


            },


            /*监听消息*/
            todo: {},
            listen: function (evt) {
                //收到服务器消息，使用evt.data提取
                var res = JSON.parse(evt.data)

                var mmid = "m" + res.mid
                //判断回调
                if (res.c == "t") {
                    //这次是桥派来送mid的
                    //绑定mid的回调函数
                    try {
                        vm.mF[mmid] = vm.$tF[res.t]
                        vm.$tF[res.t] = null
                    }
                    catch (err) {
                        console.log(err)
                    }

                }
                else if (res.c == "m") {
                    //这次是服务器派来送数据的
                    if (typeof vm.mF[mmid] == "function") {
                        //执行回调
                        var data = JSON.parse(res.d)
                        if (data.err && data.code == 1) {
                            //TODO 错误提示
                            //tip.on(data.err);
                            console.log("【接口调用错误】"+res.i+":"+data.err)
                        }
                        vm.mF[mmid](data)
//                        console.log(res.d)
                        //一分钟之后清除回调函数,腾出内存空间
                        setTimeout(function () {
                            vm.mF[mmid] = null
                        }, 60000)
                    }
                    else {
                        console.log("mid丢失:" + res)
                    }
                }
                else if (res.c == "p") {

                    //这次是服务器直接推送的

                    //转换接口编号格式
                    var i=res.i.replace("/","_")

                    if (typeof vm.todo[i] == "function") {
                        vm.todo[i](res.d)
                    }
                    else {
                        console.log('没有充分的准备来应对服务器的未知指令')
                    }

                }
                else {
                    //还不知道这家伙是用来干嘛的
                    console.log("未知的c:" + res.c)
                }

                if (vm.debug) {
                    console.log(res)
                }


            },

            /*注册监听*/
            addListen: function (name, fn) {
                if (typeof name == "string") {
                    if (typeof fn == "function") {
                        try {
                            vm.todo[name] = fn
                            console.log("监听" + name + "事件的方法已就绪")
                        } catch (e) {
                            console.log(e)
                        }

                    }
                    else {
                        console.log("传入的方法必须为函数:" + fn)
                    }
                }
                else {
                    console.log("传入的名称必须为字符串:" + name)
                }
            },
            /*断线重连*/
            reStart: function () {
                vm.start()
                console.log("正在尝试重新连接")
            }


        })
        //传入配置，传入方法就是把option里面的属性和刚才创建的VM里面的属性搅拌起来
        avalon.mix(vm, options)

        //最后把创建好的VM赋值给当前域下面的以VM的ID为名称的对象里面去，我们就能在当前域调用了
        return this[objId] = vm
    }
    //这是给默认配置的地方，在这里暂时还用不上
    widget.defaults = {}

    //传说一定要这样,不过我注释了也没有什么异常
    return avalon
})