/**
 * Created by mooshroom on 2015/12/12.
 */
define([
    "avalon",
    "text!.. /../lib/goodsInput/goodsInput.html",
    '../../lib/goodsInput/getInputPosition',
    "css!../../lib/goodsInput/goodsInput.css"
], function (avalon, html) {
    //声明新生成组件的ID
    avalon.component("tsy:goodsinput",{

        $init: function (vm,elem) {       //组件加载成功后自动执行
            //快捷键
            vm.$goodsHotKey={
                $opt:{
                    type:"keydown"
                },
                "up": function () {
                    if(vm.focusGoods>0){
                        vm.focusGoods--
                    }
                    else{
                        vm.focusGoods=vm.goods.length-1
                    }
                },
                "down":function(){
                    if(vm.focusGoods<vm.goods.length-1){
                        vm.focusGoods++
                    }
                    else{
                        vm.focusGoods=0
                    }
                },
                'left':function(){
                    if(vm.GP>1){
                        vm.pagerGoods(1)
                    }

                },
                "right": function () {
                    if(vm.GP<(Math.ceil(vm.GT/vm.GN)))
                        vm.pagerGoods(-1)
                },
                'enter':function(){
                    if(vm.focusGoods!=-1){
                        vm.jump2Goods(vm.focusGoods)
                    }
                }
            }
//选中商品
            vm.selectGoods=function (index) {
                vm.focusGoods = index
            };
            //执行回调
            vm.jump2Goods=function (index) {

                vm.callback(vm.goods[index])
                vm.goReset()
                vm.mustOut()

            };
            vm.mustOut= function () {
                vm.showing=vm.hovering=false
            }
            vm.goReset= function () {
                vm.goods = []
                vm.GP = 1
                vm.GT = 0
                vm.goodsKey = ""
                vm.goLastKey = ""
                vm.focusGoods = -1
                vm.onGoods = false
                vm.goodsWaiting=false
                vm.goodsDone=false
                vm.thatIsTM=''
            };
            vm.posePanel=function(ele){
                var p=cursor.getInputPositon(ele)
                vm.left= p.left
                vm.top= p.bottom
                vm.searchGoods(ele.value)
                vm.show(true)
            }

            vm.show= function (bool) {
                vm.showing=bool
                if(bool){
                    bindK(vm.$goodsHotKey)
                }else{
                    removeK(vm.$goodsHotKey)
                }
            }
            vm.goHover=function (i) {
                vm.hovering=i

            }

            //vm.goOut=function (i) {
            //    vm.onGoods = 0
            //}
            vm.searchGoods=function (key) {
                if(key==""){
                    //重置
                    vm.goReset()
                }else if(key!=vm.goLastKey){
                    vm.GP = 1
                    vm.GT = 0
                    /*
                     * 判断是否为条码枪输入的方法：
                     * 1. 快速输入，
                     * 2. 输入结果>=5&&<=30
                     * 3. 输入结果符合条码正则表达式
                     * 4. 返回结果有且只有一个
                     * */
                    vm.goodsKey=vm.goLastKey=key


                    //之前有延迟的
                    vm.inputTimes++ //用于连击判断的连击累计
                    console.log("*"+vm.inputTimes+"连击")
                    clearTimeout(vm.searchTimeOut)

                    //条码输入第一层判断
                    reg = new RegExp(/[A-Za-z\/0-9]{5,30}/g)//判断条码的表达式
                    if((vm.inputTimes>=5&&vm.inputTimes<=30)&&reg.test(key)){
                        //初步判断是条码输入
                        console.log("初步判断是条码输入:"+key)
                        vm.thatIsTM=key
                        vm.searchTimeOut=setTimeout(function(){

                            vm.callGoods()
                            vm.searchTimeOut=0
                        },80)//为反复测试之后，刚好在人肉输入的间隙，不会导致过量请求的值
                    }else{
                        //人肉输入
                        vm.searchTimeOut=setTimeout(function(){
                            vm.callGoods()
                            vm.searchTimeOut=0
                        },80)
                    }


                }
            };

            vm.pagerGoods= function (n) {
                var newGP = vm.GP + -n;
                if (newGP >= 1) {
                    vm.GP = newGP
                }
                else {
                    vm.GP = 1
                }
                clearTimeout(vm.searchTimeOut)
                vm.searchTimeOut=setTimeout(function(){
                    vm.callGoods()
                    vm.searchTimeOut=0
                },80)
            };
            //正是召唤商品列表
            vm.callGoods= function () {
                vm.inputTimes=0
                vm.goodsWaiting=true
                if (vm.GP < 1) {
                    vm.GP = 1
                }


                //组装请求参数
                var data={
                        Keyword: vm.goodsKey,
                        P: vm.GP,
                        N: vm.GN,
                        W:{
                            Disable: '0',
                        }
                    }
                try{
                    vm.$customerID=bill.customer.TraderID

                    if(vm.$customerID>0){
                        data.W.TraderID=vm.$customerID
                        data.Properties=['LastPrice']
                    }
                }catch(err){console.log(err.message)}

                //发起请求
                ws.call({
                    i: "Goods/Goods/search",
                    data: data,
                    success: function (res) {
                        if(res.err){
                            top.on(res.err)
                            return
                        }
                        vm.goodsDone=true
                        if(vm.GP == res.P){
                            if (res.L.length && vm.goodsKey != '') {
                                //vm.GP = res.P


                                var list = []
                                var resL = res.L
                                var len = resL.length

                                for (var i = 0; i < len; i++) {

                                    var All = 0;
                                    //当前库房获取逻辑,

                                    if (resL[i].Stocks) {
                                        for (var o = 0; o < resL[i].Stocks.length; o++) {
                                            if (resL[i].Stocks[o].StoreID == quickStart.nowStore.StoreID) {
                                                All = resL[i].Stocks[o].Amount
                                                break
                                            }
                                        }
                                    }

                                    if(resL[i].Prices.length==0){
                                        resL[i].Prices=[{Price:0},{Price:0}]

                                    }

                                    var go = {
                                        GoodsID: resL[i].GoodsID,
                                        Name: resL[i].Name,
                                        Model:resL[i].Model,
                                        ThisTotle: All,
                                        AllTotle: resL[i].TotalStock,
                                        Standard: resL[i].Standard,
                                        UnitName: resL[i].UnitName,
                                        os: resL[i].Standard,
                                        ou: resL[i].UnitName,
                                        BarCode:resL[i].BarCode,
                                        Quality:resL[i].Quality,
                                        URL:resL[i].URL
                                    }

                                        //加载销售价
                                    try{
                                        go.Price1=resL[i].Prices['T2'].Price
                                    }catch (err){}

                                    //加载成本
                                    try{
                                        go.Price0=resL[i].Prices['T1'].Price
                                    }catch (err){}

                                    //加载上次价
                                    try{
                                        go.LP=resL[i].LastPrice
                                    }catch (err){}

                                    //加载租赁价格
                                    try{
                                        if(resL[i].Prices["T3"]===undefined){
                                            //还没有设置租赁价格的
                                            go.Price3=resL[i].Prices["T1"].Price
                                        }else{
                                            go.Price3=resL[i].Prices["T3"].Price
                                        }

                                    }catch(err){}

                                    //加载最高采购价及最低采购价
                                    try{
                                        if(resL[i].MinInPrice>0){
                                            go.MinInPrice=resL[i].MinInPrice
                                        }else if(resL[i].MinInPrice==null&&resL[i].MaxInPrice>0){
                                            go.MinInPrice=resL[i].MaxInPrice
                                        }else{
                                            go.MinInPrice=0
                                        }
                                    }catch (err){}
                                    try{
                                        if(resL[i].MaxInPrice>0){
                                            go.MaxInPrice=resL[i].MaxInPrice
                                        }else{
                                            go.MaxInPrice=0
                                        }
                                    }catch (err){}

                                    //填入商品
                                    list.push(go)


                                }


                                vm.goods = list
                                /***判断是否为条形码***/
                                if(res.L.length == 1&&vm.thatIsTM!=""&&vm.thatIsTM==res.L[0].BarCode){

                                    vm.callbackTM(list[0])
                                    //vm.goodsKey = '';
                                    //vm.thatIsTM = "";       //是否为条形码
                                    vm.goReset()

                                    return;
                                }
                            } else {
                                vm.goods = []
                                //vm.GP--

                            }
                            vm.GT = res.T
                        }
                        vm.goodsWaiting=false


                    }
                })
            }

            window[this.id]=vm

        },
        $template:html,

        onInit: function () {

        },
        /*配置区域*/
        //选取之后的回调函数
        callback: function (goods) {
            console.log("尚未配置商品搜索组件：" +this.id+"的回调函数")
        },
        //条码枪返回之后的回掉函数
        callbackTM: function (goods) {
            console.log("尚未配置商品搜索组件：" +this.id+"的条码枪回调函数，将执行默认回调")
            this.callback(goods)
        },

        //暴露出来的名字
        id: "goodsInput",
        $customerID:"",
        /*内部区域*/

        //控制面板位置
        left:'',
        top:'',

        //控制面板的显示
        showing:false,

        hovering:false,
        goHover:function(){},
        selectGoods: function () {},





        // 商品搜索
        goodsWaiting:false,
        goodsDone:false,
        goods: [],
        goodsKey: "",
        goLastKey: "",
        focusGoods: -1,
        onGoods: false,
        pagerGoods:function(){},
//        lastInput:0,
        GP: 1,
        GT: 0,
        GN: 8,
        /*为判断条码创造的变量*/
        lastTime:0,      //上次改变时间
        inputTimes:0,//累计连续输入次数
        searchTimeOut:0,
        thatIsTM:false,       //是否为条形码

        $waiting:false,
        $waitTime:2,
        jump2Goods: function () {

        },
        mustOut: function () {

        }



    });

});
