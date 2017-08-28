/**
 * Created by mooshroom on 2015/8/30.
 */
define('search',
    [
        'avalon',
        'text!../../package/search/search.html',
        'css!../../package/search/search.css',
        'css!../../package/all/all'
    ],
    function (avalon, html) {
        var vm = avalon.define({
            $id: "search",
            ready: function (num) {
                //如在详情刷新，则加载一次列表
                if(parseInt(num)==1){
                    vm.search();
                }
                vm.curListIndex = 0;
                layout.url = html;
                avalon.scan();
            },

            /*商品和客户的快捷搜索*/
            searching: 0,
            $goodsHotKey:{
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
            },

            focus: function (i) {
                vm.searching = i
                if (i == 1) {
                    removeK(vm.$cusHotKey)
                    //todo 聚焦的是商品,绑定关于商品搜索的快捷键
                    bindK(vm.$goodsHotKey)

                }
                else if (i == 2) {
                    removeK(vm.$goodsHotKey)
                    //todo 聚焦的是客户,绑定关于客户搜索的快捷键
                    bindK(vm.$cusHotKey)
                }
            },
            blur: function () {
                //todo 快捷键解绑定
                removeK(vm.$goodsHotKey)
                removeK(vm.$cusHotKey)
                vm.searching = 0

                setTimeout(function(){
                    vm.goods = []
                    vm.customer = []
                },400)

            },
            // 商品搜索
            goods: [],
            goodsKey: "",
            goLastKey: "",
            focusGoods: -1,
            onGoods: false,
            goHover: function (i) {
                vm.onGoods = i

            },
            goOut: function (i) {
                vm.onGoods = 0
            },
//        lastInput:0,
            GP: 1,
            GT: 0,
            GN: 8,
            searchGoods: function () {
                if(vm.goodsKey != vm.goLastKey){
                    vm.goID=''
                    if (vm.goodsKey != "" ) {
                        //触发请求
                        vm.goLastKey = vm.goodsKey

                        vm.GP = 1
                        listen(vm.callGoods)
                    }
                }


            },
            pagerGoods: function (n) {
                var newGP = vm.GP + -n;
                if (newGP >= 1) {
                    vm.GP = newGP
                }
                else {
                    vm.GP = 1
                }

                listen(vm.callGoods)
            },
            //正是召唤商品列表
            callGoods: function () {
                if (vm.GP < 0) {
                    vm.GP = 0
                }
                ws.call({
                    i: "Goods/search",
                    data: {
                        keyword: vm.goodsKey,
                        P: vm.GP,
                        N: vm.GN
                    },
                    success: function (res,err) {
                        if (res.L.length) {
                            vm.GP = res.P

                            var list = []
                            var resL = res.L
                            var len = resL.length
                            var All = 0;
                            for (var i = 0; i < len; i++) {
                                //计算总库存

                                //当前库房获取逻辑,

                                if (resL[i].Store) {
                                    for (var o = 0; o < resL[i].Store.length; o++) {
                                        if (resL[i].Store[o].StoreID == quickStart.nowStore.StoreID) {
                                            All = resL[i].Store[o].Amount
                                            break
                                        }
                                    }
                                }


                                var go = {
                                    GoodsID: resL[i].GoodsID,
                                    Name: resL[i].Name,
                                    ThisTotle: All,
                                    AllTotle: resL[i].StoreTotal,
                                    Price1: resL[i].Price1,
                                    Price0: resL[i].Price0,
                                    BarCode:resL[i].BarCode
                                }
                                list.push(go)


                            }
                            vm.goods = list
                        }
                        else {
                            vm.goods = []
                            vm.GP--

                        }
                        vm.GT = res.T
                    }
                })
            },


            //选中商品
            selectGoods: function (index) {
                vm.focusGoods = index
            },
            //跳转商品详情
            jump2Goods: function (index) {
                vm.goID = vm.goods[index].GoodsID
                vm.goodsKey =vm.goLastKey= vm.goods[index].Name
                function goReset() {
                    vm.goods = []
                    vm.GP = 1
                    vm.GT = 0
                    //vm.goodsKey=""
                    //vm.goLastKey=""
                    vm.focusGoods = -1
                    vm.onGoods = false
                }

                goReset()

            },

            //客户搜索
            $cusHotKey:{
                "up": function () {
                    if(vm.focusCustomer>0){
                        vm.focusCustomer--
                    }
                    else{
                        vm.focusCustomer=vm.customer.length-1
                    }
                },
                "down":function(){
                    if(vm.focusCustomer<vm.customer.length-1){
                        vm.focusCustomer++
                    }
                    else{
                        vm.focusCustomer=0
                    }
                },
                'left':function(){
                    if(vm.CP>1){
                        vm.pagerCus(1)
                    }

                },
                "right": function () {
                    if(vm.CP<(Math.ceil(vm.CT/vm.CN))){
                        vm.pagerCus(-1)
                    }
                },
                'enter':function(){
                    if(vm.focusCustomer!=-1){
                        vm.jump2Customer(vm.focusCustomer)
                    }
                }
            },
            customer: [],
            customerKey: "",
            cusLastKey: "",
            focusCustomer: -1,
//        搜索客户
            searchCustomer: function () {
                if(vm.customerKey != vm.cusLastKey){
                    vm.cuID=""
                    if (vm.customerKey != "") {
                        //触发请求
                        vm.cusLastKey = vm.customerKey

                        vm.CP = 1;
                        vm.callCus()

                    }
                }

            },
            CP: 1,
            CT: 0,
            CN: 8,
            pagerCus: function (n) {
                var newCP = vm.CP + -n;
                if (newCP >= 1) {
                    vm.CP = newCP
                }
                else {
                    vm.CP = 1
                }

                listen(vm.callCus)
            },
            callCus: function () {
                if (vm.CP < 0) {
                    vm.CP = 0
                }
                ws.call({
                    i: "Customer/search",
                    data: {
                        keyword: vm.customerKey,
                        P: vm.CP,
                        N: vm.CN
                    },
                    success: function (res,err) {
                        if (res.L.length) {
//                            var list=[]
                            var resL = res.L
//                            var len=resL.length
//                            for(var i=0;i<len;i++){
//
//                                //插入数组
//                                list.push(resL[i])
//
//
//                            }
                            vm.customer = resL
                            vm.CP = res.P

                        }
                        else {
                            vm.customer = []
                            vm.CP--

                        }
                        vm.CT = res.T
                    }
                })
            },
            selectCustomer: function (index) {
                vm.focusCustomer = index
            },

            //跳转客户详情
            jump2Customer: function (index) {
                vm.cuID = vm.customer[index].TraderID
                vm.customerKey =vm.cusLastKey= vm.customer[index].Name
                function cuReset() {
                    vm.customer = []
                    vm.CP = 1
                    vm.CT = 0
                    //vm.customerKey=""
                    //vm.cusLastKey=""
                    vm.focusCustomer = -1
                    vm.onGoods = false
                }

                cuReset()
            },


            showList:[],
            /*按日期筛选订单*/
            tipping: false,
            dateFocus: false,
            openTip: function () {
                vm.tipping = true;
                vm.dateFocus = true;
            },
            closeTip: function () {
                vm.dateFocus = false;
                setTimeout(function () {
                    if (vm.dateFocus) {
                    }
                    else {
                        vm.tipping = false;
                    }
                }, 200)
                //vm.tipping=false
            },


            //DList:[],//按时间筛选的列表----使用showList代替
            DP: 0,
            DT: 0,
            gt: '',//大于开始的时间
            _gt: '',//转换之后的
            gto: "",//缓存上一次的数据
            lt: "",//小于终止时间
            _lt: '',//转换之后的
            lto: "",
            W:{},//判断条件门
            N:20,
            //todo 本地化这个函数
            yesToSearch:function(){
                vm.DP = 0;
                vm.showList = [];
                vm.search();
            },
            search: function () {
                //var W={}
                //验证是否原封不动
                function checkIfOld(){

                    //判断值是否被更改
                    if (vm.goID!=vm.goIDo||vm.cuID!=vm.cuIDo||vm.minMoney!=vm.minMoneyo||vm.maxMoney!=vm.maxMoneyo||vm.gt != vm.gto || vm.lt != vm.lto) {
                        //被更改了
                        vm.W=new Object
                        buildGoods()
                        buildCustomer()
                        buildTime()
                        buildMoney()
                        vm.gto = vm.gt;
                        vm.lto = vm.lt;
                        vm.goIDo=vm.goID;
                        vm.cuIDo=vm.cuID;
                        vm.minMoneyo=vm.minMoney;
                        vm.maxMoneyo=vm.maxMoney

                        vm.DP = 0;
                        vm.DT = 0;
                        vm.showList = []

                        //vm.count(vm.showList)

                    }

                }


                //验证日期格式的函数
                function checkDate() {

                    //用于验证格式
                    function check(p) {

                        var reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;

                        if (vm[p].match(reg) || vm[p] == "") {
                            return true;
                        } else {
                            if (p == "gt") {
                                tip.on('开始时间格式错误')
                            } else if (p == "lt") {
                                tip.on('结束时间格式错误')
                            }

                            return false
                        }
                    }

                    return check("gt") && check('lt');


                }

                //验证钱的格式
                function checkMoney(){
                    function check(num){
                        if(Number(num)>0||num==""){
                            //通过
                            return true
                        }
                        else{
                            tip.on("金额数值输入错误："+num)
                            return false
                        }
                    }


                    return check(vm.minMoney)&&check(vm.maxMoney)

                }

                //构建商品条件
                function buildGoods(){
                    if(vm.goID!=""){
                        vm.W.GoodsID=vm.goID
                    }
                    else if(vm.goID==""&&vm.goodsKey!=""){

                        var reg=/[ ]{1,}/g
                        var key=vm.goodsKey.replace(reg,"%")

                        vm.W.Goods=['like','%'+key+'%']
                    }else if(vm.goID==""&&vm.goodsKey==""){
                        //删除对应的条件
                        if(vm.W.GoodsID){
                            vm.W.GoodsID=undefined
                        }
                        if(vm.W.Goods){
                            vm.W.Goods=undefined
                        }
                    }
                }

                //构建客户条件
                function buildCustomer(){
                    if(vm.cuID!=""){
                        vm.W.TraderID =vm.cuID
                    }
                    else if(vm.cuID==""&&vm.customerKey!=""){

                        var reg=/[ ]{1,}/g
                        var key=vm.customerKey.replace(reg,"%")

                        vm.W.Customer=['like','%'+key+'%']
                    }else if(vm.cuID==""&&vm.customerKey==""){
                        //删除对应的条件
                        if(vm.W.TraderID){
                            vm.W.TraderID=undefined
                        }
                        if(vm.W.Customer){
                            vm.W.Customer=undefined
                        }
                    }
                }

                //构建时间判断条件的函数
                function buildTime() {
                    function parse(str) {
                        if (str == "") {
                            return ""
                        }
                        else {
                            return Number(Date.parse(newDateAndTime(str)) / 1000).toFixed()
                        }

                    }

                    //如果，缺少开始时间，则开始时间为2014年6月23日，如果缺少结束时间，则结束时间为当前时间
                    //先判断gtlt是否和之前的不一样
                    var gt = parse(vm.gt + ' 00:00:00')

                    if (vm.gt != "") {
                        vm._gt = gt
                    }
                    else {
                        //vm.gt = "开始时间"
                        vm._gt = parse("2014-06-23")
                    }

                    var lt = parse(vm.lt + " 23:59:59")

                    if (vm.lt != "") {
                        vm._lt = lt
                    } else {
                        //vm.lt = "结束时间"
                        vm._lt = new Date().getTime()
                    }

                    if(vm.gt==""&&vm.lt==""){
                       //去掉对应的时间筛选条件
                        vm.W.Time=undefined
                    }else{
                        vm.W.Time=[
                            ['elt', vm._lt],
                            ['egt', vm._gt],
                            "and"
                        ]
                    }

                }

                //构建钱的区间
                function buildMoney(){
                    if(vm.minMoney==""&&vm.maxMoney==""){
                        //去除对应的筛选条件
                        vm.W.Total=undefined
                    }
                    else if(vm.minMoney==""&&vm.maxMoney!=""){
                        //只有最大的
                        vm.W.Total=[
                            ['elt', vm.maxMoney],
                            //['egt', vm._gt],
                            //"and"
                        ]
                    }
                    else if(vm.minMoney!=""&&vm.maxMoney==""){
                        //只有最小的
                        vm.W.Total=[
                            //['elt', vm.maxMoney],
                            ['egt', vm.minMoney],
                            //"and"
                        ]
                    }
                    else if(vm.minMoney!=""&&vm.maxMoney!=""){
                        //都有的
                        if(Number(vm.minMoney)<=Number(vm.maxMoney)){
                            vm.W.Total=['between', [vm.minMoney,vm.maxMoney]]
                        }else{
                            vm.W.Total=['between', [vm.maxMoney,vm.minMoney]]
                        }


                    }
                }

                //构建条件
                function buildW(){
                    var W={}
                    for (var x in vm.W) {
                        if (x.charAt(0) != '$') {
                            W[x] = vm.W[x]
                        }
                    }
                    return W
                }

                //发起请求的函数
                function call() {
                    //vm.now = -235
                    ws.call({
                        i: "Order/search",
                        data: {
                            P: vm.DP + 1,
                            N: vm.N,
                            W: buildW()
                        },
                        success: function (res,err) {
                            if (!res.err) {
                                //vm.showList=[]
                                vm.DP = res.P;
                                vm.DT = res.T;
                                try {
                                    if (res.L.length > 0) {
                                        for (var i = 0; i < res.L.length; i++) {
                                            //计算应结金额
                                            res.L[i].Need = (Number(res.L[i].Total) - Number(res.L[i].Payed)).toFixed(2)
                                            //vm.DList.push(res.L[i])
                                            vm.showList.push(res.L[i])
                                            //filter(res.L[i])

                                        }
                                        //vm.showList=vm.DList
                                        vm.count(vm.showList)
                                    }
                                    else {
                                        vm.DP = res.P - 1
                                        tip.on("没有更多数据了~", 1, 3000)
                                    }

                                } catch (err) {

                                }
                            } else {
                                console.log(res.err)
                            }
                        }
                    })

                    ////重置无限开始和无限结束
                    //if(vm.gt=="开始时间"){
                    //    vm.gt=vm._gt=""
                    //}
                    //if(vm.lt=="结束时间"){
                    //    vm.lt=vm._lt=""
                    //}
                }

                checkIfOld()
                if (checkDate()&&checkMoney()) {
                    call()
                }
            },

            /*订单搜索*/
            //条件搜集
            goID: '',//商品id
            goIDo:'',
            cuID: '',//客户id
            cuIDo:'',
            minMoney: '',//最小金额
            minMoneyo:'',
            maxMoney: '',//最大金额
            maxMoneyo:'',

            //去详细
            ready2info: function () {
                require(['../order/info'], function () {

                })
            },
            changeOrder: -1,
            toInfo: function (id, index,OrderCode) {
                vm.curListIndex = index;
                if(Math.abs(OrderCode)!=3){
                    window.location.href='#!/OrderInfo/'+ id + "&";
                    vm.changeOrder = index
                }
            },

            curListIndex:0,
            lookLastGood:function(){
                var el = 0;
                console.log("-----------进入上一个")
                if(vm.curListIndex > 0){
                    console.log("+++++++++++++++++++ 上 ")
                    vm.curListIndex --;
                    el = vm.showList[vm.curListIndex];
                    vm.toInfo(el.OrderID,vm.curListIndex,el.OrderCode);
                }
            },
            lookNextGood:function(){
                var el = 0;
                console.log("-----------进入下一个")
                if(vm.curListIndex < vm.showList.length - 1){
                    console.log("+++++++++++++++++++ 下 ")
                    vm.curListIndex ++;
                    el = vm.showList[vm.curListIndex];
                    vm.toInfo(el.OrderID,vm.curListIndex,el.OrderCode);
                }
            }
        })

        return search=vm
    })