/**
 * Created by mnooshroom on 2015/7/26 0026.
 *
 * 顶部快捷开始菜单
 *
 */
define('quickStart', ['avalon', '../../package/bill/bill'], function () {
    var vm = avalon.define({
        $id: "quickStart",
        ready: function () {
            console.log("快捷开始准备就绪")
            vm.getReport();
            vm.getStores()

            avalon.mix(vm,{
                //用户数据
                user: {
                    UserName: cache.go('un'),
                    uid: cache.go('uid')
                },
            })

            avalon.scan()
        },
        //绑定快捷键
        $hotKeyList: {
            "f1": function () {
                quickStart.start("2")
            },
            "f2": function () {
                quickStart.start("3")
            },
            "f3": function () {
                quickStart.start("0")
            },
            "f4": function () {
                quickStart.start("1")
            },
            "f5": function () {
                if (confirm("如果刷新浏览器，未保存的操作将丢失，确定要刷新么？")) {
                    window.location.reload()
                }
            },
            //总账记录 Alt+Z
            "alt+z": function () {
                //    window.location.href="#!/all/0"

                window.location.href = "#!/order/0"
            },
            //订单查询 Alt+D
            "Alt+D": function () {
                window.location.href = "#!/search/0"
            },
            //商品管理 Alt+S
            "Alt+S": function () {
                window.location.href = "#!/goods/0"
            },
            //客户供应商 Alt+K
            "Alt+K": function () {
                window.location.href = "#!/customer/0"
            },
            //门店管理 Alt+M
            "Alt+M": function () {
                window.location.href = "#!/store/0"
            },
            //报表中心 Alt +B
            "Alt+B": function () {
                window.location.href = "#!/addUp/0"
            },
            //更多 Alt +G
            "Alt+G": function () {
                window.location.href = "#!/more/0"
            },
            //搜索商品  ctrl+O
            "alt+O": function () {
                window.document.getElementById("searchGoods").focus()
            },
            //搜索客户  ctrl+P
            "alt+P": function () {
                window.document.getElementById("searchCustomer").focus()
            }
            //用来屏蔽backspace键返回之前的页面!!不能屏蔽，如果了，文字的时候就不能回删了！
            //"backspace":function(){}
        },

        binding: false,

        bindBillKey: function () {
            if (!vm.binding) {
                bindK(vm.$hotKeyList)
                vm.binding = true
            }

        },
        removeBillKey: function () {
            if (vm.binding) {
                removeK(vm.$hotKeyList)
                vm.binding = false
            }

        },


        //登录状态
        inSide: true,//todo 这里被我置为true了

        //用户数据
        user: {
            UserName: '',
            uid: ''
        },

        //登出
        logout: function () {
            ws.call({

                i: "User/User/logout",
                success: function (data) {
                    console.log(data);
                    if(!data){
                        return
                    }

                    logouted()


                }
            })
        },

        //模态框开启,传入不同的参数开启不同的表单的模态框
        preLoad: function (n) {

            require(['text!../../package/bill/bill.html'], function (html) {
            })
        },
        unLoad: function () {
            vm.loaded = false
        },
        loaded: false,
        start: function (n) {
            if(window.location.hash=='#!/bill/'+n){
                //就是当前郁闷
                bill.ready(n)
            }else{
                window.location.href="#!/bill/"+n
            }

        },

        //商品关键字
        goodsKey: "",

        //交易方关键字
        customerKey: "",


        /*库房*/
        Stores: [],
        nowStore: {},

        //获取库房
        getStores: function () {
            ws.call({
                i:"Store/Store/search",
                data:{
                    P:1,
                    N:99999999,
                    W:{
                        Status:1
                    }
                },
                success: function (res,err) {
                    if (res.L.length === 0) {
                        //还没有创建店铺
                        var p = confirm("您还没有创建任何的门店，将无法创建订单，\n是否现在就去添加？")
                        if (p) {
                            window.location.href = "#!/store/0"
                        }

                        return
                    }

                    if(err){
                        //出错
                        tip.on(err)
                        return
                    }

                    //正常de逻辑
                    vm.Stores=[]
                    for (var i = 0; i < res.L.length; i++) {
                        vm.Stores.push(res.L[i])
                    }


                    //加载上次所在的库房
                    var lastStore = cache.go("store")
                    if (lastStore < res.L.length) {
                        vm.changeStore(lastStore)
                    } else {
                        vm.changeStore(1)
                    }




                }
            })
        },

        //库房切换
        showMoreStore: false,
        moreStore: function () {
            vm.showMoreStore = true
        },
        closeMoreS: function () {
            vm.showMoreStore = false
        },
        changeStore: function (index) {
            var index = Number(index)
            vm.nowStore = vm.Stores[index]
            vm.StoreID=vm.Stores[index].StoreID;
            vm.closeMoreS()
            if (window.bill) {
                bill.Store = vm.Stores[index]
            }
            if (window.goods) {
                goods.buildStore()
            }

            //记录本次变更的库房
            cache.go({
                store: index
            })
        },

        /*******************全局统计***********************/
        Report: {
            "Day": {
                "SalesAmount": 0,
                "EarlyReceivables":0,
                "FinalReceivalbes":0,
            },
            "Week":{
                "SalesAmount": 0,
            },
            "Month": {
                "SalesAmount": 0,

            },
        },
        getReport: function () {
            if (vm.inSide) {
                ws.call({
                    i: "Report/Day/day",
                    data: {
                        //Day:day,
                        Params:[
                            'Day','Week','Month'
                        ]
                    },
                    success: function (res,err) {
                        if (res) {
                            vm.Report = res
                        }
                        else {
                            console.log(res)
                        }
                    }
                })
            } else {
                setTimeout(function () {
                    vm.getReport()
                }, 1000)
            }

        },

        showGlobal: false,
        wShowGlobal: false,
        lookGlobal: function () {
            if (vm.showGlobal) {
                vm.showGlobal = false;
                vm.wShowGlobal = false;
            } else {
                vm.showGlobal = true;
                setTimeout(function () {
                    vm.wShowGlobal = true;
                }, 200);
            }
        },

        /*控制 备选商品列表 更多订单按钮的出现于消失*/
        showMoreBill: false,
        toggleBill: function () {
            vm.showMoreBill = !vm.showMoreBill;
        }


    })
    return quickStart = vm
})
