/**
 * Created by mooshroom on 2016/6/17.
 */
define('traderInfo', [
    'avalon',
    'text!../../package/customer/info.html',
    'css!../../package/customer/customer.css',
    '../../lib/whatInput/whatInput',

], function (avalon, html, css) {
    var vm = avalon.define({
        $id: "traderInfo",
        ready: function (id) {
            vm.reset()
            layout.url = html;
            vm.getTrader(id)
        },
        reset: function () {
            avalon.mix(vm, {
                info: {},
                OrderList: [],
                lP: 0,
                lT: 0,
                moneyInput: 0,
                pay: 0,
                income: 0,
                pay2: 0,
                income2: 0,
                allInM: 0.00,
                allOutM: 0.00,
                $checkedOrderS: {
                    inM: [],
                    outM: []
                },
                allChecked: false,
            })

        },

        //前往编辑
        traderEdit: function (tid) {
            require(['../../package/customer/traderEdit.js'], function (traderEdit) {
                traderEdit.ready(tid)
            })
        },

        //获取详情
        info: {},
        getTrader: function (id) {
            ws.call({
                i: "Trader/Trader/get",
                data: {
                    TraderID: id,
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }


                    vm.info = res
                    try {
                        customer.updateList(res)
                    } catch (err) {
                    }
                    //quickStart.goOut()
                    vm.getOrder()

                }
            })
        },

        //获取订单
        typeName: ['采购入库', '采购退货', '销售出库', '销售退货', '报损', '盘存', '调拨', '期初应收', '期初应付'],

        OrderList: [],
        lP: 0,
        lT: 0,
        getOrder: function () {
            vm.lP++
            ws.call({
                i: "Order/Order/Search",
                data: {
                    W: {
                        TraderID:vm.info.TraderID,
                    },
                    P: vm.lP,
                    N: 12,
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }

                    ForEach(res.L, function (el) {
                        el.Need = el.Total - el.Payed
                        el.checkable = true

                        if(el.Totle==el.Payed){
                            el.SettleTime=el.SettleLog[el.SettleLog.length-1].Time
                        }

                        vm.OrderList.push(el)
                    })

                    vm.lP = res.P
                    vm.lT = res.T
                }
            })
        },

        //结算相关
        //查看订单详情
        ready2info: function () {
            require(['../../package/Order/info'], function () {

            })
        },
        changeing: '',//标记正在被改变的详情
        toOrderInfo: function (id, index, OrderCode) {
            if (Math.abs(OrderCode) != 3) {
                window.location.href = '#!/OrderInfo/' + id
                vm.changeing = index
            }
        },

        //更新相关数据
        uploadMoney: function (money) {
            //更新列表项目
            vm.OrderList[vm.changeing].Payed = (Number(vm.OrderList[vm.changeing].Payed) + Number(money)).toFixed(2)
            vm.OrderList[vm.changeing].Need = (Number(vm.OrderList[vm.changeing].Need) - Number(money)).toFixed(2)

            //更新总共的
            if (vm.OrderList[vm.changeing].OrderCode > 0) {
                //付款
                vm.info.Payable = vm.info.Payable - money
            }
            else if (vm.OrderList[vm.changeing].OrderCode < 0) {
                //收款
                vm.info.Receivables = vm.info.Receivables - money
            }
        },

        /*收付款（按客户）*/
        moneyInput: 0,
        showInput: function (i) {
            vm.moneyInput = i
        },
        pay: 0,
        income: 0,
        pushMoney: function () {
            if (vm.moneyInput == 1) {

                if (Number(vm.pay) <= 0) {
                    TraderPay.error('结算金额必须大于0')
                }
                else if (Number(vm.pay) > Number(vm.info.Payable)) {
                    TraderPay.error('结算金额超出了所需要结算的额度')
                    //if(confirm("您将要支付的金额超过未结算的金额，多余的金额将不会被计算，是否继续？")){
                    //    push(-vm.pay)
                    //}
                }
                else if (isIt.money(vm.pay, "结算金额")) {
                    //付款
                    if (isIt.money(vm.pay, "所输入的金额")) {

                        vm.OrderSettle(vm.pay, [], true)
                    }
                }

            }
            else if (vm.moneyInput == 2) {
                if (Number(vm.income) <= 0) {
                    TraderIncome.error('结算金额必须大于0')
                }
                else if (Number(vm.income) > Number(vm.info.Receivables)) {
                    TraderIncome.error('您将要收取的金额超过未结算的金额')
                    //if(confirm("您将要收取的金额超过未结算的金额，多余的金额将不会被计算，是否继续？")){
                    //    push(vm.income)
                    //}
                }
                else {
                    //付款
                    if (isIt.money(vm.income, "想要收取的金额")) {

                        vm.OrderSettle(vm.income, [], false)
                    }
                }
            }


        },
        OrderSettle: function (money, OrderIDs, IsPayable) {

            if (typeof OrderIDs != 'object') {
                console.log('！！！！！！传入参数错误！！！！！！')
                console.log(OrderIDs)
                return
            }

            var data = {
                TraderID: vm.info.TraderID,
                Money: money,
            }
            if (OrderIDs.length > 0) {
                data.OrderIDs = OrderIDs
            }
            else {
                data.IsPayable = IsPayable
            }
            ws.call({
                i: 'Order/Order/settle',
                data: data,
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }
                    var id = vm.info.TraderID

                    vm.ready(id)
                }
            })
        },

        /*收付款（按选中订单）*/
        pay2: 0,
        income2: 0,
        //选中
        check: function (index) {
            vm.OrderList[index].checkable = !vm.OrderList[index].checkable
            vm.settleAddUp()
        },

        //选中全部
        allChecked: false,
        checkAll: function () {
            var list = vm.OrderList
            var tf;
            if (vm.allChecked) {
                //全部取消选择
                vm.allChecked = false
                tf = true
            }
            else {
                //全部选中
                vm.allChecked = true
                tf = false
            }
            for (var i = 0; i < list.length; i++) {
                list[i].checkable = tf
            }
            vm.settleAddUp()
        },

        //反选
        checkToggle: function () {
            var list = vm.OrderList
            for (var i = 0; i < list.length; i++) {
                list[i].checkable = !list[i].checkable
            }
            vm.settleAddUp()
            vm.allChecked = false
        },

        //需结算金额计算
        allInM: 0.00,
        allOutM: 0.00,
        $checkedOrderS: {
            inM: [],
            outM: []
        },
        settleAddUp: function () {
            var list = vm.OrderList
            var allInM = 0,
                allOutM = 0,
                inM = "",
                outM = "";
            for (var i = 0; i < list.length; i++) {
                if (!list[i].checkable && list[i].Need != 0) {
                    //被选中的
                    if (list[i].Type==1||list[i].Type==2) {
                        //要给钱的入库单
                        allOutM += Math.abs(list[i].Need)
                        //outM.push(list[i].OrderID)
                        if (outM === "") {
                            outM = list[i].OrderID
                        } else {
                            outM += "," + list[i].OrderID
                        }

                    } else if (list[i].Type==0||list[i].Type==3) {
                        //要收款的出库单
                        allInM += Math.abs(list[i].Need)
                        console.log(allInM)
                        if (inM === "") {
                            inM = list[i].OrderID
                        } else {
                            inM += "," + list[i].OrderID
                        }
                    }
                }
            }
            function resArr(str) {
                if (str === "") {
                    return []
                } else {
                    return str.split(",")
                }
            }

            vm.allInM = allInM.toFixed(2)
            if (vm.allInM == 0) {
                vm.income2 = 0
            }
            vm.allOutM = allOutM.toFixed(2)
            if (vm.allOutM == 0) {
                vm.pay2 = 0
            }
            vm.$checkedOrderS = {
                inM: resArr(inM),
                outM: resArr(outM),
            }
            console.log(vm.$checkedOrderS)
        },

        //执行结算动作
        settleCheckedOrders: function () {
            var pay2 = vm.pay2, income2 = vm.income2;
            if (Number(pay2) == Number(vm.allOutM) && Number(income2) == Number(vm.allInM)) {
                //金额是输入正确的
                if (pay2 > 0) {
                    vm.OrderSettle(pay2, vm.$checkedOrderS.outM,true)
                }

                if (income2 > 0) {
                    vm.OrderSettle(income2, vm.$checkedOrderS.inM,false)
                }

            }
            else {
                tip.on("结算的金额需要与待结算的金额一致")
            }

        }
    })

    window[vm.$id] = vm
    return vm
})