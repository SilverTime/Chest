/**
 * Created by mooshroom on 2015/7/26 0026.
 *
 * 总帐记录 模块逻辑
 */
define('all', ['avalon', 'text!../../package/all/all.html', 'text!../../package/all/info.html', 'css!../../package/all/all'], function (avalon, html, info) {
    var vm = avalon.define({
        $id: "all",
        ready: function () {
            layout.url = html;
            avalon.scan();
            if (vm.firstTime) {
                vm.filt(0);
                vm.firstTime = false;
            }
        },
        firstTime: true,
        now: 0,    //控制筛选: 1全部 2应收 3应付 4销售 5采购退货 6采购 7销售退货  8盘点调拨报损

        /*
        *值	含义
         0	采购入库
         1	采购退货
         2	销售出库
         3	销售退货
         4	报损
         5	盘存
         6	调拨
         7	期初应收
         8	期初应付*/
        $typeData:[
            {
                W:{
                    Type:["in","0,1,2,3"]   //不要 3，-3
                }
            },
            {
                W:{
                    Type:["in","1,2"]
                }
            },
            {
                W:{
                    Type:["in","0,3"]
                }
            },
            {
                W:{
                    Type:["in","2"]
                }
            },
            {
                W:{
                    Type:["in","1"]
                }
            },
            {
                W:{
                    Type:["in","0"]
                }
            },
            {
                W:{
                    Type:["in","3"]
                }
            },
            {
                W:{
                    Type:["in","4,5,6"]
                }
            }
        ],
        data:[
            {
                name:"全部交易",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"收款",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"付款",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"销售出库",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"采购退货",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"采购入库",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"销售退货",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:999999999999,
                maxDate: -999999999999,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            },
            {
                name:"调拨盘点报损",
                P:0,
                T:0,
                L:1,
                CusNum:0,
                howLong:0,
                allTotle:0,
                allPayed:0,
                overNum:0,
                minDate:0,
                maxDate:0,
                allOrder:0,
                workerNum:0,
                allTallyAmounts:0,
                CustomerList:{},
                workerList:[],
                list:[]
            }
        ],
        showList:[],
        filt: function (i) {

            /* 跟新 */
            if (vm.now != i && vm.needUpload) {
                setTimeout(function () {
                    vm.getList();
                }, 300)
                vm.needUpload = false;
            }
            /******/

            vm.now = i;
            if(vm.data[i].P == 0){
                vm.getList();
            }
            if(i != 7){
                vm.showList = vm.data[i].list;
            }
        },
        getList: function () {
            if(vm.data[vm.now].L <= 0){
                return;
            }
            if(vm.now == 7){
                //获取调拨盘点报损
                ws.call({
                    i:"Order/Order/search",
                    data:{
                        P:vm.data[7].P ++,
                        N:16,
                        W:vm.$typeData[7].W
                    },
                    success:function(res){
                        if (!res.err) {
                            vm.data[7].T = parseInt(res.T);
                            vm.data[7].L = vm.data[7].T - vm.data[7].P * 16;
                            try {
                                for (var i = 0; i < res.L.length; i++) {
                                    vm.data[7].list.push(res.L[i]);
                                }
                            } catch (err) {console.log(err);}
                        } else {console.log(res.err);}
                    }
                });
            } else {
                ws.call({
                    i: "Order/Order/search",
                    data: {
                        P: vm.data[vm.now].P ++,
                        N: 16,
                        W: vm.$typeData[vm.now].W,
                        Clear:2 // todo 0 未结算 1 已结算 2 所有
                    },
                    success: function (res,err) {
                        if (!res.err) {
                            vm.data[vm.now].T = parseInt(res.T);
                            vm.data[vm.now].L = vm.data[vm.now].T-vm.data[vm.now].P*16;
                            try {
                                for (var i = 0; i < res.L.length; i++) {
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
                            } catch (err) {console.log(err);}
                        } else {console.log("获取数据失败：" + res.err);}
                    }
                });
            }
        },
        ready2info: function () {
            require(['../order/info'],function(){});
        },
        changeOrder: -1,
        toInfo: function (id, index,OrderCode) {
            if(Math.abs(OrderCode)!=3){
                window.location.href='#!/OrderInfo/'+id;
                vm.changeOrder = index;
            }
        },
        //更新列表
        updataOrders: function (order) {
            var index = vm.now;
            var len = vm.data[index].list.length;
            var list = vm.data[index].list;
            for(var k = 0;k < len;k ++){
                if(list[k].OrderID == order.OrderID){
                    //找到更新的数据
                    list[k].Payed = Number(order.Payed);
                    list[k].Need = (Number(list[k].Total) - list[k].Payed).toFixed(2);
                    vm.count(vm.data[vm.now].list);
                    break;
                }
            }
        },
        //局部更新订单列表-----------不知道有什么用
        needUpload: false,
        showNewPayed: function (money) {
            vm.data[vm.now].list[vm.changeOrder].Payed = (Number(vm.data[vm.now].list[vm.changeOrder].Payed) + Number(money)).toFixed(2);
            vm.data[vm.now].list[vm.changeOrder].Need = (Number(vm.data[vm.now].list[vm.changeOrder].Need) - Number(money)).toFixed(2);
            vm.count(vm.data[vm.now].list);
            //列表有更新时，标记这个值为true，表示需要重新获取，在切换筛选状态时，将执行重置并重新获取列表
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
            /* 订单量  当前数组长度 */
            var index = vm.now;
            var allOrder = list.length;
            vm.data[index].allOrder = allOrder;
            for (var i = 0; i < allOrder; i ++) {
                /*
                 * 单位数量：
                 * 遍历列表中的单位（obj.Customer.TraderID），如果这个单位在（vm.CustomerList）中，能找到相应的键,则标识已经有了
                 * 否则则标识还没有出现过，则加入到名单中，计数器加一
                 *
                 * */
                var cusID = list[i].TraderID || -1;
                if (vm.data[index].CustomerList[cusID] != true) {
                    vm.data[index].CustomerList[cusID] = true;
                    vm.data[index].CusNum ++;
                }
                /*
                 * 操作人数
                 * 与单位数量相同算法
                 * */
                var worID = list[i].OperatorUID || -1;
                if (vm.data[index].workerList[worID] != true) {
                    vm.data[index].workerList[worID] = true;
                    vm.data[index].workerNum ++;
                }
                /*
                 * 跨域日期以及跨越天数
                 * 遍历日期，如果比最小值（vm.minDate）还小，则设置新的最小值为他，
                 * 如果比最大值(vm.maxDate)还大，则设置新的最大值为他
                 * 渲染的是计算一下获得跨越日期以及跨越天数
                 *
                 * */
                if (list[i].Time > vm.data[index].maxDate) {
                    vm.data[index].maxDate = list[i].Time;
                }
                if (list[i].Time < vm.data[index].minDate) {
                    vm.data[index].minDate = list[i].Time;
                }
                /*
                 * 应收款
                 * 所有的应收加起来
                 * */
                vm.data[index].allTotle =Number(Number(vm.data[index].allTotle) + Number(list[i].Total)).toFixed(2);
                /*
                 * 实付款
                 * 所有的累加
                 * */
                vm.data[index].allPayed = Number(Number(vm.data[index].allPayed) + Number(list[i].Payed)).toFixed(2);
                /*
                 * 结清比
                 * 累加所有的结清
                 * 结清除以总数，获得结清比
                 * */
                vm.data[index].allTallyAmounts = vm.data[index].allTallyAmounts + Number(list[i].Total);
            }
            //处理没有日期的情况
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
    return all = vm;
});



