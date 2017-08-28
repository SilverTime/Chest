/**
 * Created by mooshroom on 2015/8/31.
 *
 *
 */
define('addUp', [
    'avalon',
    'text!../../package/addUp/addUp.html',
    'css!../../package/addUp/addUp.css',
    '../../lib/ECharts/ECharts.js',
    '../../lib/find/find'
], function (avalon, html) {
    var vm = avalon.define({
        $id: "addUp",
        ready: function (i) {
            layout.url = html;

            var params = String(i).split("&&")

            if (params.length < 3) {
                goto('#!/addUp/' + params[0] + '&&&&')
                return
            }

            //监听时间变化
            var watchTimes = ['startDate', 'endDate', 'accuracyVal'];

            ForEach(watchTimes, function (el) {
                vm.$watch(el, function () {
                    clearTimeout(vm.timeout)
                    vm.timeout = setTimeout(function () {
                        goto('#!/addUp/' +
                            vm.buildParams(
                                vm.nowTable,
                                vm.startDate,
                                vm.endDate,
                                vm.accuracyVal
                            )
                        )
                    }, 300)
                })
            })

            ForEach(['startDateShow', 'endDateShow'], function (el) {
                vm.$watch(el, function () {
                    vm.buildTime()
                })
            })


            vm.reset(params)
            vm.tableList[params[0]].start()

        },
        reset: function (params) {
            avalon.mix(vm, {
                nowTable: params[0],
                startDate: params[1],
                endDate: params[2],
                accuracyVal: params[3]
            })

            vm.setTime(params)
            vm.setAccuracy(params[3])
        },
        timeout: '',
        buildParams: function (t, s, e, a) {
            return [t, s, e, a].join('&&')
        },

        //表格列表
        tableList: [
            {
                name: '商品租赁统计',
                href: "#!/addUp/0",
                start: function () {
                    console.log(this.name)
                    //vm.getReportGlobal()
                }
            },
            //{
            //    name: '商品统计',
            //    href: "#!/addUp/1",
            //    start: function () {
            //        console.log(this.name)
            //
            //    }
            //},
            //{
            //    name: '门店统计',
            //    href: "#!/addUp/2",
            //    start: function () {
            //        console.log(this.name)
            //    }
            //},
            //{
            //    name: '员工统计',
            //    href: "#!/addUp/3",
            //    start: function () {
            //        console.log(this.name)
            //
            //    }
            //},
            //{
            //    name: '交易方统计',
            //    href: "#!/addUp/4",
            //    start: function () {
            //
            //        console.log(this.name)
            //    }
            //}
        ],
        //当前活动的表格
        nowTable: 0,


        //时间选择控制

        startDateShow: '',
        startDate: "",
        endDateShow: "",
        endDate: "",

        //从显示的转换为计算的时间
        setTime: function (Params) {
            //设置开始时间为本月初，结束时间为明天
            var systemStart = avalon.filters.date(Number(new Date().getTime()), 'yyyy-MM-') + '01'
            var today = avalon.filters.date(Number(new Date().getTime()) + 86400000, 'yyyy-MM-dd')

            if (Params[1] == '') {
                vm.startDateShow = systemStart
            } else {
                vm.startDateShow = avalon.filters.date(Params[1], 'yyyy-MM-dd')
            }
            if (Params[2] == '') {
                vm.endDateShow = today
            } else {
                vm.endDateShow = avalon.filters.date(Params[2], 'yyyy-MM-dd')
            }
            //vm.buildTime()
        },

        //从计算的构筑显示的字符串
        buildTime: function () {

            if (vm.startDateShow !== '') {
                vm.startDate = newDateAndTime(vm.startDateShow).getTime()
            } else {
                vm.startDate = ''

            }
            if (vm.endDateShow !== '') {
                vm.endDate = newDateAndTime(vm.endDateShow).getTime()
            } else {
                vm.endDate = ''
            }
        },

        //统计精度
        accuracyList: ['秒', '分钟', '小时', '天', '月', '年'],
        accuracy: '小时',
        accuracyVal: 2,
        accuracySelectChange: function (a) {
            ForEach(vm.accuracyList, function (el, i) {
                if (el == a) {
                    vm.accuracyVal = i
                }
            })
        },
        setAccuracy: function (accuracyVal) {
            vm.accuracy = vm.accuracyList[accuracyVal]
        },


//<!--全局统计-->
        dataGlobal: {
            TimeList: ['', ''],//时间节点列表
            Payable: [],//应付
            Receivables: [],//应收
            PurMoney: [],//采购金额
            PurAmount: [],//采购数量
            SellMoney: [],//销售金额
            SellAmount: [],//销售数量
            PurReturnMoney: [],//采购退货金额
            PurReturnAmount: [],//采购退货数量
            SellReturnMoney: [],//销售退货金额
            SellReturnAmount: [],//销售退货数量
        },
        getReportGlobal: function () {
            ws.call({
                i: "Report/StatisticGlobal/search",
                data: {
                    StartTime: vm.startDate,
                    EndTime: vm.endDate,
                    SizeTime: vm.accuracyVal,
                    IsDelNull: false
                },
                success: function (res, err) {
                    if (err) {
                        tip.on(err)
                        return
                    }

                    /*可能的返回
                     * false:查找失败
                     [
                     0=>[[0=>采购信息，1=>时间]...]
                     1=>[[0=>采购退货信息，1=>时间]...]
                     2=>[[0=>销售信息，1=>时间]...]
                     3=>[[0=>销售退货信息，1=>时间]...]
                     AR=>[[0=>应收款信息，1=>时间]...]
                     AP=>[[0=>应付款信息，1=>时间]...]
                     ]：查找成功（查找不到，则不返回该字段）
                     * */


                    console.log(res)
                }
            })
        },

        //收付款趋势统计图
        //销售趋势统计图
        //采购趋势
        //销售退货趋势
        //采购退货趋势

//<!--商品统计-->
        goodsList:[],
        $optSearchGoods:{
            callback: function (res,cvmid,cvm) {   //回调函数
                vm.goodsList.push(res)
                cvm. Keywords=''
                vm.getReportGoods()
            },
            onInput: function (cvm) {

            },
            target: "Goods",          //要进行动态查询的对象名称
            keyName:'Name',
            placeholder:"查询商品"
        },

        delGoodsSearch:function(index){
            vm.goodsList.splice(index,1)
            vm.getReportGoods()
        },

        dataGoods: {
            TimeList: ['', ''],//时间节点列表
            Goods: {  //商品信息
                GoodsID: "",
                GoodsName: "",
            },
            Gain: [],//利润
            SellAmount: [],//销售数量
            SellMoney: [],//销售额
            PurAmount: [],//采购数量
            PurMoney: []//采购金额
        },
        getReportGoods: function () {
            var goodsIDs=[]
            vm.goodsList.forEach(function (el) {
                goodsIDs.push(el.GoodsID)
            })
            var data={
                Group:"GoodsID",
                W:{
                    Time:['between',[vm.startDate/1000,vm.endDate/1000]],
                    GoodsID:['in',goodsIDs]
                },
                P:1,
                N:10000
            }

            ws.call({
                i:"Report/RentGoods/report",
                data:data,
                success: function (res) {
                    vm.ReportGoods=res.L
                },
                error: function (err) {
                    tip.on(err)
                }
            })
        },
        ReportGoods:[],

        //<!--门店统计-->
        dataStore: {
            TimeList: ['', ''],
            Store: {
                StoreID: "",
                StoreName: "",
            },
            Gain: [],
            SellAmount: [],
            SellMoney: [],
            PurAmount: [],
            PurMoney: []
        },


        getReportStore: function () {

        },

        //<!--员工统计-->
        getReportMember: function () {

        },


        //<!--交易方统计-->
        getReportTrader: function () {

        },


    })
    return addUp = vm
})