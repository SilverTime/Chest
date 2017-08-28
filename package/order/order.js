/**
 * Created by mooshroom on 2015/7/26 0026.
 *
 * 总帐记录 模块逻辑
 */
define('order', [
    'avalon',
    'text!../../package/order/order.html',
    'text!../../package/order/info.html',
    'css!../../package/order/order.css',
    '../../lib/cusInput/cusInput.js'
], function (avalon, html, info) {
    var vm = avalon.define({
        $id: "order",
        ready: function () {
            vm.showList = vm.data[0].list;
            //vm.resetFrom();
            layout.url = html;
            avalon.scan();
            if (vm.firstTime) {
                vm.filt(0);
                vm.firstTime = false;
            }
        },
        resetItem: function () {
            vm.resetFrom();
            vm.data[vm.now].P = 0;
            vm.data[vm.now].list = [];
            vm.getList();
        },
        resetFrom: function () {
            //vm.checkNone();
            //取消所有的选择
            //vm.unCheck();
            /*总金  */
            vm.allInMoney = "0.00";
            vm.allOutMoney = "0.00";
            vm.endInMoney = "";
            vm.endOutMoney = "";
            vm.$allInMoneyOrderId = [];
            vm.$allOutMoneyOrderId = [];
            /*表单*/
            vm.goodsID = "";
            vm.TraderID = "";
            vm.goodsKey = "";
            vm.customerKey = "";
            vm.gt = "";
            vm.lt = "";
            vm.minMoney = "";
            vm.maxMoney = "";
            /*结算表单*/
            vm.showEndForm = false;
            vm.allMError1 = false;
            vm.allMError2 = false;
            /*选择全部*/
            vm.selectAll = false;
            //记录当前选择的客户供应商
            vm.nowCusId = "";
            vm.haveOtherCus = false;
            /*用于综合搜索*/
            vm.$orderSearch = {};
            /************** 以下是商品/客户搜索的初始化 ***************/
            vm.searching = 0;
            vm.onGoods = false;
            vm.GP = 1;
            vm.GT = 0;
            vm.GN = 8;
            vm.CP = 1;
            vm.CT = 0;
            vm.CN = 8;
            vm.goID = '';
            vm.cuID = "";
            vm.goods = [];
            vm.customer = [];
            vm.goLastKey = "";
            vm.focusGoods = -1;
            vm.cusLastKey = "";
            vm.focusCustomer = -1;
            //获取一次列表
            /*for(var i = 0;i < 8;i ++){
             vm.data[i].P =0;*/
            //vm.data[i].list = [];
            /*}*/
            //vm.getList();
        },
        firstTime: true,
        /*keyword:"",*/
        /*表单需要的数据*/
        goodsID: "",
        TraderID: "",
        goodsKey: "",
        customerKey: "",
        gt: "",
        lt: "",
        minMoney: "",
        maxMoney: "",
        allInMoney: "0.00",
        allOutMoney: "0.00",
        /*结算表单*/
        endInMoney: "",
        endOutMoney: "",
        $allInMoneyOrderId: [],
        $allOutMoneyOrderId: [],
        /*显示结算表单*/
        showEndForm: false,
        allMError1: false,
        allMError2: false,
        /*选择全部*/
        selectAll: false,
        //记录当前选择的客户供应商
        nowCusId: "",
        haveOtherCus: false,
        /*用于综合搜索*/
        $orderSearch: {},
        /**********************************  以下为商品/客户搜索的代码  *************************************/
        /*商品和客户的快捷搜索*/
        searching: 0,
        onGoods: false,

        GP: 1,
        GT: 0,
        GN: 8,

        CP: 1,
        CT: 0,
        CN: 8,

        // 商品搜索
        goID: '',
        cuID: "",

        goods: [],
        customer: [],

        goLastKey: "",
        focusGoods: -1,

        cusLastKey: "",
        focusCustomer: -1,

        $goodsHotKey: {
            $opt: {
                type: "keydown"
            },
            "up": function () {
                if (vm.focusGoods > 0) {
                    vm.focusGoods--
                }
                else {
                    vm.focusGoods = vm.goods.length - 1
                }
            },
            "down": function () {
                if (vm.focusGoods < vm.goods.length - 1) {
                    vm.focusGoods++
                }
                else {
                    vm.focusGoods = 0
                }
            },
            'left': function () {
                if (vm.GP > 1) {
                    vm.pagerGoods(1)
                }

            },
            "right": function () {
                if (vm.GP < (Math.ceil(vm.GT / vm.GN)))
                    vm.pagerGoods(-1)
            },
            'enter': function () {
                if (vm.focusGoods != -1) {
                    vm.jump2Goods(vm.focusGoods)
                }
            }
        },
        focus: function (i) {
            vm.searching = i
            if (i == 1) {
                removeK(vm.$cusHotKey)
                bindK(vm.$goodsHotKey)
            }
            else if (i == 2) {
                removeK(vm.$goodsHotKey)
                bindK(vm.$cusHotKey)
            }
        },
        blur: function () {
            removeK(vm.$goodsHotKey)
            removeK(vm.$cusHotKey)
            vm.searching = 0
            setTimeout(function () {
                vm.goods = []
                vm.customer = []
            }, 400)
        },
        goHover: function (i) {
            vm.onGoods = i
        },
        goOut: function (i) {
            vm.onGoods = 0
        },
        searchGoods: function () {
            if (vm.goodsKey != vm.goLastKey) {
                vm.goID = ''
                if (vm.goodsKey != "") {
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
                                BarCode: resL[i].BarCode
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


        $optGI_order: {
            id: "goodsSearchOrder",
            callback: function (goods) {
                /*记录商品ID*/
                vm.goodsID = goods.GoodsID;
                vm.goID = goods.GoodsID
                vm.goodsKey = vm.goLastKey = goods.Name
                vm.checkForm();

                //给交易方设置焦点
                document.getElementById('OrderGoodsInput').blur()
                document.getElementById('OrderCustomerInput').focus()

            },
            callbackTM: function (goods) {
                /*记录商品ID*/
                goodsSearchOrder.callback(goods)
                goodsSearchOrder.mustOut()
            }
        },

        //客户搜索
        $optCI_order: {
            id: 'cusSearchOrder',
            callback: function (cus) {
                vm.TraderID = cus.TraderID;
                vm.cuID = cus.TraderID
                vm.customerKey = vm.cusLastKey = cus.Name
                vm.checkForm();
                document.getElementById('OrderCustomerInput').blur()
                cusSearchOrder.mustOut()
                cusSearchOrder.reset()
            }
        },
        $cusHotKey: {
            "up": function () {
                if (vm.focusCustomer > 0) {
                    vm.focusCustomer--
                }
                else {
                    vm.focusCustomer = vm.customer.length - 1
                }
            },
            "down": function () {
                if (vm.focusCustomer < vm.customer.length - 1) {
                    vm.focusCustomer++
                }
                else {
                    vm.focusCustomer = 0
                }
            },
            'left': function () {
                if (vm.CP > 1) {
                    vm.pagerCus(1)
                }

            },
            "right": function () {
                if (vm.CP < (Math.ceil(vm.CT / vm.CN))) {
                    vm.pagerCus(-1)
                }
            },
            'enter': function () {
                if (vm.focusCustomer != -1) {
                    vm.jump2Customer(vm.focusCustomer)
                }
            }
        },
        //搜索客户
        searchCustomer: function () {
            if (vm.customerKey != vm.cusLastKey) {
                vm.cuID = ""
                if (vm.customerKey != "") {
                    //触发请求
                    vm.cusLastKey = vm.customerKey
                    vm.CP = 1;
                    vm.callCus()
                }
            }
        },
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
                        var resL = res.L
                        vm.customer = resL
                        vm.CP = res.P
                    } else {
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
            /*记录客户ID*/
            vm.TraderID = vm.customer[index].TraderID;
            vm.cuID = vm.customer[index].TraderID
            vm.customerKey = vm.cusLastKey = vm.customer[index].Name
            function cuReset() {
                vm.customer = []
                vm.CP = 1
                vm.CT = 0
                vm.focusCustomer = -1
                vm.onGoods = false
            }

            cuReset()
            vm.checkForm();
        },
        /*******************************************************************************************/
        checkForm: function () {

            console.log("------------------- 检查数据！！ ")
            vm.$orderSearch = {};


            //调整日期前后，调整金额前   比较日期和金额的内容


            vm.$orderSearch.OrderCode = vm.$typeData[vm.now];

            /* vm.$orderSearch.keyword = vm.keyword;*/

            if (vm.goodsKey != "" && vm.goodsID != "") {
                vm.$orderSearch.GoodsID = vm.goodsID;
            }
            if (vm.customerKey != "" && vm.TraderID != "") {
                vm.$orderSearch.TraderID = vm.TraderID;
            }

            console.log(vm.lt + "+" + vm.gt)

            if (vm.lt != "" || vm.gt != "") {
                vm.$orderSearch.Time = [];

                if (vm.lt != "") {
                    var dateArrA = [];
                    dateArrA[0] = 'elt';
                    dateArrA[1] = newDateAndTime(vm.lt).getTime() / 1000;//小于或等于终止时间
                    vm.$orderSearch.Time.push(dateArrA);
                }
                if (vm.gt != "") {
                    var dateArrB = [];
                    dateArrB[0] = 'egt';
                    dateArrB[1] = newDateAndTime(vm.gt).getTime() / 1000;//大于或等于于起始时间戳
                    vm.$orderSearch.Time.push(dateArrB);
                }

            }

            console.log(vm.lt + "+" + vm.gt)

            console.log(vm.maxMoney + "+" + vm.minMoney)

            /*存在金钱条件*/
            if (vm.maxMoney != "" || vm.minMoney != "") {
                var aMoney, iMoney;
                if (parseFloat(vm.maxMoney) <= vm.minMoney != "") {
                    aMoney = vm.minMoney;
                    iMoney = vm.maxMoney;
                } else {
                    iMoney = vm.minMoney;
                    aMoney = vm.maxMoney;
                }
                vm.$orderSearch.Total = [];
                if (vm.maxMoney != "") {
                    var moneyArrA = [];
                    moneyArrA[0] = 'lt';
                    moneyArrA[1] = aMoney;//小于金额
                    vm.$orderSearch.Total.push(moneyArrA);
                }
                if (vm.minMoney != "") {
                    var moneyArrB = [];
                    moneyArrB[0] = 'gt';
                    moneyArrB[1] = iMoney;//大于金额
                    vm.$orderSearch.Total.push(moneyArrB);
                }
            }

            console.log(vm.maxMoney + "+" + vm.minMoney)


            console.log("++++++++++++++++++++++这是表单内容  ")
            console.log(vm.$orderSearch)

            //这里用来判断是是否重置页码

            if (newCall()) {
                vm.data[vm.now].P = 0;
                vm.data[vm.now].list = [];
                vm.getList();
            }

            //正确的判断逻辑
            function newCall() {
                var old = JSON.stringify(vm.$old_orderSearch)
                var New = JSON.stringify(vm.$orderSearch)
                console.log("old:" + old +
                    "\r\n" +
                    "New:" + New)
                if (old != New) {

                    return true
                } else {
                    return false
                }
            }


        },

        //检查金额
        checkAllMoney: function () {
            if (parseFloat(vm.allInMoney) < parseFloat(vm.endInMoney)) {
                vm.allMError1 = true;
                if (parseFloat(vm.allInMoney) == 0 && vm.endInMoney == "") {

                    vm.allMError1 = false;
                }
            } else {
                vm.allMError1 = false;
            }
            if (parseFloat(vm.allOutMoney) < parseFloat(vm.endOutMoney)) {
                vm.allMError2 = true;
                if (parseFloat(vm.allOutMoney) == 0 && vm.endOutMoney == "") {
                    vm.allMError2 = false;
                }
            } else {
                vm.allMError2 = false;
            }
            //avalon.scan();
        },
        toEndAllMoney: function () {


            /*有不同的交易方*/
            if (vm.haveOtherCus) {
                return;
            }

            //收款
            if (vm.endInMoney > 0) {
                if (vm.allMError1) {
                    //收款金额错误
                    tip.on("收款金额错误!")
                } else {
                    ws.call({
                        i: "Order/Order/settle",
                        data: {
                            TraderID: vm.nowCusId,
                            Money: vm.endInMoney,
                            IsPayable:false,//false表示收款，true表示付
                            OrderIDs: vm.$allInMoneyOrderId
                        },
                        success: function (res, err) {
                            if (err||res==false) {
                                tip.on(err)
                                return
                            }
                            vm.endInMoney = 0

                            //vm.$allInMoneyOrderId = []
                            //更新列表数据并且取消选框
                            for (var i = 0; i < res.length; i++) {

                                vm.updataOrders(res[i])
                            }
                            //更新统计
                            try {
                                quickStart.getReport()
                            } catch (err) {
                                console.log(err.message)
                            }

                            vm.computeAllMoney()
                        }
                    });
                }

            }



            //付款
            if (vm.endOutMoney > 0) {
                if (vm.allMError2) {
                    //付款
                    tip.on('付款金额错误！')
                } else {
                    ws.call({
                        i: "Order/Order/settle",
                        data: {
                            TraderID: vm.nowCusId,
                            Money: vm.endOutMoney,
                            IsPayable:false,//false表示收款，true表示付
                            OrderIDs: vm.$allOutMoneyOrderId
                        },
                        success: function (res, err) {
                            if (err||res==false) {
                                tip.on(err)
                                return
                            }
                            vm.endOutMoney = 0
                            //更新列表数据并且取消选框
                            for (var i = 0; i < res.length; i++) {

                                vm.updataOrders(res[i])
                            }
                            //更新统计
                            try {
                                quickStart.getReport()
                            } catch (err) {
                                console.log(err.message)
                            }

                            vm.computeAllMoney()
                        }
                    });
                }
            }



        },
        checkAll: function () {
            var j = vm.now;
            var k = vm.showList.length;
            if (vm.selectAll) {
                vm.selectAll = false;
                for (var i = 0; i < k; i++) {
                    vm.showList[i].checked = false;
                }
            } else {
                vm.selectAll = true;
                for (var i = 0; i < k; i++) {
                    vm.showList[i].checked = true;
                }
            }
            avalon.scan();
            vm.computeAllMoney();
        },
        checkNone: function () {
            for (var j = 0; j < 7; j++) {
                var k = vm.showList.length;
                for (var i = 0; i < k; i++) {
                    vm.showList[i].checked = false;
                }
            }
            avalon.scan();
        },
        unCheck: function () {
            vm.selectAll = false;
            vm.haveOtherCus = false;
            var k = vm.showList.length;
            for (var i = 0; i < k; i++) {
                vm.showList[i].checked = false;
            }
        },
        unCheckAll: function () {
            vm.selectAll = !vm.selectAll;
            var j = vm.now;
            var k = vm.showList.length;
            for (var i = 0; i < k; i++) {
                vm.showList[i].checked = !vm.showList[i].checked;
            }
            avalon.scan();
            vm.computeAllMoney();
        },
        changeCheck: function (i) {
            var j = vm.now;
            vm.showList[i].checked = !vm.showList[i].checked;
            avalon.scan();
            vm.computeAllMoney();
        },
        checkCus: function () {
            //选择了不同的交易方，不能进行批量结算！
            vm.haveOtherCus = false;
            var lastCus = "";
            var nowCus = "";
            var k = vm.showList.length;
            for (var i = 0; i < k; i++) {
                if (vm.showList[i].checked) {
                    lastCus = vm.showList[i].Trader.TraderID;
                    vm.nowCusId = lastCus;
                    for (var j = i + 1; j < k; j++) {
                        if (vm.showList[j].checked) {
                            nowCus = vm.showList[j].Trader.TraderID;
                            if (lastCus != nowCus) {
                                vm.haveOtherCus = true;
                                vm.showEndForm = false;
                                break;
                            }
                        }
                    }
                }

            }
        },
        computeAllMoney: function () {
            var allIn = 0;
            var allOut = 0;
            var j = vm.now;
            var k = vm.showList.length;
            vm.$allInMoneyOrderId = [];
            vm.$allOutMoneyOrderId = [];
            for (var i = 0; i < k; i++) {
                if (vm.showList[i].checked == true) {
                    if (parseFloat(vm.showList[i].Need) != 0) {

                        if (vm.showList[i].Type == 1 || vm.showList[i].Type == 2||vm.showList[i].Type==12) {  //收款
                            allIn += parseFloat(vm.showList[i].Need);
                            vm.$allInMoneyOrderId.push(vm.showList[i].OrderID);

                        } else if (vm.showList[i].Type == 0 || vm.showList[i].Type == 3) {  //付款
                            allOut += parseFloat(vm.showList[i].Need);
                            vm.$allOutMoneyOrderId.push(vm.showList[i].OrderID);
                        }

                        console.log("  " + vm.$allInMoneyOrderId)
                        console.log("  " + vm.$allOutMoneyOrderId)

                    }
                }
            }
            vm.allInMoney = allIn.toFixed(2);
            vm.allOutMoney = allOut.toFixed(2);

            /*查交易方*/
            vm.checkCus();
            if (vm.haveOtherCus) {
                return;
            }

            if (allIn == 0 && allOut == 0) {
                vm.showEndForm = false;
            } else {
                vm.showEndForm = true;
            }


            //  查结算金
            vm.checkAllMoney();

        },
        curListIndex: 0,
        lookLastGood: function () {
            var el = 0;
            console.log("-----------进入上一  ")
            if (vm.curListIndex > 0) {
                vm.curListIndex--;
                el = vm.showList[vm.curListIndex];
                vm.toInfo(el.OrderID, vm.curListIndex, el.OrderCode);
            }
        },
        lookNextGood: function () {
            var el = 0;
            console.log("-----------进入下一  ")
            if (vm.curListIndex < vm.showList.length - 1) {
                vm.curListIndex++;
                el = vm.showList[vm.curListIndex];
                vm.toInfo(el.OrderID, vm.curListIndex, el.OrderCode);
            }
        },
        lookLastB: function () {
            var el = 0;
            console.log("-----------进入上一  ")
            if (vm.curListIndex > 0) {
                vm.curListIndex--;
                el = vm.data[7].list[vm.curListIndex];
                vm.toInfo(el.OrderID, vm.curListIndex);
            }
        },
        lookNextB: function () {
            var el = 0;
            console.log("-----------进入下一  ")
            if (vm.curListIndex < vm.data[7].list.length - 1) {
                vm.curListIndex++;
                el = vm.data[7].list[vm.curListIndex];
                vm.toInfo(el.OrderID, vm.curListIndex);
            }
        },
        now: 0,
        $typeData: [
            ["in", "0,1,2,3,12"],
            ["in", "1,2,12"],
            ["in", "0,3"],
            ["in","12"],
            ["in", "2"],
            ["in", "1"],
            ["in", "0"],
            ["in", "3"],
            ["in", "4,5,6"],
            //["in","11"]
        ],//不要 3  -3

        typeName: ['采购入库', '采购退货', '销售出库', '销售退货', '报损', '盘存', '调拨', '期初应收', '期初应付','','','报价','租赁出库'],
        data: [
            {
                name: "全部交易",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "收款",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "付款",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "租赁",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "销售出库",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "采购退货",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "采购入库",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "销售退货",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 999999999999,
                maxDate: -999999999999,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            {
                name: "调拨盘点报损",
                P: 0,
                T: 0,
                L: 1,
                CusNum: 0,
                howLong: 0,
                allTotle: 0,
                allPayed: 0,
                overNum: 0,
                minDate: 0,
                maxDate: 0,
                allOrder: 0,
                workerNum: 0,
                allTallyAmounts: 0,
                CustomerList: {},
                workerList: [],
                list: []
            },
            //{
            //    name: "报价单",
            //    P: 0,
            //    T: 0,
            //    L: 1,
            //    CusNum: 0,
            //    howLong: 0,
            //    allTotle: 0,
            //    allPayed: 0,
            //    overNum: 0,
            //    minDate: 0,
            //    maxDate: 0,
            //    allOrder: 0,
            //    workerNum: 0,
            //    allTallyAmounts: 0,
            //    CustomerList: {},
            //    workerList: [],
            //    list: []
            //}
        ],
        showList: [],
        /*获取当前选择的   标签页  */
        filt: function (i) {
            //vm.resetFrom();
            //取消所有选择
            vm.unCheck();
            /* 更新 */
            if (vm.now != i && vm.needUpload) {
                setTimeout(function () {
                    //     vm.getList();
                }, 300)
                vm.needUpload = false;
            }


            vm.now = i;
            if (vm.data[i].P == 0) {
                vm.getList();
            }
            console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\我要换标签！  ")
            if (i != 7) {
                vm.showList = vm.data[i].list;
                console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\换了标签~~  " + i)
            }
        },
        $old_orderSearch: {},
        getList: function () {
            if (vm.data[vm.now].P == 0) {
                vm.data[vm.now].list = [];
            }

            //console.log("________________________我要取数据！！！！")
            vm.$orderSearch.Type = vm.$typeData[vm.now];
            if (vm.now == 8) {
                //获取调拨盘点报损
                ws.call({
                    i: "Order/Order/search",
                    data: {
                        P: ++vm.data[8].P,
                        N: 16,
                        W: vm.$orderSearch
                    },
                    success: function (res,err) {
                        if (!res.err) {
                            console.log("取数据成功~~~~~~~~~~~~~~")
                            console.log(res)
                            vm.data[8].T = parseInt(res.T);
                            vm.data[8].L = vm.data[8].T - vm.data[8].P * 16;
                            try {
                                for (var i = 0; i < res.L.length; i++) {
                                    vm.data[7].list.push(res.L[i]);
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        } else {
                            console.log(res.err);

                        }
                    }
                });


            } else {
                ws.call({
                    i: "Order/Order/search",
                    data: {
                        P: ++vm.data[vm.now].P,
                        N: 16,
                        W: vm.$orderSearch,//vm.$typeData[vm.now],//vm.$orderSearch,
                        Clear: 2 // todo 0 未结   1 已结   2
                    },
                    success: function (res,err) {
                        if (!res.err) {
                            console.log("取数据成功~~~~~~~~~~~~~~")
                            console.log(res)
                            vm.data[vm.now].T = parseInt(res.T);
                            vm.data[vm.now].L = vm.data[vm.now].T - vm.data[vm.now].P * 16;
                            try {
                                for (var i = 0; i < res.L.length; i++) {
                                    res.L[i].checked = false;
                                    //计算应结金额
                                    res.L[i].Need = (Number(res.L[i].Total) - Number(res.L[i].Payed)).toFixed(2);
                                    //查询库房
                                    //var sl=quickStart.Stores
                                    //for(var o=0;o<sl.length;o++){
                                    //    if(res.L[i].StoreID==sl[o].StoreID){
                                    //        res.L[i].StoreName=sl[o].Name
                                    //        break
                                    //    }
                                    //}
                                    vm.data[vm.now].list.push(res.L[i]);
                                }
                                vm.showList = vm.data[vm.now].list;
                                vm.count(vm.data[vm.now].list);
                            } catch (err) {
                                console.log(err);
                            }
                        } else {
                            console.log("获取数据失败  " + res.err);
                        }
                    }
                });
            }
            //保存这次的变量
            vm.$old_orderSearch = vm.$orderSearch
        },
        ready2info: function () {
            require(['../../package/order/info'], function () {
            });
        },
        changeOrder: -1,
        toInfo: function (id, index, OrderCode) {
            vm.curListIndex = index;
            if (Math.abs(OrderCode) != 3) {
                //try{
                //    modal.mustOut()
                //}
                //catch(err){}
                try {
                    pb.startT()
                } catch (err) {
                }

                require(['../../package/order/info'], function () {
                    if (!isNaN(id)) {
                        orderInfo.ready(id)
                        try {
                            pb.endT()
                        } catch (err) {
                        }

                    }
                    vm.changeOrder = index;
                })
            }
        },
        //更新列表
        updataOrders: function (order) {
            var index = vm.now;
            var len = vm.data[index].list.length;
            var list = vm.data[index].list;
            for (var k = 0; k < len; k++) {
                if (list[k].OrderID == order.OrderID) {
                    //找到更新的数  
                    list[k].Payed = Number(order.Payed);
                    list[k].Need = (Number(list[k].Total) - list[k].Payed).toFixed(2);
                    vm.count(vm.data[vm.now].list);
                    list[k].checked = false;
                    break;
                }
            }
        },
        //  部更新订单列  -----------不知道有  么用(很有用，更新全靠它l）
        needUpload: false,
        showNewPayed: function (money) {
            vm.data[vm.now].list[vm.changeOrder].Payed = (Number(vm.data[vm.now].list[vm.changeOrder].Payed) + Number(money)).toFixed(2);
            vm.data[vm.now].list[vm.changeOrder].Need = (Number(vm.data[vm.now].list[vm.changeOrder].Need) - Number(money)).toFixed(2);
            vm.count(vm.data[vm.now].list);
            //列表有更新时，标记这个   为true，表示需要重新获取，在切换筛选状态时，将执行重置并重新获取列  
            vm.needUpload = true;
        },
        /*统计*/
        count: function (list) {
            //重置
            vm.data[vm.now].CusNum = 0;
            vm.data[vm.now].howLong = 0;
            vm.data[vm.now].allTotle = 0;
            vm.data[vm.now].allPayed = 0;
            vm.data[vm.now].overNum = 0;
            vm.data[vm.now].minDate = 999999999999;
            vm.data[vm.now].maxDate = -999999999999;
            vm.data[vm.now].allOrder = 0;
            vm.data[vm.now].workerNum = 0;
            vm.data[vm.now].allTallyAmounts = 0;
            vm.data[vm.now].CustomerList = {};
            vm.data[vm.now].workerList = [];
            /* 订单    当前数组长度 */
            var index = vm.now;
            var allOrder = list.length;
            vm.data[index].allOrder = allOrder;
            for (var i = 0; i < allOrder; i++) {
                /*
                 * 单位数量  
                 * 遍历列表中的单位（obj.Customer.TraderID），如果这个单位在（vm.CustomerList）中，能找到相应的键,则标识已经有
                 * 否则则标识还没有出现过，则加入到名单中，计数器加  
                 *
                 * */
                var cusID = list[i].TraderID || -1;
                if (vm.data[index].CustomerList[cusID] != true) {
                    vm.data[index].CustomerList[cusID] = true;
                    vm.data[index].CusNum++;
                }
                /*
                 * 操作人数
                 * 与单位数量相同算  
                 * */
                var worID = list[i].OperatorUID || -1;
                if (vm.data[index].workerList[worID] != true) {
                    vm.data[index].workerList[worID] = true;
                    vm.data[index].workerNum++;
                }
                /*
                 * 跨域日期以及跨越天数
                 * 遍历日期，如果比  小   （vm.minDate）还小，则设置新的最小   为他，
                 * 如果比最大   (vm.maxDate)还大，则设置新的  大   为  
                 * 渲染的是计算  下获得跨越日期以及跨越天  
                 *
                 * */
                if (list[i].Time > vm.data[index].maxDate) {
                    vm.data[index].maxDate = list[i].Time;
                }
                if (list[i].Time < vm.data[index].minDate) {
                    vm.data[index].minDate = list[i].Time;
                }
                /*
                 * 应收  
                 *   有的应收加起  
                 * */
                vm.data[index].allTotle = Number(Number(vm.data[index].allTotle) + Number(list[i].Total)).toFixed(2);
                /*
                 * 实付  
                 *   有的累加
                 * */
                vm.data[index].allPayed = Number(Number(vm.data[index].allPayed) + Number(list[i].Payed)).toFixed(2);
                /*
                 * 结清  
                 * 累加  有的结清
                 * 结清除以总数，获得结清比
                 * */
                vm.data[index].allTallyAmounts = vm.data[index].allTallyAmounts + Number(list[i].Total);
            }
            //处理没有日期的情  
            if (vm.data[index].minDate == 999999999999) {
                vm.data[index].minDate = (new Date().getTime()) / 1000;
            }
            if (vm.data[index].maxDate == -999999999999) {
                vm.data[index].maxDate = (new Date().getTime()) / 1000;
            }
            vm.data[index].howLong = ((vm.data[index].maxDate - vm.data[index].minDate) / 60 / 60 / 24).toFixed(1);

            vm.data[index].overNum = GetPercent(vm.data[index].allPayed, vm.data[index].allTallyAmounts);

            function GetPercent(num, total) {
                num = parseFloat(num);
                total = parseFloat(total);
                if (isNaN(num) || isNaN(total)) {
                    return "-";
                }
                return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%");
            }
        }
    });
    return order = vm;
});



