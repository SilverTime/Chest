/**
 * Created by mooshroom on 2016/5/16.
 */
define('goodsInfo', [
    'avalon',
    'text!../../package/goods/info.html'
], function (avalon, html) {
    var vm = avalon.define({
        $id: "goodsInfo",
        $infoKey: {
            "esc": function () {
                vm.infoClose()
            }
        },
        ready: function (goodsid) {
            layout.subUrl = html
            layout.rightTitle = "商品详情"
            layout.subOpen()
            //modal.url = info
            vm.reset()
            vm.goodsID = goodsid

            vm.getGoods(goodsid)
            vm.getCombineList(goodsid)
        },
        goodsID: 0,
        reset: function () {
            avalon.mix(vm, {
                infoPrices: [
                    {
                        Name: "加权成本",
                        Type: 0,
                        Price: "未设置"
                    },
                    {
                        Name: "标准售价",
                        Type: 1,
                        Price: "未设置"
                    },
                    {
                        Name: "会员售价",
                        Type: 2,
                        Price: "未设置"
                    }
                ],
                info: {
                    price0: '',
                    price1: '',
                    price2: ''
                },
                priceArr:[],//渲染价格
            })
        },

        info: {
            price0: '',
            price1: '',
            price2: ''
        },
        priceArr:[],//渲染价格
        getGoods: function (goodsid) {
            vm.priceArr=[];
            ws.call({
                i: "Goods/Goods/get",
                data: {
                    GoodsID: goodsid,
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }

                    vm.info = res;
                    vm.priceArr=[res.Prices.T1,res.Prices.T2]
                    try{
                        if(res.Prices.T3!==undefined){

                            vm.priceArr.push(res.Prices.T3)
                        }
                    }catch(err){}

                    vm.buildStore()
                    try {
                        goods.updateGoods(res)
                    } catch (err) {
                    }
                }
            })

            bindK(vm.$infoKey)
        },

        infoClose: function () {
            removeK(vm.$infoKey)
            layout.subClose()
            //if(vm.fromDD == 1){
            //    window.location.href='#!/OrderInfo/'+vm.lastOrderID;
            //    return;
            //}
            //if(vm.fromDD == 2){
            //    setTimeout(function(){
            //        bill.ready("goodsCar")
            //        require(['text!../../package/bill/bill.html'], function (html) {
            //            layout.subUrl = html
            //            layout.subOpen()
            //            avalon.scan();
            //        });
            //    },200);
            //    /***********************************************************************/
            //    /*怎么回到上一个页面*/
            //    return;
            //}
            //if(vm.lastUrl==""){
            //    window.location.href='#!/goods/0'
            //}else{
            //    window.location.href = vm.lastUrl;
            //}

        },
        thisStoreTotal: 0,
        buildStore: function () {

            //验证
            if (!(vm.info.Stocks.length > 0)) {
                return;
            }

            //获取当前库房
            var nowStore = quickStart.nowStore;
            var stores = vm.info.Stocks

            var finded = false
            //循环查找
            for (var i = 0; i < stores.length; i++) {

                if (stores[i].StoreID == nowStore.StoreID) {
                    vm.thisStoreTotal = stores[i].Amount
                    finded = true
                    break
                }
            }
            if (!finded) {
                //这是最后一个而且还没有找到
                vm.thisStoreTotal = 0
            }

        },


        /*开单快捷*/
        toBill: function (type) {
            quickStart.start(type)
            bill.getGoodsCarList([vm.info.GoodsID])
        },
        //列表上面的入库
        toBillPur: function (goods) {
            quickStart.start("0")
            bill.getGoodsCarList([vm.info.GoodsID])
        },


        //获取合成公式列表
        CombineList: [],
        getCombineList: function (GoodsID) {
            ws.call({
                i: "Store/Combine/getByGoodsIDs",
                data: {
                    GoodsIDs: [GoodsID]
                },
                success: function (res, err) {
                    if (err||res==false) {
                        return
                    }

                    vm.CombineList = res
                }
            })
        },

        //跳转编辑
        infoEdit: function (goodsid) {
            require(['../../package/goods/goodsEdit'], function (goodsEdit) {
                goodsEdit.ready(goodsid)
            })
        },

        //编辑合成公式
        composeEdit: function (id) {
            require(['../../package/goods/compose'], function (c) {
                c.ready(id)
            })
        },

        //新建合成公式
        addCompose: function () {
            require(['../../package/goods/compose'], function () {
                compose.ready()
            })
        },

        //跳转合成页面
        toMake: function (id) {
            require(['../../package/goods/make'], function (make) {
                make.ready(id)
            })
        },


        //加权成本
        Standard: [
            {
                Name: "",
                Money: ''
            }
        ],
        //添加加权成本
        addStandardBox: function () {
            vm.Standard.push({
                Name: "",
                Money: ""
            })
        },
        delStandardBox: function ($index) {
            vm.Standard.splice($index, 1)
        },


        Virtual: ['实体商品', '虚拟商品'],
        Disable: ['启用中', '已禁用']


    })

    window[vm.$id] = vm
    return vm
})