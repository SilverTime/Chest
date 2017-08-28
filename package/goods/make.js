/**
 * Created by mooshroom on 2016/7/3.
 */
define('make', [
    'avalon',
    'text!../../package/goods/make.html',
    '../../lib/whatInput/whatInput'
], function (avalon, html) {
    var vm = avalon.define({
        $id: "make",
        ready: function (id) {
            layout.subUrl = html
            layout.subOpen()
            layout.rightTitle = "商品合成";
            vm.getCombine(id)
            vm.CombineID = id
            vm.getStore()
        },
        reset: function () {
            avalon.mix(vm, {
                info: {},
            })
        },

        //获取合成公式
        info: {},
        getCombine: function (id) {
            //获取
            ws.call({
                i: "Store/Combine/get",
                data: {
                    CombineID: id,
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }

                    vm.info = res

                    //构建比例
                    vm.saveScale(res)
                }
            })
        },

        //构建比例
        scale: {
            In: [],
            Out: [],
        },
        saveScale: function () {

            var res = vm.info


            //循环填入

            ForEach(res.In, function (el, key) {
                el.base = el.Amount
            })
            ForEach(res.Out, function (el, key) {
                el.base = el.Amount
            })
        },

        //自动计算填入
        /*
         除了变动的，所有的额值同比增长
         * @params LR:In 代表是左边的 Out 代表是右边的
         * @params index 第几个的序号
         * @params val  变动之后的值
         * */
        Rate:1,
        GrowTogether: function (LR, index) {
            var val = vm.info[LR][index].Amount
            var r = val / vm.info[LR][index].base
            ForEach(vm.info.In, function (el, i) {
                if (LR == 'In' && i == index) {
                    return
                }
                el.Amount = el.base * r

            })
            ForEach(vm.info.Out, function (el, i) {
                if (LR == 'Out' && i == index) {
                    return
                }
                el.Amount = el.base * r

            })

            vm.Rate=r
        },

        //反转
        IsIn:false,
        turn: function () {
            var middle = avalon.mix([], vm.info.In)
            vm.info.In = avalon.mix([], vm.info.Out)
            vm.info.Out = middle
            vm.IsIn=!vm.IsIn
        },

        //选择库房
        Store:"",
        Stores:[],
        getStore: function () {
            clearTimeout(vm.getStoreTimeout)

            try {
                vm.Store = quickStart.nowStore.StoreID
                //if(vm.Stores.length===0){
                vm.Stores = quickStart.Stores
                //}
            } catch (err) {
                vm.getStoreTimeout = setTimeout(vm.getStore, 300)
            }
        },


        //合成！
        make: function () {
            ws.call({
                i:"Order/Order/combine",
                data:{
                    CombineID:vm.CombineID,
                    Rate:vm.Rate,
                    IsIn:vm.IsIn,
                    StoreID:vm.Store
                },
                success: function (res, err) {
                    if(err){
                        tip.on('合成失败:'+err)
                        return
                    }

                    tip.on('合成成功!')
                    vm.goback()
                }
            })
        },

        //关闭  返回到商品
        goback: function () {
            require(['../../package/goods/info'], function () {
                goodsInfo.ready(goodsInfo.goodsID)
            })
        }


    })
    window[vm.$id] = vm
    return vm
})