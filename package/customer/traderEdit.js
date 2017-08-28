/**
 * Created by mooshroom on 2016/6/16.
 */
define('traderEdit', [
    'avalon',
    'text!../../package/customer/traderEdit.html',
    '../../lib/whatInput/whatInput'
], function (avalon, html, whatInput) {
    var vm = avalon.define({
        $id: "traderEdit",
        ready: function (traderID) {
            /*traderID ==0 添加交易方
             * traderID>0 编辑交易方*/


            layout.subUrl = html
            layout.subOpen()

            if (traderID == 0) {
                layout.rightTitle = "添加交易方";
                vm.nowState = 0;

            } else if (traderID > 0) {
                layout.rightTitle = "编辑交易方";
                vm.nowState = 1;
                vm.getTrader(traderID)
                vm.TraderID = traderID
            }
        },

        reset: function () {
            avalon.mix(vm, {
                traderID: '',
                nowState: 0,
                $old: {},
                New: {
                    Name: "",
                    Type: 0,
                    "Address": "",
                    "Phone": "",
                    Payable: 0,
                    Receivables: 0,
                    IsCue: 1,
                    IsSur: 0,
                    Discount:100,
                },
            })
        },

        TraderID: '',
        nowState: 0,
        $old: {},

        //获取交易方
        getTrader: function (id) {
            //todo 获取交易方填入$old 以及New
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
                    vm.$old = res
                    avalon.mix(vm.New, res)


                }
            })

        },
        //保存
        //添加
        New: {
            Name: "",
            Type: 0,
            "Address": "",
            "Phone": "",
            Payable: 0,
            Receivables: 0,
            IsCue: 1,
            IsSur: 0,
            Discount:100,
        },

        add: function () {
            //todo 这里添加表单的验证

            if (vm.New.Name == "") {
                tip.on('您还没有输入名称！！！')
                return
            }


            function success(res, err) {
                if (err||res==false) {
                    tip.on(err)
                    return
                }
                try {
                    customer.list.unshift(res)
                } catch (err) {}
                try {
                    traderInfo.getTrader(traderInfo.info.TraderID)
                } catch (err) {}

                vm.New = {
                    Name: "",
                    Type: 0,
                    "Address": "",
                    "Phone": "",
                    Payable: 0,
                    Receivables: 0
                }
                vm.addOver()
            }

            if (vm.TraderID > 0) {
                //保存
                var Params = {}
                ForEach(vm.$old, function (el, key) {
                    if (el == vm.New[key]) {
                        return
                    }
                    Params[key] = vm.New[key]
                })

                ws.call({
                    i: "Trader/Trader/save",
                    data: {
                        TraderID: vm.TraderID,
                        Params: Params
                    },
                    success: success,
                })
                return
            }

            //添加
            ws.call({
                    i: "Trader/Trader/add",
                    data: {
                        'Name': vm.New.Name,//单位名称
                        'Receivables': vm.New.Receivables,//期初应收账款
                        'Payable': vm.New.Payable,//期初应付账款
                        'Address': vm.New.Address,//地址
//                                'Memo': vm.New.Name,//备注
                        "IsCue": vm.New.IsCue,//是否为客户
                        "IsSur": vm.New.IsSur,//是否为供应商
                        //'On': 1,//是否开启
                        'Phone': vm.New.Phone//电话
//                                'LandLine': vm.New.Name,//座机
//                                'QQ': vm.New.Name//qq
                    },
                    success: success,
                }
            )

        },
        //取消添加
        addOver: function () {
            vm.New = {
                Name: "",
                Type: 0,
                "Address": "",
                "Phone": ""
            }
            vm.editClose()
        },

        editClose: function () {
            vm.reset()
            layout.subClose()
        },

        //编辑身份
        editType: function (type) {
            var t, c, s;

            t = vm.New
            if (t.IsCue == undefined && t.IsSur == undefined) {

                t.IsCue = 1
                t.IsSur = 0
            }


            if (type == 0) {
                //触发客户的
                c = Number(!t.IsCue)
                s = t.IsSur
            } else if (type == 1) {
                //触发供应商的
                c = t.IsCue
                s = Number(!t.IsSur)
            }

            //设置Type来兼容原来的代码
            if (c == 0 && s == 0) {
                //错误
                return
            } else if (c == 1 && s == 1) {
                t.Type = 2
            } else if (c == 1 && s == 0) {
                t.Type = 0
            } else if (c == 0 && s == 1) {
                t.Type = 1
            }

            //输出
            t.IsCue = c
            t.IsSur = s
        },
    })
    window[vm.$id] = vm
    return vm
})