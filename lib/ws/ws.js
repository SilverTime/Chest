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
    var vm
    avalon.component("tsy:ws", {
        id: "ws",

        $ready: function (vm) {
            ///初始化配置
            vm.start()

            //setInterval(function () {
            //    if (vm.state == 1) {

            //        window.webSocketLinks[vm.id].send("\r\n")
            //    }
            //}, vm.heartTime)

            window[vm.id] = vm

        },
        $template: "",
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
            //window.setInterval(function () {
            //    cache.go({
            //        SIDTime:Math.round(new Date().getTime()/1000)
            //    })
            //},5000)
        },
        onerror: function () {//连接失败的额外回调

        },
        onclose: function () {//连接被关闭的额外回调
            //cache.go({
            //    SIDTime:Math.round(new Date().getTime()/1000)
            //})
        },
        onmessage: function () {//消息接受是的额外回调
            //cache.go({
            //    SIDTime:Math.round(new Date().getTime()/1000)
            //})
        },
        /*创建连接*/
        timeout: "",
        start: function () {

        },

        /*发送数据*/
        $tF: {},//缓存的回调方法
        $tft: {},//处理桥返回超时的计时器
        mF: {},//准备执行的回调方法
        $mFt:{},//处理服务端返回超时的计时器
        timeoutTip:"请求超时，请检查您的网络环境。",//超时的提示文字
        op: "",//上一次的传入的参数(下面这个方法)
        clearOp: '',//清空OP的延迟函数
        callTimeOut: 14000,//请求超时的时间设置
        call: function (op) {

        },


        /*监听消息*/
        todo: {},
        listen: function (evt) {
            //收到服务器消息，使用evt.data提取

        },

        /*注册监听*/
        addListen: function (name, fn) {

        },
        /*断线重连*/
        reStart: function () {

        },

        $init: function (vm) {
            //vm = this
            vm.start=function () {
                if (vm.server != '') {
                    try {
                        tip.on("正在建立连接……", 1, 30000)
                    } catch (err) {
                    }
                    var link;
                    var server = vm.server

                    if ('WebSocket' in window) {
                        link = new WebSocket(server);
                    } else if ('MozWebSocket' in window) {
                        link = new MozWebSocket(server);
                    } else {
                        try {
                            tip.off("正在建立连接……", 1, 30000)
                        } catch (err) {
                        }
                        alert('我们的浏览器不支持您所使用的浏览器，请使用正确的google chrome浏览器。');
                        return
                    }

                    //超时重连
                    clearTimeout(vm.timeout)
                    vm.timeout = setTimeout(function () {
                        if (link.readyState == 0) {
                            console.log("连接超时，正在准备重新连接……")
                            tip.off("正在建立连接……", 1, 30000)
                            link.close()
                            vm.start()
                        }
                    }, 10000)


                    /*添加对基本事件的监听*/
                    link.onerror = function (evt) {
                        try {
                            tip.off("正在建立连接……", 1, 30000)
                            tip.off("连接失败，正在尝试重新连接", 0)
                            tip.on("连接失败，正在尝试重新连接", 0)
                        } catch (err) {
                        }
                        //产生异常
                        vm.onerror(evt)
                        vm.state = 2;
                        console.log("websocket连接错误：" + server, 1, 3000)
//                        setTimeout(function(){
//                            vm.reStart()
//                        },vm.reStartTime)
                    };

                    link.onopen = function (evt) {
                        try {
                            tip.off("正在建立连接……", 1, 30000)
                            tip.on("成功连接！", 1, 1000)
                            tip.off("连接失败，正在尝试重新连接", 0)
                        } catch (err) {
                        }
                        //已经建立连接
                        vm.onopen(evt)
                        console.log("websocket连接成功：" + server, 1, 3000);
                        console.log("连接成功：" + evt)
                        vm.state = 1;


                        //发送阻塞列表
                        setTimeout(function () {
                            for (var i = 0; i < vm.sendList.length; i++) {
                                window.webSocketLinks[vm.id].send(vm.sendList[i])
                            }
                            //清空阻塞列表
                            vm.sendList = []
                        }, 20)



                    };

                    link.onclose = function (evt) {
                        try {
                            tip.off("正在建立连接……", 1, 30000)
                            tip.on("连接关闭", 1, 1000)
                        } catch (err) {
                        }
                        //已经关闭连接
                        vm.onclose(evt)
                        console.log("websocket连接已关闭：" + server, 1, 3000);
                        console.log("连接关闭：" + evt)
                        vm.state = 2;

                        //重置大小门
                        doorC.reset()
                        door.reset()

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
                    window.webSocketLinks[vm.id] = link
                }
            }

            vm.listen=function (evt) {
                //收到服务器消息，使用evt.data提取
                var res = JSON.parse(evt.data)

                if (vm.debug) {
                    console.log(res)
                }

                var mmid = "m" + res.m
                //判断回调
                if (res.c == "t") {
                    //这次是桥派来送mid的
                    //绑定mid的回调函数
                    try {
                        //拆除桥定时炸弹
                        clearTimeout(vm.$tft[res.t])
                        vm.$tft[res.t] = undefined

                        vm.mF[mmid] = vm.$tF[res.t]

                        //安放服务端定时炸弹
                        vm.$mFt[mmid] = setTimeout(function () {
                            console.log('【服务器返回超时】mmid:'+mmid)
                            vm.mF[mmid]({err:vm.timeoutTip},vm.timeoutTip)
                            vm.mF[mmid] = undefined

                            try {
                                pb.endT()
                            } catch (err) {}

                        }, vm.callTimeOut)



                    }
                    catch (err) {
                        console.log(err)
                    }

                    return

                }

                //服务端返回
                if (res.c == "m") {
                    //拆除服务器定时炸弹
                    clearTimeout(vm.$mFt[mmid])
                    vm.$mFt[mmid] = undefined

                    try {
                        pb.endT()
                    } catch (err) {}
                    //这次是服务器派来送数据的
                    var data = res.d
                    var err=''
                    //传入错误信息
                    if (res.err||data==null) {
                        //传入错误信息
                        err=res.err

                        console.log("【接口调用错误】" + res.i + ":" + res.err)
                        data={}
                        if(err==''||err==null){
                            err=data.err="未知错误"
                        }else{
                            data.err=err
                        }

                    }

                    //处理回掉
                    if (typeof vm.mF[mmid] == "function") {

                        vm.mF[mmid](data,err)
//                        console.log(res.d)
                        //一分钟之后清除回调函数,腾出内存空间
                        setTimeout(function () {
                            vm.mF[mmid] = null
                        }, 60000)
                    }
                    else {
                        console.log("mid丢失:" + res)
                    }
                    return
                }

                //服务端推送
                if (res.c == "p") {
                    //这次是服务器直接推送的
                    if (typeof vm.todo[res.i] == "function") {
                        vm.todo[res.i](res.d)
                    }
                    else {
                        console.log('没有充分的准备来应对服务器的未知指令')
                    }
                    return
                }

                //session 缓存
                //if(res.c=='s'){
                //    now = Math.round(new Date().getTime()/1000)
                //    SIDTime = cache.go('SIDTime')
                //    if((now-Number(SIDTime))>1200){
                //        cache.go({
                //            SID:res.SID,
                //            SIDTime:now
                //        })
                //    }else{
                //        cache.go({
                //            SIDTime:now
                //        })
                //    }
                //    return
                //}

                //还不知道这家伙是用来干嘛的
                return console.log("未知的c:" + res.c)


            }

            vm.call=function (op) {

                /*传入opt标准格式：
                 * {
                 i:"",//指令,必须有
                 data:"",//数据，看情况
                 success：function(data){}
                 //回调函数，一般都有，用于执行，本次请求处理完成之后回调的方法，会在这个函数中传入data，也就是服务器返回过来的数据

                 }

                 * */

                //验证重复性
                var newOp = JSON.stringify(op) + "op"

                if (newOp != vm.op) {
                    //通过
                    try {
                        pb.startT()
                    } catch (err) {}
                    //执行
                    var opt = {}
                    for (var x in op) {
                        opt[x] = op[x]
                    }
                    //var opt=opt||{}

                    if (typeof opt == "object" && opt != {}) {
                        //抓取数据区
                        var d = opt.data;

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
//缓存回调函数
                        if (typeof opt.success == "function") {
                            vm.$tF[t] = opt.success

                        }
                        else {
                            console.log('没有正确传入回调函数')
                            return
                        }
                        //连接状态检测
                        if (vm.state == 1) {

                            //发送
                            window.webSocketLinks[vm.id].send(str)

                            //安放桥定时炸弹
                            vm.$tft[t] = setTimeout(function () {
                                console.log('【桥返回超时】t:'+t)
                                vm.$tF[t]({err:vm.timeoutTip},vm.timeoutTip)
                                vm.$tF[t] = undefined
                            }, vm.callTimeOut)
                        }
                        else {
                            vm.sendList.push(str)
                        }


                        //回收opt
                        opt = {}
                        console.log("done!!")
                    }


                    //缓存本次请求的OP，并设置过期时间
                    clearTimeout(vm.clearOp)
                    vm.op = newOp

                    vm.clearOp = setTimeout(function () {
                        vm.op = ""
                    }, 40)
                    //console.log("op!!!---->"+vm.op)
                }

                else {
                    //执行过滤
                }


            }

            vm.addListen=function (name, fn) {
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
            }

            vm.reStart=function () {
                //重新打开门店
                //调用门禁
                door.comeIn({
                    haveLogin: function () {
                        doorC.comeIn(function () {
                            //发送阻塞列表
                            setTimeout(function () {
                                for (var i = 0; i < vm.sendList.length; i++) {
                                    window.webSocketLinks[vm.id].send(vm.sendList[i])
                                }
                                //清空阻塞列表
                                vm.sendList = []
                            }, 20)
                        }, notInCom)
                    },
                    notLogin: function () {
                        logouted()
                    }
                });
                vm.start()
                console.log("正在尝试重新连接")
            }
        },


    })

})