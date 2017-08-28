/**
 * Created by mooshroom on 2015/12/17.
 */
define('selected', ['avalon', 'text!../../package/goods/selected.html', 'css!../../package/goods/goods.css'], function (avalon, html) {
    var vm = avalon.define({
        $id: "selected",
        ready: function () {
            layout.subUrl = html
            layout.rightTitle = "已选商品列表"
            layout.rightShowing = true

            vm.reset()


        },
        opened: false,
        reset: function () {
            require(['../../package/quickStart/quickStart.js'], function () {
                vm.Store = quickStart.nowStore
            })

            //vm.goodsCarList = []
            layout.GCList = vm.$GCList = vm.getSelected()
            //vm.goodsCarLength = 0
            vm.moreOption = true
            if (!vm.opened) {
                //新来的
                vm.opened = true
                if (vm.goodsCarList.length == 0 && vm.$GCList.length > 0) {
                    vm.getGoodsCarList(vm.$GCList)
                }
            }
        },
        Store: {},
        goodsCarList: [],
        $GCList: [],
        goodsCarLength: 0,
        moreOption: true,
        //获取所选中商品的ID
        getSelected: function () {
            var list = cache.go("$GCList")
            if (typeof(list) == "string") {
                return list.split(",")
            } else if (typeof(list) == "undefined") {
                return []
            } else {
                return list
            }

        },
        //存储商品id
        saveSelected: function () {
            cache.go({
                $GCList: vm.$GCList
            })
            layout.GCList = []
            layout.GCList = vm.getSelected()
        },
        //更新一条
        newSelected: function (id) {
            vm.$GCList.push(id)
            vm.getGoodsCarList([id])
            vm.saveSelected()
        },
        getGoodsCarList: function (ids) {
            //获得商品ID列表
            ws.call({
                i: "Goods/Goods/gets",
                data: {
                    GoodsIDs: ids,//商品编号列表
                },
                success: function (res, err) {
                    if (err||res==false) {
                        console.log('!!!!!!' + err)
                        return
                    }
                    var All = 0;
                    var resL = res;
                    var len = res.length;
                    //if (index == 0) {
                    //    vm.List = [];
                    //} else if (index == 1) {
                    //    goodsCarList = [];
                    //}

                    for (var i = 0; i < len; i++) {
                        //计算总库存
                        All = 0;
                        //当前库房获取逻辑,
                        if (resL[i].Store) {
                            for (var o = 0; o < resL[i].Store.length; o++) {
                                if (resL[i].Store[o].StoreID == vm.Store.StoreID) {
                                    All = resL[i].Store[o].Amount;
                                    break;
                                }
                            }
                        }
                        resL[i].ThisTotle = All;
                        resL[i].AllTotle = resL[i].StoreTotal;
                        resL[i].os = resL[i].Standard;
                        resL[i].ou = resL[i].Unit;
                        resL[i].Amount = 1;

                        vm.goodsCarList.push(resL[i]);
                    }
                }
            })

        },

        //更多
        changeMOption: function () {
            vm.moreOption = false;
        },
        //清空
        clearGoods: function () {
            vm.goodsCarList = [];
            vm.$GCList = [];
            vm.goodsCarLength = 0;
            vm.saveSelected()
        },
        //删除一项
        delItem: function (index) {
            vm.$GCList.splice(index, 1)
            vm.goodsCarList.splice(index, 1)
            vm.saveSelected()
        },
    })
    return selected = vm
})