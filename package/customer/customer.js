/**
 * Created by mooshroom on 2015/8/1 0001.
 *
 * 客户供应商管理模块
 *
 * css共用商品模块的样式
 */
define('customer', [
    'avalon',
    'text!../../package/customer/customer.html',
    'text!../../package/customer/info.html',
    'css!../../package/goods/goods.css',
    'css!../../package/customer/customer.css',
    '../../lib/whatInput/whatInput'
], function (avalon, html, info) {
    var vm = avalon.define({
        $id: "customer",
        ready: function (id) {
            layout.url = html;
            if (id) {
                vm.cusId = id
            }
            else {
                vm.cusId = ""
            }

            if (vm.firstTime) {
                setTimeout(function () {
                    vm.getCus()
                }, 1)

                vm.firstTime = false
            }

            avalon.scan();
        },
        firstTime: true,
        /*显示控制*/
        showBtn: -2,
        showThisBtn: function (i) {
            vm.showBtn = i
        },
        hideThisBtn: function (i) {
            vm.showBtn = -2
        },


        /*控制列表渲染*/
        list: [],

        cusId: "",//客户ID，用户查看详情，详情与列表的切换也是根据这个值，
        P: 0,
        T: 0,
        //获取客户列表
        getCus: function () {
            ws.call({
                i: "Trader/Trader/search",
                data: {
                    //CustomerIDs: [],
                    P: vm.P + 1,
                    N: 48
                },
                success: function (res, err) {
                    if (err||res==false) {
                        tip.on(err)
                        return
                    }

                    vm.P = res.P
                    vm.T = res.T
                    if (res.L != null) {
                        for (var i = 0; i < res.L.length; i++) {
                            vm.list.push(res.L[i])
                        }
                    }
                    else {
                        vm.P = res.P - 1
                        tip.on('没有更多数据了……', 1, 3000)
                    }


                }
            })
        },

        //添加
        traderEdit: function (tid) {
            require(['../../package/customer/traderEdit.js'], function (traderEdit) {
                traderEdit.ready(tid)
            })
        },


        /*详情所用*/
        toInfo: function (i, edit) {
            window.location.href = "#!/customerInfo/" + i
        },

        updateList: function (obj) {
            for (var k = 0; k < vm.list.length; k++) {
                if (vm.list[k].TraderID == obj.TraderID) {
                    //找到更新的数据
                    var target = vm.list[k], x;
                    for (x in obj) {
                        if (x.charAt(0) != '$') {
                            target[x] = obj[x]
                        }
                    }

                    break
                }
            }
        },







    })
    return customer = vm
})