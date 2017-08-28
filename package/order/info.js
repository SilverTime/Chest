/**
 * Created by Administrator on 2015/8/4 0004.
 */
define('orderInfo', [
    'avalon',
    'text!../../package/order/info.html',
    'css!../order/order.css',
    '../../lib/whatInput/whatInput'
], function (avalon, info) {
    var vm = avalon.define({
        $id: "orderInfo",
        /*订单详情*/
        ready: function (OrderID) {

            vm.reset();

            //modal.url=info
            //modal.getIn()
            layout.subUrl = info
            layout.rightTitle = "账单详情"
            layout.subOpen()

            avalon.scan()

            vm.thisOrderId = OrderID;
            vm.getInfo(OrderID)

            vm.bindKey()

        },
        thisOrderId: "",
        $key: {
            "esc": function () {
                vm.close()
            }
        },
        binding: false,
        bindKey: function () {

            bindK(vm.$key)

        },
        removeKey: function () {

            removeK(vm.$key)

        },
        reset: function () {
            vm.showLNBtn = false;

            vm.info = {};
            vm.infoCus = {};
            vm.infoGoo = [];
            vm.Money = null;
            vm.settleShow = true;
            vm.nowGoodsID=0,
            //重置结算记录详情
            vm.detailreset()

            avalon.mix(vm,{
                RentBackBtnOpen:-1,
            })
        },
        typeName: ['采购入库', '采购退货', '销售出库', '销售退货', '报损', '盘存', '调拨', '期初应收', '期初应付','','','报价','租赁出库'],
        info: {
            Operator:{
                Name:""
            },
            Store:{
                SName:""
            }
        },
        infoCus: {},
        infoGoo: [],
        bigTotal: "",
        nowGoodsID: 0,
        getInfo: function (id) {
            vm.nowGoodsID=id;
            ws.call({
                i: "Order/Order/get",
                data: {
                    OrderID: id,
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                    }

                    try {
                        order.updataOrders(res)
                    } catch (err) {
                        console.log(err)
                    }


                    if (res.Type != "4" && res.Type != "5" && res.Type != "6") {
                        vm.infoCus = res.Trader;
                        res.Total = Math.abs(res.Total)
                        res.Payed = Math.abs(res.Payed)
                    }

                    if(res.Type==12){
                        res.Goods.forEach(function (el,i,arr) {
                            if(el.RentType!=-1){
                                el.Amount=(-el.Amount)
                            }
                        })
                    }

                    vm.info = res
                    //    减掉退货数量
                    // for(var i=0;i<res.Goods.length;i++){
                    //     for(var k=0;k<res.Goods.length;k++){
                    //         if(res.Goods[i].GoodsID==res.Goods[k].GoodsID&&(i!=k)){
                    //             try {
                    //                 vm.info.Goods[i].Amount=parseFloat(res.Goods[i].Amount)+parseFloat(res.Goods[k].Amount);
                    //                 if(vm.info.Goods[i].Amount<=0){
                    //                     vm.info.Goods.splice(i,1);
                    //                 }
                    //             }catch(err){
                    //                 console.log(err)
                    //             }
                    //
                    //         }
                    //     }
                    // }



                    vm.bigTotal = trs(Number(vm.info.Total))
                    var l = res.Goods
                    console.log(l)
                    var x;
                    for (x in l) {
                        vm.infoGoo.push(l[x]);
                    }
                    //vm.infoGoo=l

                }
            })


            function trs(num) {
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
            }
        },
            /*
            * 退货:
            * @param goodsID 商品序号
            * @param num 商品数量
            * @param TradePrice 商品交易价
            * @param Memo 商品备注
            *
            * */
        goodsBack: function (goodsID,num,Memo,TradePrice) {
            // console.log(goodsID,num,Memo,TradePrice)
            var goodsNum= 0;
            goodsNum=prompt("请输入退货数量,大于等于0且小于等于"+num,num);
            if(goodsNum<0||goodsNum>parseInt(num)){
                tip.on("数量超范围，请重新操作")
                return
            }

            if(goodsNum==null){
                //在prompt中如果返回的为null则说明用户点击了取消
                tip.on('退货操作已取消',1)
                return
            }
            ws.call({
                i: "Order/Order/back",
                data: {
                    OrderID: vm.nowGoodsID,
                    Goods: [[goodsID,parseFloat(goodsNum),Memo,TradePrice.toString()]]
                },
                success: function (res, err) {
                    if(res){
                        vm.info = res
                    //    减掉退货数量
                    //     for(var i=0;i<res.Goods.length;i++){
                    //         for(var k=0;k<res.Goods.length;k++){
                    //             if(res.Goods[i].GoodsID==res.Goods[k].GoodsID&&(i!=k)){
                    //                 try {
                    //                     vm.info.Goods[i].Amount=parseFloat(res.Goods[i].Amount)+parseFloat(res.Goods[k].Amount);
                    //                     if(vm.info.Goods[i].Amount<=0){
                    //                         vm.info.Goods.splice(i,1);
                    //                     }
                    //                 }catch(err){
                    //                     console.log(err)
                    //                 }
                    //
                    //             }
                    //         }
                    //     }


                        // (function calculate(arr){
                        //     var result=[],hash={};
                        //     for(var i=0,elem;(elem=arr[i].GoodsID)!=null;i++){
                        //         if(!hash[elem]){
                        //             hash[elem]=true;
                        //         }
                        //         else{
                        //             vm.info.Goods[i].Amount=parseFloat(res.Goods[i].Amount)+parseFloat(res.Goods[k].Amount);
                        //         }
                        //     }
                        // })(res.Goods);
                    }
                    if(err){
                        tip.on(err,3000);
                        console.log(err)
                    }
                }
            })
        },


        /********************结算*********************/
        showSettle: function () {
            vm.settleShow = true
        },
        settleShow: true,

        hideSettle: function () {
            vm.settleShow = false
            vm.detailreset();   //重置详情
        },
        Money: null,
        //普通单结算
        settle: function () {

            if (vm.Money <= 0) {
                InfoSettleMoney.error('结算金额必须大于0')
            }
            else if (vm.Money > (Number(vm.info.Total) - Number(vm.info.Payed))) {

                InfoSettleMoney.error('结算金额超出了所需要结算的额度')
                //if(confirm("您将要支付的金额超过未结算的金额，多余的金额将不会被计算，是否继续？")){
                //    push()
                //}
            }
            else if (isIt.money(vm.Money, "结算金额")) {
                //付款
                push()
            }

            function push() {
                var money = vm.Money;


                ws.call({
                    i: "Order/Order/settle",
                    data: {
                        OrderIDs: [vm.info.OrderID],
                        TraderID: vm.info.TraderID,//客户编号
                        Money: money//正数表示收款，负数表示付款
                    },
                    success: function (res, err) {
                        if (err||res==false) {
                            InfoSettleMoney.error(err)
                            return
                        }
                        tip.on("结算成功!!", 1)
                        vm.hideSettle();

                        if (/^#!\/order\//g.test(window.location.hash)) {
                            // 当前在总账记录页面
                            order.showNewPayed(vm.Money)
                        }
                        else if (/^#!\/customerInfo\//g.test(window.location.hash)) {
                            // 当前在客户详情页面
                            customer.uploadMoney(vm.Money)
                        }

                        vm.ready(vm.info.OrderID);

                    }
                })
            }

        },

        //租赁单结算
        rentSettle:function () {
            //所有数量加起来等于0说明还租完成，否则退出，并提示
            var sign=0
            vm.info.Goods.forEach(function (el) {
                sign+=Number(el.Amount)
            })
            if(sign!=0){
                tip.on('商品尚未完全归还，不能结算！')
                return
            }

            ws.call({
                i:"Order/Rent/settle",
                data:{OrderID:vm.info.OrderID},
                success:function (res, err) {
                    if(err){
                        return tip.on(err)
                    }

                    vm.hideSettle();

                    if (/^#!\/order\//g.test(window.location.hash)) {
                        // 当前在总账记录页面
                        order.showNewPayed(res.Payed)
                    }
                    else if (/^#!\/customerInfo\//g.test(window.location.hash)) {
                        // 当前在客户详情页面
                        customer.uploadMoney(res.Payed)
                    }

                    tip.on('结算成功',1)
                    vm.ready(vm.info.OrderID)
                }
            })
        },

        /********************打印*********************/
        LodopErr:'',
        PCList:[],
        PCP:1,
        PCN:6,
        PCT:0,
        print: function (OrderID) {
            //检测是否正确安装打印插件
            try{
                window.LODOP=getLodop();
                if (LODOP.VERSION) {
                    //获取该订单类型的打印配置,
                    vm.PCList=[]
                    vm.getPrintConfig(1)
                };
            }catch(err){
            }
        },
        //获取打印配置列表
        getPrintConfig: function (p) {
            var data = {
                P: p,
                N: vm.N,
                W:{
                    Type:vm.info.Type
                }
            }
            ws.call({
                i: "Order/Print/search",
                data: data,
                success: function (res, err) {
                    if (err) {
                        return tip.on(err)
                    }
                    //如果有且只有一个，直接调用该配置进行打印
                    if(res.L.length==1){
                        vm.sendToLodop(res.L[0].Content)
                        return
                    }
                    //如果没有
                    if(res.L.length==0){
                        vm.LodopErr='尚未配置'+
                            vm.typeName[vm.info.Type]+
                            '单的打印配置，请在' +
                        '<a href="#!/printer/0">打印设置</a>' +
                            '中添加配置'
                    }

                    vm.PCList = vm.PCList.concat(res.L)
                    avalon.mix(vm, {
                        P: res.P,
                        T: res.T
                    })
                }
            })
        },
        printTMP:"",
        sendToLodop: function (codeStr) {
            //todo 初始化的任务名为： 店铺名称+订单类型+订单编号+当前时间
            LODOP.PRINT_INIT('')

            var code=String(codeStr).split("@~@")
            vm.printTMP=code[0]
            avalon.nextTick(function () {
                eval(code[1])
                var tmp=document.getElementById('print_tmp')

                LODOP.ADD_PRINT_TABLE(1,1,"99.8%",250,tmp.innerHTML);
                LODOP.PREVIEW();
            })


        },

        //结算记录
        showDetail: false,
        details: [],
        detailreset: function () {
            vm.showDetail = false;
            vm.details = [];
        },
        openDetail: function () {
            if (vm.showDetail) {
                vm.showDetail = false;
            } else {
                vm.showDetail = true;
            }
        },


        //还租按钮的展开
        RentBackBtnOpen:-1,
        toggleRentBackBtn: function (i) {
            if(vm.RentBackBtnOpen==i){
                vm.RentBackBtnOpen=-1
                vm.rentAmount=0
                return
            }
            vm.RentBackBtnOpen=i
            vm.rentAmount=Number(vm.info.Goods[i].Amount)

        },

        //还租
        rentAmount:0,
        RentBack: function (GoodsID,Amount,Type) {
            var data={
                'OrderID':vm.info.OrderID,
                'TraderID':vm.info.TraderID,
                'GoodsID':GoodsID,
                'Amount':vm.rentAmount,
                'RentType':Type,
                'StoreID':vm.info.Store.StoreID
            }
            if(Type==-2){
                data.Money=prompt('输入赔偿金额')
                if(data.Money==null){
                    tip.on('赔偿被取消',1)
                }
            }

            if(!data.Amount>0){
                return tip.on('归还或赔偿数量必须大于0')
            }

            ws.call({
                i:"Order/Rent/indemnify",
                data:data,
                success: function (res,err) {

                    if(err){

                        if(err=='商品已归还完成'){
                            vm.RentBackBtnOpen=-1
                            return tip.on('该商品已经全部还清了')
                        }else{
                            return tip.on(err)
                        }

                    }

                    tip.on('还租成功！',1)
                    vm.getInfo(vm.thisOrderId)
                    vm.RentBackBtnOpen=-1
                }
            })
        },


        //关闭的动作
        close: function () {
            vm.removeKey()
            //window.location.href = '#!/order/0'
            layout.subClose()

        }




    })
    return orderInfo = vm;
})