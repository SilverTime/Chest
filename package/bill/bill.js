/**
 * Created by mooshroom on 2015/7/27 0027.
 *
 * 单据模块
 *  包含销售开单，销售退货，采购入库，采购退货等单据的开列功能
 */
define('bill', [
    'avalon',
    'text!../../package/bill/bill.html',
    'css!../../package/bill/bill',
    '../../lib/whatInput/whatInput'
], function (avalon, html) {
    var vm = avalon.define({
        $id: "bill",
        ready: function (n) {
            layout.url = html
            layout.rightShowing = false

            //解析参数
            var params = String(n).split('&&')

            if (params.length < 2) {
                params.push("default")
            }
            vm.state = Number(params[0])
            vm.reset();

            if (vm.state < 4) {
                setTimeout(function () {
                    try {
                        window.document.getElementById("inputCus").focus()
                    } catch (err) {
                    }
                }, 200)
            } else {
                setTimeout(function () {
                    window.document.getElementsByName("goodsInput")[0].focus()
                }, 200)
            }
            //判断是否来自备用商品列表
            if (params[1] === 'selected') {
                //获取备选商品到列表
                require(['../../package/goods/selected'], function () {
                    if (selected.$GCList.length > 0) {
                        //先重置订单

                        vm.getGoodsCarList(selected.getSelected());
                    } else {
                        tip.on("已选商品列表为空，已为您打开了一个空白的表单")
                    }
                })
            }

            //判断是否来自草稿箱
            if (params[1] == 'draft') {
                require(['../../package/bill/billDraft'], function () {
                    billDraft.loadDraft()
                })
            }

            //}
            vm.bindBillKey()
            //bindK(vm.$billKey)
            avalon.scan()



        },
        updateSugDepositTimeout:"",
        getGoodsCarList: function (ids) {
            //获得商品ID列表
            ws.call({
                i: "Goods/Goods/gets",
                data: {
                    GoodsIDs: ids,//商品编号列表
                },
                success: function (res,err) {
                    if (res.err == undefined) {
                        var All = 0;
                        var resL = res;
                        var len = res.length;
                        //if (index == 0) {
                        //    vm.List = [];
                        //} else if (index == 1) {
                        //    goodsCarList = [];
                        //}
                        vm.oldList = vm.List = []

                        for (var i = 0; i < len; i++) {
                            //计算总库存
                            var All = 0;
                            //当前库房获取逻辑,

                            if (resL[i].Store) {
                                for (var o = 0; o < resL[i].Store.length; o++) {
                                    if (resL[i].Store[o].StoreID == quickStart.nowStore.StoreID) {
                                        All = resL[i].Store[o].Amount
                                        break
                                    }
                                }
                            }

                            if (resL[i].Prices.length == 0) {
                                resL[i].Prices = [{Price: 0}, {Price: 0}]

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
                            }

                            //加载成本
                            try{
                                go.Price1=resL[i].Prices['T2'].Price
                            }catch (err){}

                            //加载销售价
                            try{
                                go.Price0=resL[i].Prices['T1'].Price
                            }catch (err){}

                            //加载上次价
                            try{
                                go.LP=resL[i].LastPrice
                            }catch (err){}


                            vm.fill(go, i)

                            //vm.List.push(resL[i]);
                            //vm.oldList.push(resL[i])
                        }
                        vm.addRow(1)
                        vm.sum()
                    }
                }
            })

        },
        fill: function (goods, index) {
            //构建一个空的
            vm.addRow(1)

            //填充数据
            var xc,
                input = bill.List[index]
            for (xc in input) {
                if (xc.charAt(0) != '$') {
                    if (goods[xc]) {
                        input[xc] = goods[xc]
                    }
                    else {
                        input[xc] = ""
                    }

                    //如果是采购，则将标价替换为成本价
                    if (xc == "Price1") {
                        if (bill.state == "pur" || bill.state == "purReturn") {
                            input.Price1 = goods.Price0
                        }
                        else if ((bill.state == "sell" || bill.state == "sellReturn") && goods.LP.Price > 0) {
                            //如果是销售，则把标价替换为上次价格
                            input.Price1 = goods.LP.Price;
                        }
                    }


                    // 记录原有数据，做更改比较所用

                    bill.oldList[index][xc] = input[xc]


                }

            }
            input['input'] = 1;


            //如果是盘存单，那么默认amount为当前库存
            if (bill.state == "B") {

                input.Amount = goods.ThisTotle
            }

            try {
                bill.priceErr(index)
                bill.amountErr(index)
            } catch (err) {
            }


        },

        //导出报价单
        exportQuotation: function () {
            //TODO 报报价价单单
        },
        $billKey: {
            "esc": function () {
                vm.close()
            },
            "ctrl+enter": function () {
                vm.haveDone(0)
            }
        },
        binding: false,
        bindBillKey: function () {
            if (!vm.binding) {
                bindK(vm.$billKey)
                vm.binding = true
            }
        },
        removeBillKey: function () {
            if (vm.binding) {
                removeK(vm.$billKey)
                vm.binding = false
            }
        },

        /******************公用方法*****************/
        state: "",
        $mo: [
            //采购入库0
            {
                Name: "",
                GoodsID: '',
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                Model: "",
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",
            },
            //采购退货1
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                AmountErr: false,
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",

            },
            //销售2
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                LP: {Price: ""},
                ThisTotle: "",
                BarCode: "",
                AmountErr: false,
                PriceErr: false,
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",

            },
            //销售退货3
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Price3: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",

            },
            //报损4
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                URL:"",

            },
            //盘存5
            {
                Name: "",
                GoodsID: '',
                Standard: '',
                Model: "",
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                URL:"",

            },
            //调拨6
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                URL:"",


            },
            //期初应收7
            {},
            //期初应付8
            {},
            //9
            {},
            //10
            {},
            //报价单11
            {
                Name: "",
                GoodsID: '',
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                ThisTotle: "",
                BarCode: "",
                Model: "",
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",
            },
            //租赁 12
            {
                Name: "",
                GoodsID: '',
                Model: "",
                Standard: '',
                UnitName: "",
                Price1: "",
                Amount: "",
                sum: "",
                Memo: "",
                Price0: "",
                os: "",
                ou: "",
                LP: {Price: ""},
                ThisTotle: "",
                BarCode: "",
                AmountErr: false,
                PriceErr: false,
                URL:"",
                MinInPrice:"",
                MaxInPrice:"",
            },

        ],
        rowModel: function () {
            //根据不同的订单传入数据模版
            var rowModel = {};
            return vm.$mo[vm.state]
        },

        //添加行
        addRow: function (n) {

            var rowModel = vm.rowModel();
            var row = {}, x;
            for (x in rowModel) {
                if (x.charAt(0) != "$") {
                    row[x] = rowModel[x]
                }
            }


            function add(n) {
                var len = n
                var l = vm.List
                for (var i = 0; i < len; i++) {
                    l.push(row)
                    vm.oldList.push(row)
                }
                vm.List = l
            }

            function addOne() {
                vm.List.push(row)
                vm.oldList.push(row)
            }

            if (n > 1) {
                // 添加多条
                add(n)
            }
            else {
                //添加一条
                addOne()
            }


        },

        //删除行
        delFocusing: -1,
        delFocus: function (i) {
            //-1为取消关注，其他wei关注到第几行
            vm.delFocusing = i
        },
        delRow: function (n, keepIt) {
            var Nu = vm.rowModel(), target = vm.List[n], targetOld = vm.oldList[n]
            for (var x in Nu) {
                target[x] = Nu[x]
                targetOld[x] = Nu[x]
            }
            vm.sum()
            if (vm.List.length > 1 && keepIt != true) {
                //这不是最后一条，执行删除整行
                vm.List.splice(n, 1)
                vm.oldList.splice(n, 1)
            }
            //delete vm.oldList[n]
            //vm.oldList.splice(n,1)
            //vm.List[n]=vm.rowModel()
            vm.delFocus(-1)
        },

        Stores: [],

        List: [],
        oldList: [],
        orderID: "（创建之后自动生成）",
        date: "",
        Store: {},
        //判断是否为最后一个，如果是，加一行
        checkLast: function (lastRow) {
            if (lastRow) {
                //是最后一个
                vm.addRow(1)
            }
        },


        customer: {
            "TraderID": "",
            'Name': '',//单位名称
//            'Receivables':,//期初应收账款
//            'Payable':,//期初应付账款
            'Address': '',//地址
            'Memo': '',//备注
            'Type': 0,//单位类型 0 客户，1：供应商
            'On': 1,//是否开启
            'Phone': '',//电话
            'LandLine': '',//座机
            'QQ': '',//qq
            'Contact': '',//'联系人'
            'Discount':100//折扣
        },
        pay: 0,//已结算金额
        Deposit:0,//支付的押金
        sugDeposit:0,//建议押金
        //计算建议押金
        sumDeposit:function () {
            vm.sugDeposit=0
            vm.List.forEach(function (el) {
                if(el.MinInPrice>0&&el.Amount>0){
                    vm.sugDeposit+=el.MinInPrice*el.Amount
                }
            })
        },
        //判断数据完整性，忽略List数组中全部为空的对象，其他的逐行检查是否有遗漏的必填项
        Memo: "",//订单备注
        Virtual: 0,
        toggleV: function () {
            vm.Virtual = Number(!vm.Virtual)
        },

        //库存警告检查函数
        amountErr: function (index) {
            if (vm.state == '3' || vm.state == '0' || vm.state == '5') {
                return
            }
            setTimeout(function () {
                var t = Number(vm.List[index].ThisTotle),
                    a = Number(vm.List[index].Amount)
                if (a != 0) {
                    if (t < a) {
                        vm.List[index].AmountErr = true

                        window['goodsNum' + index].warning('超库存')
                    } else {
                        vm.List[index].AmountErr = false
                        window['goodsNum' + index].success()
                    }
                } else {
                    vm.List[index].AmountErr = false
                    window['goodsNum' + index].success()
                }
            }, 300)


        },
        //低于成本开单警告函数
        priceErr: function (index) {
            setTimeout(function () {
                var t = Number(vm.List[index].Price0),

                    a = Number(vm.List[index].Price1)
                if (a != 0) {
                    if (t <= a) {
                        vm.List[index].PriceErr = false
                        try {
                            window['goodsPrice' + index].success()

                        } catch (err) {
                        }
                    } else {
                        try {
                            window['goodsPrice' + index].warning('低于成本')

                        } catch (err) {
                        }
                        vm.List[index].PriceErr = true

                    }
                } else {
                    try {
                        window['goodsPrice' + index].success()
                    } catch (err) {
                    }
                    vm.List[index].PriceErr = false


                }
            }, 300)
        },

        haveDone: function () {
            /*检查项目
             * 1. 客户名称（默认为散客）
             * 2. 商品名称
             * 3. 单价
             * 4. 数量（默认为1）
             *
             * 修改项目：
             * 1. 如果商品名称存在，ID不存在：说明是用户输入的新的，调用添加商品
             * 2. ID存在，其他字段与原有数据有区别，调用修改商品
             *
             * return
             * */

//清空空行


            //检查客户
            function customer() {
                //检查vm.customer

                //1. 检查完整性
                if (vm.customer.Name != "") {

                    //2. 检查客户ID是否存在
                    if (vm.customer.TraderID != "") {

                        //3. 检查客户信息是否被修改
                        var befor = vm.oldCus,
                            after = vm.customer,
                            r2s = {},
                            x;
                        for (x in after) {
                            if (after[x] != befor[x]) {
                                //资料被修改了
                                r2s[x] = after[x]

                            }
                        }
                        if (r2s = {}) {
                            //通过检验
                            return true
                        } else {
                            billCus.info("正在修改原有客户供应商的信息")
                            //r2s.TraderID = vm.customer.TraderID
                            befor = after
                            ws.call({
                                i: "Trader/Trader/save",
                                data: {
                                    TraderID: vm.customer.TraderID,
                                    Params: r2s
                                },
                                success: function (res, err) {
                                    if (err||res==false) {
                                        tip.on(err)
                                        return
                                    }

                                    vm.haveDone()
                                    billCus.success()


                                }

                            })
                        }


                    }
                    else {
                        billCus.info("正在保存新的客户")
                        var data = {
                            Name: vm.customer.Name,
                            'Address': vm.customer.Address,//地址
                            'Phone': vm.customer.Phone,//电话
                            //'Type': vm.customer.Type//单位类型 0 客户，1：供应商
                        }

                        if (vm.customer.Type == 0) {
                            data.IsCue = 1
                            data.IsSur = 0
                        }
                        else if (vm.customer.Type == 1) {
                            data.IsCue = 0
                            data.IsSur = 1
                        }
                        ws.call({
                            i: "Trader/Trader/add",
                            data: data,
                            success: function (res, err) {
                                if (err||res==false) {
                                    tip.on(err)
                                    return
                                }
                                vm.customer.TraderID = res.TraderID
                                billCus.success()
                                vm.haveDone()
                            }

                        })
                    }
                }
                else {
                    billCus.error('还没有选择（或输入）客户')
                }
            }


            //检查商品重复与否
            function noRepeat() {
                var L = {};//用于检测de对象
                var res = true;
                for (var i = 0; i < vm.List.length; i++) {
                    if (vm.List[i].GoodsID == "") {
                        continue
                    }
                    if (L[vm.List[i].GoodsID] == undefined) {
                        //非重复项
                        L[vm.List[i].GoodsID] = true
                    }
                    else {
                        window['goodsName' + i].error('商品重复')
                        res = false
                    }
                }

                L = undefined
                return res

            }

            //检查商品
            function goods() {
                //循环每一行的商品，
                var leng = vm.List.length;
                if (leng > 0) {
                    for (var i = 0; i < leng; i++) {
                        //检查商品名称是否存在
                        if (vm.List[i].Name != "") {
                            //通过
                            // 检查商品ID是否存在
                            if (vm.List[i].GoodsID != "") {
                                //检查商品名称是否与原来的不一致
                                if (vm.List[i].Name == vm.oldList[i].Name) {
                                    //检查规格和点位是否被修改
                                    if (
                                        vm.List[i].Standard == vm.oldList[i].Standard &&
                                        vm.List[i].UnitName == vm.oldList[i].UnitName &&
                                        vm.List[i].Model == vm.oldList[i].Model &&
                                        vm.List[i].BarCode == vm.oldList[i].BarCode
                                    ) {
                                        //检查价格
                                        if (vm.List[i].Price1 >= 0) {
                                            //如果是盘存则不检查数量
                                            var checkNum = true
                                            if (vm.state == "5") {
                                                checkNum = false
                                            }
                                            //检查数量
                                            if (vm.List[i].Amount > 0 || !checkNum) {
                                                if (i == leng - 1) {
                                                    //返回正确的标识
                                                    return true
                                                }
                                            } else {
                                                //数量错误
                                                window['goodsNum' + i].error("不能小于0")
                                            }

                                        }
                                        else {
                                            //价格错误
                                            window['goodsPrice' + i].error("不能小于0")

                                            break
                                        }

                                    }
                                    else {
                                        //修改商品
                                        vm.oldList[i] = vm.List[i]
                                        ws.call({
                                            i: "Goods/Goods/save",
                                            data: {
                                                GoodsID: vm.List[i].GoodsID,
                                                Params: {
                                                    Model:vm.List[i].Model,
                                                    BarCode:vm.List[i].BarCode,
                                                    Standard: vm.List[i].Standard,
                                                    UnitName: vm.List[i].UnitName,
                                                },

                                            },
                                            success: function (res, err) {
                                                if (err||res==false) {
                                                    tip.on(err)
                                                    return

                                                }
                                                //保存成功

                                                vm.haveDone()
                                                window['goodsName' + i].info('商品信息已更新！')
                                                console.log(res)

                                            }
                                        })
                                    }
                                }
                                else {
                                    //商品名称错误
                                    window['goodsName' + i].error('正确的名字：【' + vm.oldList[i].Name + '】')

                                    break
                                }
                            }
                            else {

                                //如果是销售单则价格为标价
                                //如果是采购单则价格为成本
                                var type,

                                    st = vm.state;
                                if (st == "2" || st == "3") {
                                    //销售单
                                    type = 2

                                }
                                else {
                                    //采购单
                                    type = 1
                                }
                                //添加商品
                                ws.call({
                                    i: "Goods/Goods/add",
                                    data: {
                                        Model:vm.List[i].Model,
                                        BarCode:vm.List[i].BarCode,
                                        Name: vm.List[i].Name,
                                        Standard: vm.List[i].Standard,
                                        UnitName: vm.List[i].UnitName,
                                        Prices: [{
                                            Price: vm.List[i].Price1,
                                            TypeID: type//1是成本价，2是标价
                                        }]
                                    },
                                    success: function (res, err) {
                                        if (err||res==false) {
                                            window['goodsName' + i].error('添加新商品出错！')
                                            return
                                        }
                                        //保存成功,修改价格
                                        window['goodsName' + i].info('已添加到商品库中！')
                                        if (res.GoodsID) {
                                            vm.List[i].GoodsID = res.GoodsID
                                            vm.oldList[i] = {
                                                Model:vm.List[i].Model,
                                                BarCode:vm.List[i].BarCode,
                                                Name: vm.List[i].Name,
                                                Standard: vm.List[i].Standard,
                                                UnitName: vm.List[i].UnitName,
                                            }

                                            vm.haveDone()


                                        }
                                    }
                                })

                                //tip.on("请选择商品库中的商品")
                                break
                            }
                        }
                        else {
                            //商品名称缺失
                            //tip.on("请输入商品名称")
                            window['goodsName' + i].error("请输入商品名称")

                            //document.getElementById('goodsName').setAttribute("placeholder","请输入商品名称");
                            //setTimeout(function(){
                            //    document.getElementById('goodsName').setAttribute("placeholder","搜索商品");
                            //},5000)
                            break
                        }
                    }
                }
                else {
                    //没有选择商品
                    //tip.on("没有选择商品！")

                    //document.getElementById('goodsName').setAttribute("placeholder","没有选择商品");
                    //setTimeout(function(){
                    //    document.getElementById('goodsName').setAttribute("placeholder","搜索商品");
                    //},5000)
                    vm.addRow(1)

                    setTimeout(function () {
                        window['goodsName' + 0].error("没有选择商品！")
                    }, 500)

                }


            }


            //检查已付款
            function pay() {
                vm.pay = vm.pay == "" ? 0 : vm.pay
                if (vm.pay >= 0 && vm.pay <= vm.Total) {
                    return true
                } else {
                    billPay.error("付款金额超出总金额!!")
                    return false
                }

                //todo 可能要检查押金的大小
            }



            //检查备注长度
            function memoLength(memo) {
                if (memo.length <= 100) {
                    return true
                }
                else {
                    tip.on("备注不能大于100个字符")
                    return false
                }
            }

//清除空行
            function delNull() {
                var d
                for (var i = 0; i < vm.List.length - 1; i++) {

                    //去空白
                    if (vm.List[i].Amount == "" || vm.List[i].Amount == 0) {
                        d = confirm("是否清空没有填写数量的商品？")
                        if (d) {
                            vm.List.splice(i, 1);
                            vm.oldList.splice(i, 1)
                            i--
                        }
                        else {


                            return false

                        }
                    }
                }

                return d
            }

            //打包生成商品字段
            function packGoods(oc) {
                //构建商品列表
                var Goods = [];
                var g = [];
                for (var i = 0; i < vm.List.length; i++) {
                    var go = vm.List[i]
                    if (oc < 4||oc==11) {
                        g = [
                            go.GoodsID,
                            go.Amount,
                            go.Memo,
                            go.Price1
                        ]


                    }
                    else if(oc==12){
                        g = [
                            go.GoodsID,
                            go.Amount,
                            go.Memo,
                            go.Price1*vm.customer.Discount/100
                        ]
                    }
                    else {
                        g = [
                            go.GoodsID,
                            go.Amount,
                            go.Memo,
                            //go.Price1
                        ]
                    }

                    Goods.push(g)

                }
                return Goods
            }

            //提交账单
            function push(oc) {



                //构建其他信息
                var data

                if (oc < 4||oc==11||oc==12) {
                    data = {
                        TraderID: vm.customer.TraderID,
                        Total: vm.Total,//总金额
                        Payed: vm.pay,//已支付金额
                        Type: oc,//订单代码
                        StoreID: vm.Store.StoreID,//库房编号
                        //OperatorUID: cache.go('uid'),//操作员编号
                        Memo: vm.Memo,//订单备注
                        Goods: packGoods(oc),
                        Virtual: vm.Virtual//是否虚构订单
                    }

                    if(oc==12){
                        data.Deposit=vm.Deposit
                    }
                } else {
                    data = {
                        Type: oc,//订单代码

                        //OperatorUID: cache.go('uid'),//操作员编号
                        Memo: vm.Memo,//订单备注
                        Goods: packGoods(oc),
                        Virtual: vm.Virtual//是否虚构订单
                    }

                    if (oc == 6) {
                        if (vm.ToStoreID == "") {
                            billIStoreID.error('还没有选择库房！')
                            return
                        }
                        if (vm.OStoreID == "") {
                            billOStoreID.error('还没有选择库房！')
                            return
                        }
                        data.IStoreID = vm.ToStoreID
                        data.OStoreID = vm.OStoreID
                    } else {
                        data.StoreID = vm.Store.StoreID//库房编号
                    }
                }

                //报价单开单
                if(oc==11){
                    ws.call({
                        i:"Order/Quotation/add",
                        data:data,
                        success: function (res,err) {
                            over()
                            if (err||res==false) {
                                tip.on(err)
                                return
                            }
                            vm.reset()
                            tip.on("开单成功", 1, 3000)

                            //跳转详情
                            require(['../../package/order/info'], function () {
                                if (!isNaN(res.OrderID)) {
                                    orderInfo.ready(res.OrderID)
                                    try {
                                        pb.endT()
                                    } catch (err) {
                                    }

                                }
                            })

                        }
                    })

                    return
                }
                //租赁单开单
                if(oc==12){
                    ws.call({
                        i:"Order/Rent/out",
                        data:data,
                        success: function (res,err) {
                            over()
                            if (err||res==false) {
                                tip.on(err)
                                return
                            }
                            vm.reset()
                            tip.on("开单成功", 1, 3000)

                            //跳转详情
                            require(['../../package/order/info'], function () {
                                if (!isNaN(res.OrderID)) {
                                    orderInfo.ready(res.OrderID)
                                    try {
                                        pb.endT()
                                    } catch (err) {
                                    }

                                }
                            })

                        }
                    })

                    return
                    return
                }


                ws.call({
                    i: "Order/Order/add",
                    data: data,
                    success: function (res, err) {
                        over()
                        if (err||res==false) {
                            tip.on(err)
                            return
                        }
                        vm.reset()
                        //quickStart.getReport()
                        tip.on("开单成功", 1, 3000)
                        //跳转详情
                        require(['../../package/order/info'], function () {
                            if (!isNaN(res.OrderID)) {
                                orderInfo.ready(res.OrderID)
                                try {
                                    pb.endT()
                                } catch (err) {
                                }

                            }
                        })

                        // 新订单插入列表  res.OrderID
                        try {
                            /*将新添加的列表插入表中*/
                            var type = res.Type
                            var putList = {}
                            var upShowList = false

                            //todo 找出要更新的列表
                            ForEach(order.$typeData, function (el, index) {
                                var types = el[1].split(',')
                                ForEach(types, function (al) {
                                    if (al == type) {
                                        putList[index] = true

                                        if (order.now == index) {
                                            upShowList = true
                                        }
                                    }
                                })
                            })

                            //批量插入
                            ForEach(putList, function (val, key) {
                                if (val) {
                                    order.data[key].list.unshift(res)
                                }
                            })

                            if (upShowList) {

                                order.showList.unshift(res)
                            }


                            quickStart.getReport()
                        } catch (err) {
                            console.log(err)
                        }


                    }
                })
            }


            //开始请求的状态函数

            function calling() {
                vm.showBtn = false
                return setTimeout(function () {
                    vm.showBtn = true
                }, 16000)
            }

            //结束的状态函数
            function over() {
                clearTimeout(tooLate)
                vm.showBtn = true
            }


            /*执行逻辑*/
            //清除空行
            for (var k = 0; k < vm.List.length; k++) {
                if (vm.List[k].Amount == "" && vm.List[k].Name == "" && vm.List[k].GoodsID == "" && vm.List[k].Price1 == "") {
                    vm.List.splice(k, 1)
                    vm.oldList.splice(k, 1)
                    k--
                }
            }
            //开始验证
            if (memoLength(vm.Memo)) {
                if (goods() && noRepeat()) {
                    var tooLate = calling()

                    var type

                    /*
                     订单type

                     0	采购入库
                     1	采购退货
                     2	销售出库
                     3	销售退货
                     4	报损
                     5	盘存
                     6	调拨
                     7	期初应收
                     8	期初应付
                     */
                    if (vm.state < 4) {
                        if (customer() && pay()) {
                            push(vm.state)
                        } else {
                            over()
                        }
                    } else {
                        push(vm.state)
                    }


                }
            }


        },
        FromStoreID: '',
        ToStoreID: '',
        BStoreID: '',//报损单的库房


        showBtn: true,

        //商品查询结果
        searching: -1,//-2为客户搜索用的，其他大于0的是商品用的
        goods: [],
        goodsKsy: "",
        goLastKey: "",
        focusGoods: -1,
        onGoods: -1,
        focusIndex: '',

        inputNumIndex: -1,
        lastInputValue: '',
        getIndex: function (index) {
            vm.inputNumIndex = index;
        },
        oneUnit: 1,
        autoNextLine: function () {
            /*下键选择下一行*/
            var no = vm.inputNumIndex;
            var next = no + 1;
            var pInputArr = document.getElementsByClassName("priceInput")
            var $inputArr = document.getElementsByClassName("billInput");
            var $input2Arr = document.getElementsByClassName("bill2Input");
            //判断是否为对外销售或采购类型的订单
            function billOrder() {

                if (vm.state < 4 || vm.state == "quotation") {
                    return true
                } else {
                    return false
                }
            }

            //如果单价是空的，那么久跳单价输入框
            if (vm.List[vm.inputNumIndex].Price1 == "" && billOrder()) {

                $inputArr[no].blur();
                pInputArr[no].focus()
            }
            //否则跳转下一行的
            else if (next < vm.List.length) {
                if (vm.List[next].Name != undefined && vm.List[next].Name == '') {
                    //vm.inputNumIndex ++;
                    if (billOrder()) {

                        $inputArr[no].blur();
                        $inputArr[next].focus();

                    }

                    if (vm.state >= 4) {

                        $input2Arr[no].blur();

                        $input2Arr[next].focus();
                    }
                }
            }
            //如果行数不够先添加一行再来
            else {
                vm.addRow(1)
                setTimeout(vm.autoNextLine, 80)

            }


        },
        $goodsHotKey: {
            "up": function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                if (vm.List[no].Name == '' || !vm.wantSearch) {
                    var $inputArr = document.getElementsByClassName("billInput");
                    if (no != 0) {
                        vm.inputNumIndex--;
                        $inputArr[no].blur();
                        $inputArr[--no].focus();
                        vm.goodFocus(no);
                    }
                    return;
                }
                /*选择搜索结果表的数据*/
                if (vm.focusGoods > 0) {
                    vm.focusGoods--
                }
                else {
                    vm.focusGoods = vm.goods.length - 1
                }
            },
            "down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                if (vm.List[no].Name == '' || !vm.wantSearch) {
                    var $inputArr = document.getElementsByClassName("billInput");
                    vm.inputNumIndex++;
                    $inputArr[no].blur();
                    $inputArr[++no].focus();
                    vm.goodFocus(no);
                    if (no == vm.List.length - 1) {
                        //添加一行
                        vm.addRow(1);
                    }
                    return;
                }
                /*选择搜索结果表的数据*/
                if (vm.focusGoods < vm.goods.length - 1) {
                    vm.focusGoods++
                }
                else {
                    vm.focusGoods = 0
                }
            },
            'left': function () {
                /*搜索结果表向左翻页*/
                if (vm.GP > 1) {
                    vm.pagerGoods(1)
                }
            },
            "right": function () {
                /*搜索结果表向右翻页*/
                if (vm.GP < (Math.ceil(vm.GT / vm.GN)))
                    vm.pagerGoods(-1)
            },
            'ctrl+up': function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("billInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    $inputArr[no].blur();
                    $inputArr[--no].focus();
                    vm.goodFocus(no);
                }
            },
            'ctrl+down': function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("billInput");
                vm.inputNumIndex++;
                $inputArr[no].blur();
                $inputArr[++no].focus();
                vm.goodFocus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+left': function () {
                /*左键移到上一行价格*/
                var no = vm.inputNumIndex;
                var $priceInputArr = document.getElementsByClassName("priceInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    no--;
                    $priceInputArr[no].focus(no);
                }
            },
            "ctrl+right": function () {
                var no = vm.inputNumIndex;
                var $numInputArr = document.getElementsByClassName("numInput");
                $numInputArr[no].focus(no);
            },
            'enter': function () {
                if (vm.focusGoods != -1) {
                    vm.jump2Goods(vm.focusGoods)
                    vm.addRow(1)
                }
            }
        },
        goodFocus: function (i) {
            vm.searching = i;
            vm.inputNumIndex = i;
            if (i >= 0) {
                /*存储当前文本框的值*/
                vm.lastInputValue = vm.List[i].Name;

                vm.focusIndex = i
                //removeK(vm.$cusHotKey)
                //聚焦的是商品,绑定关于商品搜索的快捷键
                bindK(vm.$goodsHotKey)

            }
            /* else if (i == -2) {
             //     vm.cusInputIndex = i;
             //removeK(vm.$goodsHotKey)
             //聚焦的是客户,绑定关于客户搜索的快捷键
             bindK(vm.$cusHotKey)
             }*/
        },
        goodBlur: function () {
            //todo 快捷键解绑定
            removeK(vm.$goodsHotKey)
            /*  removeK(vm.$cusHotKey)*/
            vm.searching = -1

            setTimeout(function () {
                vm.goods = []
                vm.customers = []
            }, 400)

        },
        cusFocus: function (i) {
            vm.searching = i;
            if (i == -2) {
                //     vm.cusInputIndex = i;
                //removeK(vm.$goodsHotKey)
                //聚焦的是客户,绑定关于客户搜索的快捷键
                bindK(vm.$cusHotKey)
            }
        },
        cusBlur: function () {
            removeK(vm.$cusHotKey)
            vm.searching = -1

            setTimeout(function () {
                vm.goods = []
                vm.customers = []
            }, 400)

        },
        /* $unitHotKey:{
         "up": function () {
         /!*上键选择上一行*!/
         var no = vm.inputNumIndex;
         var $unitArr = document.getElementsByClassName("unitInput");
         if(no != 0){
         $unitArr[--no].focus();
         vm.inputNumIndex --;
         }
         },
         "down": function () {
         /!*下键选择下一行*!/
         var no = vm.inputNumIndex;
         var $unitArr = document.getElementsByClassName("unitInput");
         vm.inputNumIndex ++;
         $unitArr[++no].focus();
         if(no == vm.List.length -1){
         //添加一行
         vm.addRow(1);
         }
         },
         'left': function () {
         console.log("____左键");
         var no = vm.inputNumIndex;
         var $inputArr = document.getElementsByClassName("billInput");
         $inputArr[no].focus();
         },
         "right": function () {
         console.log("++____右键");
         var no = vm.inputNumIndex;
         var $numInputArr = document.getElementsByClassName("numInput");
         $numInputArr[no].focus();
         },
         'ctrl+up': function () {
         console.log("++____addi");
         var no = vm.inputNumIndex;
         var value = Number(vm.List[no].Unit);
         vm.List[no].Unit = (++ value).toFixed(2);
         },
         "ctrl+down": function () {
         console.log("++数量的____sub");
         var no = vm.inputNumIndex;
         var value = Number(vm.List[no].Unit);
         if(value != 0){
         vm.List[no].Unit = (-- value).toFixed(2);
         }
         }
         },
         unitFocus: function (i) {
         vm.inputNumIndex = i;
         //绑定关于商品数量的快捷键
         bindK(vm.$unitHotKey)
         },
         unitBlur: function () {
         removeK(vm.$unitHotKey)
         },*/
        $numHotKey: {
            "up": function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("numInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    no--;
                    $numArr[no].focus(no);
                }
            },
            "down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("numInput");
                vm.inputNumIndex++;
                no++;
                $numArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+left': function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("billInput");
                $inputArr[no].focus();
                vm.goodFocus(no);
            },
            "ctrl+right": function () {
                var no = vm.inputNumIndex;
                var $priceInputArr = document.getElementsByClassName("priceInput");
                $priceInputArr[no].focus(no);
            },
            'ctrl+up': function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("numInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    no--;
                    $numArr[no].focus(no);
                }
            },
            "ctrl+down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("numInput");
                vm.inputNumIndex++;
                no++;
                $numArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            "addi": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Amount;
                if (value == '') {
                    value = 0;
                    vm.List[no].Amount = 0.00;
                }
                value = Number(value);
                vm.List[no].Amount = (value + vm.oneUnit).toFixed(2);
            },
            "sub": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Amount;
                if (value == '') {
                    value = 0;
                    vm.List[no].Amount = 0.00;
                }
                value = Number(value);
                if (value > 0) {
                    value = (value - vm.oneUnit).toFixed(2);
                    if (value < 0) {
                        value = (0).toFixed(2);
                    }
                    vm.List[no].Amount = value;
                }
            }
        },
        numFocus: function (i) {
            vm.inputNumIndex = i;
            //绑定关于商品数量的快捷键
            bindK(vm.$numHotKey)
        },
        numBlur: function () {
            removeK(vm.$numHotKey)
        },
        $goods2HotKey: {
            "up": function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                if (vm.List[no].Name == '' || !vm.wantSearch) {
                    var $inputArr = document.getElementsByClassName("bill2Input");
                    if (no > 0) {
                        vm.inputNumIndex--;
                        $inputArr[no].blur();
                        $inputArr[--no].focus();
                        vm.good2Focus(no);
                    }
                    return;
                }
                /*选择搜索结果表的数据*/
                if (vm.focusGoods > 0) {
                    vm.focusGoods--
                }
                else {
                    vm.focusGoods = vm.goods.length - 1
                }
            },
            "down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                if (vm.List[no].Name == '' || !vm.wantSearch) {
                    var $inputArr = document.getElementsByClassName("bill2Input");
                    vm.inputNumIndex++;
                    $inputArr[no].blur();
                    $inputArr[++no].focus();
                    vm.good2Focus(no);
                    if (no == vm.List.length - 1) {
                        //添加一行
                        vm.addRow(1);
                    }
                    return;
                }
                /*选择搜索结果表的数据*/
                if (vm.focusGoods < vm.goods.length - 1) {
                    vm.focusGoods++
                }
                else {
                    vm.focusGoods = 0
                }
            },
            'left': function () {
                /*搜索结果表向左翻页*/
                if (vm.GP > 1) {
                    vm.pagerGoods(1)
                }
            },
            "right": function () {
                /*搜索结果表向右翻页*/
                if (vm.GP < (Math.ceil(vm.GT / vm.GN)))
                    vm.pagerGoods(-1)
            },
            'ctrl+up': function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("bill2Input");
                if (no > 0) {
                    vm.inputNumIndex--;
                    $inputArr[no].blur();
                    $inputArr[--no].focus();
                    vm.good2Focus(no);
                }
            },
            'ctrl+down': function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("bill2Input");
                vm.inputNumIndex++;
                $inputArr[no].blur();
                $inputArr[++no].focus();
                vm.good2Focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+left': function () {
                /*左键移到上一行价格*/
                var no = vm.inputNumIndex;
                var $numInputArr = document.getElementsByClassName("num2Input");
                if (no > 0) {
                    vm.inputNumIndex--;
                    no--;
                    $numInputArr[no].focus(no);
                }
            },
            "ctrl+right": function () {
                var no = vm.inputNumIndex;
                var $numInputArr = document.getElementsByClassName("num2Input");
                $numInputArr[no].focus(no);
            },
            'enter': function () {
                if (vm.focusGoods != -1) {
                    vm.jump2Goods(vm.focusGoods)
                }
            }
        },
        good2Focus: function (i) {
            console.log("----------- good2Focus -----------");
            vm.searching = i;
            vm.inputNumIndex = i;
            if (i == vm.List.length - 1) {
                //添加一行
                vm.addRow(1);
            }
            if (i >= 0) {
                vm.lastInputValue = vm.List[i].Name;
                vm.focusIndex = i
                bindK(vm.$goods2HotKey)
            } else if (i == -2) {
                bindK(vm.$cusHotKey)
            }
        },
        good2Blur: function () {
            removeK(vm.$goods2HotKey)
            removeK(vm.$cusHotKey)
            vm.searching = -1;
            setTimeout(function () {
                vm.goods = []
                vm.customers = []
            }, 400)

        },
        $num2HotKey: {
            "up": function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("num2Input");
                if (no > 0) {
                    vm.inputNumIndex--;
                    no--;
                    $numArr[no].focus(no);
                }
            },
            "down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("num2Input");
                vm.inputNumIndex++;
                no++;
                $numArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+left': function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("bill2Input");
                $inputArr[no].focus();
                vm.good2Focus(no);
            },
            "ctrl+right": function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("bill2Input");
                vm.inputNumIndex++;
                no++;
                $inputArr[no].focus();
                vm.good2Focus(no);
            },
            'ctrl+up': function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("num2Input");
                if (no > 0) {
                    vm.inputNumIndex--;
                    no--;
                    $numArr[no].focus(no);
                }
            },
            "ctrl+down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $numArr = document.getElementsByClassName("num2Input");
                vm.inputNumIndex++;
                no++;
                $numArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            "addi": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Amount;
                if (value == '') {
                    value = 0;
                    vm.List[no].Amount = 0.00;
                }
                value = Number(value);
                vm.List[no].Amount = (value + vm.oneUnit).toFixed(2);
            },
            "sub": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Amount;
                if (value == '') {
                    value = 0;
                    vm.List[no].Amount = 0.00;
                }
                value = Number(value);
                if (value > 0) {
                    value = (value - vm.oneUnit).toFixed(2);
                    if (value < 0) {
                        value = (0).toFixed(2);
                    }
                    vm.List[no].Amount = value;
                }
            }
        },
        numBlind2: function (i) {
            vm.inputNumIndex = i;
            //绑定关于商品数量的快捷键
            bindK(vm.$num2HotKey)
        },
        offNumBlind2: function () {
            removeK(vm.$num2HotKey)
        },
        $priceHotKey: {
            "up": function () {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $priceArr = document.getElementsByClassName("priceInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    no--;
                    $priceArr[no].focus(no);
                }
            },
            "down": function () {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $priceArr = document.getElementsByClassName("priceInput");
                vm.inputNumIndex++;
                no++;
                $priceArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+left': function () {
                var no = vm.inputNumIndex;
                var $numInputArr = document.getElementsByClassName("numInput");
                $numInputArr[no].focus(no);
            },
            'ctrl+right': function () {
                var no = vm.inputNumIndex;
                var $inputArr = document.getElementsByClassName("billInput");
                vm.inputNumIndex++;
                no++;
                $inputArr[no].focus();
                vm.goodFocus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            'ctrl+up': function (evt) {
                /*上键选择上一行*/
                var no = vm.inputNumIndex;
                var $priceArr = document.getElementsByClassName("priceInput");
                if (no != 0) {
                    vm.inputNumIndex--;
                    no--;
                    $priceArr[no].focus(no);
                }
            },
            "ctrl+down": function (evt) {
                /*下键选择下一行*/
                var no = vm.inputNumIndex;
                var $priceArr = document.getElementsByClassName("priceInput");
                vm.inputNumIndex++;
                no++;
                $priceArr[no].focus(no);
                if (no == vm.List.length - 1) {
                    //添加一行
                    vm.addRow(1);
                }
            },
            "addi": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Price1;
                if (value == '') {
                    value = 0;
                    vm.List[no].Price1 = 0.00;
                }
                value = Number(value);
                vm.List[no].Price1 = (value + vm.oneUnit).toFixed(2);
            },
            "sub": function (e) {
                var no = vm.inputNumIndex;
                var value = "" + vm.List[no].Price1;
                if (value == '') {
                    value = 0;
                    vm.List[no].Price1 = 0.00;
                }
                value = Number(value);
                if (value > 0) {
                    value = (value - vm.oneUnit).toFixed(2);
                    if (value < 0) {
                        value = (0).toFixed(2);
                    }
                    vm.List[no].Price1 = value;
                }
            }
        },
        priceFocus: function (i) {
            vm.inputNumIndex = i;
            //绑定关于商品数量的快捷键
            bindK(vm.$priceHotKey)
        },
        priceBlur: function () {
            removeK(vm.$priceHotKey)
        },
        goHover: function (index) {
            vm.onGoods = index
        },
        goOut: function () {
            vm.onGoods = -1
        },
        GP: 1,
        GT: 0,
        GN: 8,
        goodsToggle: false,
        /*searchGoodTimeOut:'',*/
        /*为判断条码创造的变量*/
        goodsWaiting: false,
        lastTime: 0,      //上次改变时间
        timeArr: [],     //每两次改变的时间差
        searchTimeOut: 0,
        thatIsTM: false,       //是否为条形码
        wantSearch: false,
        searchGoods: function (key, index) {
            console.log("++++++ searchGoods ++++++")

            //如果删除成空的了，那么删除这个框里面的数据
            if (key == "") {/*&& key != vm.goListKey*/
                vm.delRow(vm.searching, true)
                vm.goLastKey = ""
                return
            }
            /*****获得时间差*****/
            if (vm.lastTime > 0) {
                var tempD = new Date();
                vm.timeArr.push(tempD - vm.lastTime);
            }
            vm.lastTime = new Date();
            if (vm.searchTimeOut != 0) {
                clearTimeout(vm.searchTimeOut);
            }

            //todo 条码机判断算法出错，
            vm.searchTimeOut = setTimeout(function () {
                /*****算平均值********/
                var sum = 0;
                for (var i = 0; i < vm.timeArr.length; i++) {
                    sum += vm.timeArr[i];
                }
                var avg = sum / vm.timeArr.length;

                if (avg < 10 && key.length > 7) {
                    vm.thatIsTM = true;
                } else {
                    vm.thatIsTM = false;
                }
                /*****重置*****/
                vm.goodsKey = '';
                vm.lastTime = 0;      //上次改变时间
                vm.timeArr = [];     //每两次改变的时间差
                vm.searchTimeOut = 0;

                /*****原来的搜索逻辑*****/
                if (key != "") {
                    if (!vm.thatIsTM && key == vm.goLastKey) {
                        return;
                    }

                    //var tempValue = vm.List[vm.inputNumIndex].Name;
                    //if(tempValue == vm.lastInputValue){
                    //    return;
                    //}
                    vm.wantSearch = true;


                    //触发请求
                    vm.goodsKey = vm.goLastKey = key
                    vm.GP = 1
                    listen(function () {
                        vm.callGoods(key, index);
                    });
                }

                /**********************/
            }, 25);
        },
        pagerGoods: function (n) {
            var newGP = vm.GP + -n;
            if (newGP >= 1) {
                vm.GP = newGP
            }
            else {
                vm.GP = 1
            }

            listen(function () {
                vm.callGoods(vm.goodsKey)
            })

        },
        //正是召唤商品列表
        callGoods: function (key, index) {
            vm.goodsWaiting = true
            if (vm.GP <= 0) {
                vm.GP = 1
            }
            ws.call({
                i: "Goods/search",
                data: {
                    keyword: key,
                    P: vm.GP,
                    N: vm.GN,
                    TraderID: vm.customer.TraderID ? vm.customer.TraderID : false
                },
                success: function (res,err) {
                    if (vm.GP == res.P) {
                        if (res.L.length && vm.goodsKey != '') {

                            vm.GP = res.P

                            var list = []
                            var resL = res.L
                            var len = resL.length
                            var All = 0;
                            vm.goods = []
                            for (var i = 0; i < len; i++) {
                                //计算总库存
                                All = 0
                                //当前库房获取逻辑,

                                if (resL[i].Store) {
                                    for (var o = 0; o < resL[i].Store.length; o++) {
                                        if (resL[i].Store[o].StoreID == vm.Store.StoreID) {
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
                                    Standard: resL[i].Standard,
                                    UnitName: resL[i].UnitName,
                                    os: resL[i].Standard,
                                    ou: resL[i].UnitName,
                                    LP: resL[i].LP,
                                    BarCode: resL[i].BarCode,
                                }
                                vm.goods.push(go)


                            }

                            //vm.goods = list;

                            /***判断是否为条形码***/
                            if (res.L.length == 1) {
                                if (vm.thatIsTM) {
                                    vm.thatIsTM = false;       //是否为条形码
                                    vm.goodsToggle = false;
                                    /*检查表单中是否已存在此商品，存在则数量加一*/
                                    for (var echG = 0; echG < vm.List.length; echG++) {
                                        if (vm.List[echG].GoodsID == res.L[0].GoodsID) {
                                            vm.List[echG].Amount++;
                                            /*重新计合*/
                                            vm.sum();
                                            /*检查是否超出库存*/
                                            vm.amountErr(echG);
                                            /*初始化*/
                                            vm.goodsKey = "";
                                            vm.goods = [];
                                            vm.GP = 1;
                                            vm.GT = 0;
                                            /****这里要清空输入框*****/
                                            vm.List[index].Name = '';
                                            return;
                                        }
                                    }
                                    vm.jump2Goods(0);
                                    /*检查是否超出库存*/
                                    return;
                                }
                            }
                            vm.GT = res.T;
                        } else {
                            vm.goods = []
                            //vm.GP--
                            vm.GT = res.T;
                        }
                        vm.goodsWaiting = false
                    }
                    vm.goodsToggle = true;

                }
            })
        },

        //选中商品
        selectGoods: function (index) {
            vm.focusGoods = index
        },

        //跳转商品详情
        //jump2Goods: function (index) {
        //
        //},


        //客户查询插入
        //客户搜索
        //    cusInputIndex:0,
        $cusHotKey: {
            "up": function () {
                /* var cusArr = document.getElementsByClassName("tGoodInput");
                 if(vm.cusInputIndex > 0){
                 var no = --vm.cusInputIndex;
                 cusArr[no].focus(no);
                 }*/


                if (vm.focusCustomer > 0) {
                    vm.focusCustomer--
                } else {
                    vm.focusCustomer = vm.customers.length - 1
                }
            },
            "down": function () {
                /*var cusArr = document.getElementsByClassName("tGoodInput");
                 var no = ++vm.cusInputIndex;
                 cusArr[no].focus(no);

                 */

                if (vm.focusCustomer < vm.customers.length - 1) {
                    vm.focusCustomer++
                } else {
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
        customerWaiting: false,
        customers: [],
        customerKey: "",
        cusLastKey: "",
        focusCustomer: -1,
//        搜索客户
        searchCustomer: function () {

            if (vm.customer.Name != "" && vm.customer.Name != vm.cusLastKey) {
                //触发请求
                vm.customerKey = vm.cusLastKey = vm.customer.Name
                vm.CP = 1;
                vm.callCus()
            }
            if (vm.customer.Name == "" && vm.customer.Name != vm.cusLastKey) {
                vm.customer = vm.oldCus = {
                    "TraderID": "",
                    'Name': '',//单位名称
//            'Receivables':,//期初应收账款
//            'Payable':,//期初应付账款
                    'Address': '',//地址
                    'Memo': '',//备注
                    'Type': 0,//单位类型 0 客户，1：供应商
                    'On': 1,//是否开启
                    'Phone': '',//电话
                    'LandLine': '',//座机
                    'QQ': '',//qq
                    'Contact': ''//'联系人'
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
            vm.customerWaiting = true
            if (vm.CP < 1) {
                vm.CP = 1
            }
            ws.call({
                i: "Customer/search",
                data: {
                    keyword: vm.customer.Name,
                    P: vm.CP,
                    N: 8
                },
                success: function (res,err) {
                    if (vm.CP == res.P) {
                        if (res.L.length && vm.customer.Name != '') {
//                            var list=[]
                            var resL = res.L
//                            var len=resL.length
//                            for(var i=0;i<len;i++){
//                                //插入数组
//                                list.push(resL[i])
//                            }
                            vm.customers = resL

                            vm.CP = res.P

                        }
                        else {
                            vm.customers = []
                            //vm.CP--
                            vm.CT = 0
                        }
                        vm.CT = res.T
                        vm.customerWaiting = false
                    }


                }
            })
        },
        selectCustomer: function (index) {
            vm.focusCustomer = index
        },

        //跳转客户详情
        oldCus: {},
        jump2Customer: function (index) {
            var cus = vm.customers[index],
                input = vm.customer,
                x;
            for (x in input) {
                if (x.charAt(0) != '$') {
                    if (cus[x]) {
                        input[x] = cus[x]
                    }
                    else {
                        input[x] = ""
                    }
                    // 记录原有数据，做更改比较所用
                    vm.oldCus = {}
                    vm.oldCus[x] = input[x]
                }
            }
            vm.cusLastKey = vm.customer.Name
            vm.goOut()
            function cuReset() {
                vm.customers = []
                vm.CP = 1
                vm.CT = 0
                vm.customerKey = ""
                //vm.cusLastKey = ""
                vm.focusCustomer = -1
                vm.onGoods = -1
                vm.customerWaiting = false
            }

            cuReset()
        },

        // 计算总金额
        Total: "",
        bigTotal: "",

        //通过单价和数量计算小计
        sum: function () {
            var t = 0;
            for (var i = 0; i < vm.List.length; i++) {
                if (vm.List[i].Price1 == "" && vm.List[i].Amount == "") {
                    continue
                }
                if (vm.List[i].Price1 > 0 && vm.List[i].Amount > 0) {
                    vm.List[i].sum = Number(vm.List[i].Price1 * vm.List[i].Amount).toFixed(2)
                    //如果是租赁则再乘以折扣
                    if(vm.state==12){
                        vm.List[i].sum=vm.List[i].sum*vm.customer.Discount/100
                    }

                }
                else {
                    vm.List[i].sum = 0
                }
                t = Number(t) + Number(vm.List[i].sum)
            }
            vm.Total = Number(t).toFixed(2)

            //翻译为大写
            vm.bigTotal = vm.trs(vm.Total)


            vm.sumDeposit()

        },

        //通过小计和数量计算单价
        backSum: function () {
            var t = 0;
            for (var i = 0; i < vm.List.length; i++) {
                if (vm.List[i].sum == "" && vm.List[i].Amount == "") {
                    continue
                }
                if (vm.List[i].sum > 0 && vm.List[i].Amount > 0) {
                    vm.List[i].Price1 = Number(vm.List[i].sum / vm.List[i].Amount).toFixed(2)

                }
                else {
                    vm.List[i].sum = 0
                }
                t = Number(t) + Number(vm.List[i].sum)
            }

            vm.Total = Number(t).toFixed(2)
            //翻译为大写
            vm.bigTotal = vm.trs(vm.Total)
        },

        //翻译为中文大写
        trs: function (num) {
            var word = ["零 ", "壹", "贰", "叁", "	肆", "伍", "陆", "柒", "捌", "玖"]
            var u1 = ["", "拾", "佰", "仟"]
            var u2 = ["圆", "万", "亿"]
            var end = ['角', '分', '整']
            num = num < 0 ? -num : num;
            var bStr = num.toString()

            var dot_i = bStr.indexOf(".")

            var int = "",//整数部分
                float = "";//小数部分

            var str2 = "";

            if (dot_i == -1 || dot_i == bStr.length - 1) {
                //无小数位
                int = bStr;
                str2 = end[2]
            }
            else {
                //有小数位
                int = bStr.slice(0, dot_i)
                float = bStr.slice(dot_i + 1)

                var jiao = float[0] | "0"
                var fen = float[1] | "0"

                str2 = word[jiao] + end[0] + word[fen] + end[1]

            }

            var str1 = "";
            var r1 = 0
            var r2 = 0
            var up = true
            var o = ""
            var pp = ""
            var p = ""
            var w = ""

            for (var i = int.length - 1; i > -1; i--) {
                o = int[i]
                p = u1[r1]

                w = word[o] + p

                if (up == true) {
                    pp = u2[r2]
                    up = false
                }
                else {
                    pp = ""
                }
                str1 = w + pp + str1

                r1++
                if (r1 == u1.length) {
                    r1 = 0
                    r2++
                    up = true
                }

            }
            var str = str1 + str2
            return str.replace(/ /g, "")
        },


        /******************私有方法*************/
        emptyTell: {
            goodsName: '还没有填写商品名称',    //商品名称
            goodsUnit: '还没有填写单位',       //单位
            goodsNum: '还没有填写数量',         //数量
            goodsPrice: '还没有填写单价'      //单价
        },


        OperatorUID: 1,
        Operator: "",
        OStoreID: "",
        getStoreTimeout: '',
        reset: function () {

            vm.List = []
            vm.addRow(3)
            vm.date = new Date()

            function getStore() {
                clearTimeout(vm.getStoreTimeout)

                try {

                    if (quickStart.Stores.length === 0) {
                        vm.getStoreTimeout = setTimeout(getStore, 300)
                        return
                    }
                    avalon.mix(vm, {
                        OStoreID: quickStart.nowStore.StoreID,
                        ToStoreID: '',
                        Store: quickStart.nowStore,
                        Stores: quickStart.Stores,
                    })
                } catch (err) {
                    vm.getStoreTimeout = setTimeout(getStore, 300)
                }
            }

            getStore()


            vm.Operator = cache.go('un')
            vm.pay = 0
            vm.Memo = ""
            vm.customer = {
                "TraderID": "",
                'Name': '',//单位名称
//            'Receivables':,//期初应收账款
//            'Payable':,//期初应付账款
                'Address': '',//地址
                'Memo': '',//备注
                'Type': 0,//单位类型 0 客户，1：供应商
                'On': 1,//是否开启
                'Phone': '',//电话
                'LandLine': '',//座机
                'QQ': '',//qq
                'Contact': '',//'联系人'
                Discount:100,
            }

            vm.Total = 0
            vm.bigTotal = ""
            vm.showBtn = true


            //重置输入框状态
            var inputs = ['billCus', 'billCusPhone', 'billCusAddress', 'billPay', 'billMemo']
            ForEach(inputs, function (el) {
                try {
                    window[el].default()
                }
                catch (err) {
                }
            })

            //重置客户类型
            if (vm.state == '0' || vm.state == '1') {
                //供应商
                vm.customer.Type = 1
            } else if (vm.state == '2' || vm.state == '3') {
                //客户
                vm.customer.Type = 0
            }


            avalon.mix(vm, {
                draftID: 0,
            })
        },
        close: function () {
            //vm.reset()
            layout.subClose()
            vm.removeBillKey()
        },
        btConfig: {
            id: "billTip"
        },

        //state 与type 的对应表
        $st: {
            "sell": 2,
            "sellReturn": 3,
            "pur": 0,
            "purReturn": 1,
            "A": 6,
            "-4": 4,
            "B": 5,
        },

        //保存草稿
        draftID: 0,
        saveDraft: function () {
            /*抓出所有可能要提交的东西放进去*/
            var draft = {}
            avalon.mix(draft, {
                customer: {
                    Name: vm.customer.Name,
                    TraderID: vm.customer.TraderID
                },
                Total: vm.Total,
                Payed: vm.pay,
                Store: {
                    Name: vm.Store.StoreName,
                    StoreID: vm.Store.StoreID
                },
                Memo: vm.Memo,
                Virtual: vm.Virtual,
                List: packGoods()
            })

            //打包生成商品字段
            function packGoods() {
                //构建商品列表
                var Goods = [];
                var g = {}
                var go = {}
                for (var i = 0; i < vm.List.length; i++) {
                    g = {};
                    go = vm.List[i]

                    ForEach(go, function (el, key) {
                        if (key.charAt(0) == "$") {
                            return
                        }
                        g[key] = el
                    })


                    Goods.push(g)

                }
                return Goods
            }


            var type = vm.state

            require(['../../package/bill/billDraft'], function (billDraft) {
                billDraft.saveDraft(draft, type, vm.draftID, function (res,err) {
                    tip.on('草稿保存成功', 1)
                })
            })

        },


        //控制商品图片的显示
        showingImg:-1,

        showImg: function (i) {
            vm.showingImg=i
        }


    })
    return bill = vm;
})

