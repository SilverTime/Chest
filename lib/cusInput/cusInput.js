/**
 * Created by mooshroom on 2015/12/12.
 */
define([
    "avalon",
    "text!.. /../lib/cusInput/cusInput.html",
    '../../lib/goodsInput/getInputPosition',
    "css!../../lib/cusInput/cusInput.css"
], function (avalon, html) {
    //声明新生成组件的ID
    avalon.component("tsy:cusinput", {


        /*配置区域*/
        //选取之后的回调函数
        callback: function (cus) {
            console.log("尚未配置商品搜索组件：" + this.id + "的回调函数")
        },
        //条码枪返回之后的回掉函数
        callbackTM: function (cus) {
            console.log("尚未配置商品搜索组件：" + this.id + "的条码枪回调函数，将执行默认回调")
            this.callback(cus)
        },

        //暴露出来的名字
        id: "cusInput",

        show: function () {

        },
        showing:false,
        hovering:false,
        goHover: function () {

        },
        mustOut: function () {

        },
        left:"",
        top:"",
        posePanel: function () {

        },
        searching: function () {

        },
        searchTimeOut:0,
        customerSearch: function () {

        },
        pager: function () {

        },
        key:"",
        lastKey:"",
        state:"default", //waiting done err
        P:1,
        N:8,
        T:0,

        list:[],
        focusCustomer:0,

        selectCustomer: function () {

        },
        jump2Customer: function () {

        },
        reset: function () {

        },
        //组件加载成功后自动执行
        $init: function (vm, elem) {
            console.log("客户供应商动态搜索组建开始生成:"+vm.id)
            //快捷键配置
            vm.$cusHotKey= {
                "up": function () {
                    if (vm.focusCustomer > 0) {
                        vm.focusCustomer--
                    }
                    else {
                        vm.focusCustomer = vm.list.length - 1
                    }
                },
                "down": function () {
                    if (vm.focusCustomer < vm.list.length - 1) {
                        vm.focusCustomer++
                    }
                    else {
                        vm.focusCustomer = 0
                    }
                },
                'left': function () {
                    if (vm.P > 1) {
                        vm.pager(1)
                    }

                },
                "right": function () {
                    if (vm.P < (Math.ceil(vm.T / vm.N))) {
                        vm.pager(-1)
                    }
                },
                'enter': function () {
                    if (vm.focusCustomer != -1) {
                        vm.jump2Customer(vm.focusCustomer)
                    }
                }
            },

            //当获取焦点的时候
            vm.show = function (bool) {
                vm.showing = bool
                if (bool) {
                    bindK(vm.$cusHotKey)
                } else {
                    removeK(vm.$cusHotKey)
                }
            }
            //当失去焦点的时候
            vm.mustOut = function () {
                vm.showing = vm.hovering = false
            }
            //悬停控制
            vm.goHover=function (i) {
                vm.hovering=i

            }
            //输入中
            vm.posePanel = function (ele) {
                var p = cursor.getInputPositon(ele)
                vm.left = p.left
                vm.top = p.bottom
                vm.searching(ele.value)
                vm.show(true)
            }
            //分页控制
            vm.pager= function (n) {
                var newP=vm.P+-n;
                vm.P=(newP>=1)?newP:1
                if(vm.searchTimeOut!=0){
                    clearTimeout(vm.searchTimeOut)
                }
                vm.searchTimeOut=setTimeout(function(){
                    vm.customerSearch()
                    vm.searchTimeOut=0
                },80)
            }
            //搜索接口
            vm.searching=function (key) {
                if(key==""){

                    //重置
                    vm.reset()
                }else if(key!=vm.lastKey){
                    if(vm.searchTimeOut!=0){
                        clearTimeout(vm.searchTimeOut)
                    }
                    vm.P = 1
                    vm.T = 0
                    vm.key=vm.lastKey=key

                    vm.searchTimeOut=setTimeout(function(){
                        vm.customerSearch(vm.key)
                        vm.searchTimeOut=0
                    },80)


                }
            };

            vm.customerSearch= function () {
                vm.state="waiting"
                if (vm.P < 1) {
                    vm.P = 1
                }
                ws.call({
                    i: "Trader/Trader/search",
                    data: {
                        Keyword: vm.key,
                        P: vm.P,
                        N: vm.N
                    },
                    success: function (res) {
                        vm.state="done"
                        //判断错误的情况
                        if(res.err){
                            vm.reset()
                            vm.state="err"
                            return
                        }
                        //判断页码是否匹配，
                        if (vm.P == res.P) {
                            //长度是否正常，关键词是否健在
                            if (res.L.length && vm.key != '') {
                                vm.list = res.L

                                vm.P = res.P

                            }
                            else {
                                vm.reset()
                            }
                            vm.T = res.T

                        }


                    }
                })
            }


            //选中的时候
            vm.selectCustomer= function (index) {
                vm.focusCustomer = index
            },

            //触发的回调
            vm.jump2Customer=function (index) {
                vm.callback(vm.list[index])
                vm.reset()
                vm.mustOut()

            },

            //重置
            vm.reset= function () {
                avalon.mix(vm,{
                    key:"",
                    lastKey:"",
                    state:"default", //waiting done err
                    P:1,
                    N:8,
                    T:0,
                    list:[],
                })
            }
            //暴露VM到window上
            window[this.id] = vm

        },
        $template: html,

        onInit: function () {

        },



    });

});
