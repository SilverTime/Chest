/**
 * Created by Chris Chang on 2016/4/27.
 */
define('whatInput', [
    'avalon',
    'text!../../lib/whatInput/whatInput.html',
    'css!../../lib/whatInput/whatInput.css',
    'css!../../src/css/font-awesome.min.css'
], function (avalon, html, css) {

    avalon.component("tsy:input", {
        id: "itip",
        $init: function (vm, elem) {
            //获取将要构建为组件的元素
            //vmodel = this

            elem = avalon(elem);
            //抓取<tsy:whatinput ms-data-id="whatinput">元素内的配置ms-data-id的值
            try {
                if (elem.data('id') != undefined) {
                    vm.id = elem.data('id')
                }
            } catch (err) {
            }


            //加载组件的方法（所有需要调用VM内部属性的方法，都要在VM上先设置方法例如第56行，然后再这里来加载具体的函数逻辑）

            /*
             * 1、开启——延时关闭
             * 2、用户点击——消除延时
             *   判断开关状态，并置反
             * 3、鼠标悬浮在提示框上——消除延时，不关闭
             *    鼠标离开，加延时、关闭*/

            //判断时间，还原状态
            function setState(i, tip) {
                avalon.mix(vm, {
                    state: i,
                    state_icon: i,
                    tip: tip,
                    state_last: i
                })
            }

            vm.default_time = function (timeout) {
                //延迟关闭
                clearTimeout(vm.timeout)
                var time = 0;
                if (vm.waitingTime === false) {//立即关闭操作
                    vm.state = 0;
                    return
                }
                if (timeout != null) {
                    time = timeout
                } else {
                    //默认延迟时间
                    time = 2000
                }
                vm.timeout = setTimeout(function () {
                    vm.state = 0;
                }, time);
            };

            /*输入框状态：
             * 0 —— 默认状态（无上方tip弹出框）default
             * 1 —— 失败  error
             * 2 —— 警告  warning
             * 3 —— 信息  info
             * 4 —— 成功（暂无tip弹出框）
             * */
            vm.default = function () {
                setState(0, '');
            };
            vm.info = function (tip, timeout) {
                //信息（蓝色）
                vm.waitingTime = true;
                setState(3, tip)
                vm.default_time(timeout);
            };
            vm.warning = function (tip, timeout) {
                //警告（橙棕色）
                vm.waitingTime = true;
                setState(2, tip);
                vm.default_time(timeout);
            };
            vm.error = function (tip, timeout) {
                //警告（红色）
                vm.waitingTime = true;
                setState(1, tip)
                vm.default_time(timeout);
            };
            vm.success = function () {
                vm.state_last = 0;
                vm.state = 0;
                vm.state_icon = 4;
            };


            //函数——右侧的提示按钮
            vm.ClickIt = function (t) {
                //点击获取焦点
                //t.parentElement.childNodes.item(1).nextElementSibling.focus()

                vm.opening = true
                setTimeout(function () {//为弹出动画进行的延迟，避免冲突
                    vm.opening = false
                }, 600)

                //判断是否为开启
                if (vm.state != 0) {
                    //执行关闭
                    vm.state = 0;
                    vm.waitingTime = false;
                } else {
                    //执行开启
                    vm.tip_again();
                    vm.waitingTime = true;
                }
            };
            //鼠标悬浮
            vm.Mouseenter = function () {
                clearTimeout(vm.timeout)
                clearTimeout(vm.leaveTime);
            };
            //鼠标移开
            vm.Mouseleave = function () {
                clearTimeout(vm.timeout)
                setTimeout(function () {
                    if (vm.opening) {
                        return
                    }
                    clearTimeout(vm.leaveTime);
                    vm.leaveTime = setTimeout(function () {
                        vm.state = 0;
                    }, 6000)
                }, 300)

            };
            //state_again方法用来设置vm.state的状态

            /*set_state 功能是什么

             *@params willing_state 这是什么参数，可能的值
             *
             * */
            function set_state(willing_state) {
                vm.state = willing_state;
            };

            //设置state的值，用以重新显示tip
            vm.tip_again = function () {
                var temp = vm.state_icon;
                if (vm.state_icon == 4) {
                    temp = 0;
                }
                //非focus状态悬浮才可以显示
                set_state(temp);
            };

            //将VM暴露到全局以供调用
            if (vm.id != "") {
                window[vm.id] = vm
            }
        },
        $ready: function (vm, elem) {
        },
        $template: html,
        core: "",//从外部进来的input
        label: "",
        sign: "",
        //提示文本的内容
        tip: "",

        timeout: '',//函数——表示延迟时间的setTimeout
        leaveTime: 0,//函数——鼠标移开的setTimeout
        waitingTime: true,//默认存在延迟时间
        opening: false,//标记——表示tip弹出框开启中的状态
        state: 0,
        state_last: 0,//标记——保存上一个状态的值，进行持续错误的判断
        state_icon: 0,//标记——图标的状态，将保持上一个的状态
        state_focus: 0,


        //提示弹出的方法
        default: function () {

        },
        info: function () {
            //提示(这里是占位的函数，在$init中编写函数用于加载相关的方法)
        },
        warning: function () {
            //警告(这里是占位的函数，在$init中编写函数用于加载相关的方法)
        },
        error: function () {
            //错误(这里是占位的函数，在$init中编写函数用于加载相关的方法)
        },
        //设置为成功的方法
        success: function () {
            //成功，
        },
        ClickIt: function () {

        },
        Mouseenter: function () {

        },
        Mouseleave: function () {

        },
        tip_again: function () {
            //持续错误
        },

        addEventHandler: function () {

        },

    })
});