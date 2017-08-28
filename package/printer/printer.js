/**
 * Created by mooshroom on 2016/12/7.
 */
define('printer', [
    'avalon',
    'text!../../package/printer/printer.html',
    'css!../../package/printer/printer.css'
], function (avalon, html, css) {
    var vm = avalon.define({
        $id: "printer",
        ready: function (i) {
            vm.reset()
            layout.url = html
            layout.rightShowing = false

            vm.getPrintConfig(1)

        },
        reset: function () {
            avalon.mix(vm, {
                list: [],
                P: 1,
                T: 0,
                Type: '',
            })
        },

        //获取打印配置列表
        list: [],
        P: 1,
        N: 12,
        T: 0,
        Type: '',
        getPrintConfig: function (p) {
            var data = {
                P: p,
                N: vm.N,

            }

            if (vm.Type !== '') {
                data.W = {}
                data.W.Type = vm.Type
            }

            ws.call({
                i: "Order/Print/search",
                data: data,
                success: function (res, err) {
                    if (err) {
                        return tip.on(err)
                    }

                    vm.list = vm.list.concat(res.L)
                    avalon.mix(vm, {
                        P: res.P,
                        T: res.T
                    })
                }
            })
        },

        //切换订单类型
        $Types: {
            "2": '销售出库',
            "3": '销售退货',
            "0": '采购入库',
            "1": '采购退货',
            "6": '调拨单',
            "4": '报损单',
            "5": '盘存单',
            11: '销售报价单',
            12: "租赁出库",

        },
        setType: function (i) {
            if(vm.Type==i){
                vm.Type=''
            }else{
                vm.Type=i
            }

            vm.list=[]
            vm.getPrintConfig(1)
        },


        //    打开来打印配置添加窗口
        gotoEdit: function (i) {
            require(['../../package/printer/EditPrinter.js'], function (that) {
                that.ready(i)
            })
        }
    })

    return window[vm.$id] = vm
})