/**
 * Created by mooshroom on 2015-06-12.
 * modal弹出框组件
 * 版本：V2.0.0
 * 使用avalon组件模式重构
 */
define([
    "avalon",
    'text!../../lib/modal/modal.html',
    'css!../../lib/modal/modal.css',
    '../../lib/modal/mousePos'
], function (avalon, html) {

        var vm
        avalon.component("tsy:modal",{
            id: "modal",
            $init: function () {
                vm=this
                window[vm.id]=vm
            },
            $template: html,
            $element:"",
            $ready:function(){
                ///初始化配置
                vm.$element=window.document.getElementById(vm.id).children[0]
            },
            $remove: function () {
//                element.innerHTML = ""

            },
            onInit: function () {

            },

            /*具体实现*/
            url: "",
            toggle: false,
            //*获取全局变量*/

            mx: 0,//鼠标X坐标
            my: 0,//鼠标Y坐标

            sx: 0,//弹框开始位置X坐标
            sy: 0,//弹框开始位置Y坐标
            //鼠标位置
            getMouse:function(ev){
                console.log(ev)
                ev = ev || window.event;
//                var mousePos = mouseCoords(ev);
//alert(ev.pageX);
                //获取滚动高度
                var ST=0;
                if(document.documentElement&&document.documentElement.scrollTop)
                {
                    ST=document.documentElement.scrollTop;
                }
                else if(document.body)
                {
                    ST=document.body.scrollTop;
                }

                // 计算位置
                if(!vm.toggle){
                    vm.left=vm.mx = mousePos.x;
                    vm.top=vm.my = mousePos.y-ST;
                }
                else{
                    vm.mx = mousePos.x;
                    vm.my = mousePos.y;
                }


            },


            top: 0,
            left: 0,
            right:10,
            opacity: 1,
            transform: "scale(0)",

            times: 0,


            bodyST:""
            //*模态框弹出*/
            , getIn: function (ev) {

                //缓存页面的滚动高度
                if(document.documentElement&&document.documentElement.scrollTop)
                {
                    vm.bodyST=document.documentElement.scrollTop;
                }
                else if(document.body)
                {
                    vm.bodyST=document.body.scrollTop;
                }

                vm.getMouse(ev)


                vm.sx = vm.left
                vm.sy = vm.top
                vm.toggle = true;


                window.setTimeout(function () {
                    vm.resetBodyST()
                    var ww=window.innerWidth || window.screen.availWidth;
                    console.log("ww:"+ww)
                    var bw=window.document.getElementById(vm.id).children[0].children[0].style.width
                    console.log("bw:"+bw)

                    vm.left=0

                    vm.top=70
                    vm.width = "100%"
                    vm.height = "100%"
                    vm.transform = "scale(1)"


                }, 0.001)
                document.body.style.overflowY = "hidden";
                vm.times++


            },
            canGetOut: true,
            can: function (val) {
                vm.canGetOut = val
            }
            //*模态框关闭*/
            , getOut: function () {
                if (vm.canGetOut && vm.toggle) {
                    vm.left = vm.sx
                    vm.top = vm.sy
                    vm.transform = "scale(0)"
                    window.setTimeout(function () {
                        vm.toggle = false;
                    }, 250)
                    document.body.style.overflowY = "auto"
                    setTimeout(vm.resetBodyST,1)
                }
                else{
                    console.log("canGetOut:"+vm.canGetOut+";toggle:"+vm.toggle)
                }


//
            },
            resetBodyST:function(){
                //设置页面的滚动高度
                if(document.documentElement&&document.documentElement.scrollTop)
                {
                    document.documentElement.scrollTop =vm.bodyST;
                }
                else if(document.body)
                {
                    document.body.scrollTop=vm.bodyST;
                }

                //vm.bodyST=""
            },
            mustOut:function(){
                if(vm.toggle){
                    vm.left = vm.sx
                    vm.top = vm.sy
                    vm.transform = "scale(0)"
                    window.setTimeout(function () {
                        vm.toggle = false;
                    }, 250)
                    document.body.style.overflowY = "auto"
                    setTimeout(vm.resetBodyST,1)
                }
            }



        })

})