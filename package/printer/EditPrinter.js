/**
 * Created by mooshroom on 2016/12/7.
 */
define('EditPrinter',[
    'avalon',
    'text!../../package/printer/EditPrinter.html',
    'css!../../package/printer/printer.css'
], function (avalon, html, css) {
    var vm=avalon.define({
        $id:"EditPrinter",
        ready: function (i) {
            vm.reset(i)
            layout.subUrl = html
            layout.subOpen()

            if(i==0){
                layout.rightTitle="新建配置";


            }else if(i>0){
                layout.rightTitle="编辑配置";
                vm.getOld(i)
            }
        },
        TID:"",
        reset: function (i) {
            avalon.mix(vm,{
                TID:i,
                info:{
                    TID:"",
                    Title:"",
                    Type:"",
                    Content:"",
                },
            })
        },

        //订单类型
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
            13: '租赁入库',

        },

        info:{
            TID:"",
            Title:"",
            Type:"",
            Content:"",
        },
        //获取原有的配置
        getOld: function (i) {
            ws.call({
                i:"Order/Print/Get",
                data:{TID:i},
                success: function (res,err) {
                    if(err){
                        return tip.on(err)
                    }

                    vm.info=res
                }
            })
        },

        //保存修改
        save: function () {
            var data={
                Title:"",
                Type:"",
                Content:"",
            }
            ForEach(data, function (el, key) {
                data[key]=vm.info[key]
            })
            data.Status=1

            //验证数据
            var checkMast={
                Title:"配置标题",
                Type:"订单类型",
                Content:"代码",
            }
            for(var x in checkMast){
                if(data[x]==''){
                    return tip.on(checkMast[x]+"不能为空")
                }
            }

            if(vm.TID>0){
                //为保存使用save接口
                ws.call({
                    i:"Order/Print/save",
                    data:{
                        TID:vm.TID,
                        Params:data
                    },
                    success: function (res,err) {
                        if(err){
                            return tip.on(err)
                        }

                        tip.on('保存成功',1)
                        printer.ready()
                    }
                })
                return
            }

            //为新建，使用add接口
            ws.call({
                i:"Order/Print/add",
                data:data,
                success: function (res,err) {
                    if(err){
                        return tip.on(err)
                    }

                    tip.on('保存成功',1)
                    printer.ready()
                }
            })

        },

        //取消
        close: function () {
            layout.subClose()
        }

    })

    return window[vm.$id]=vm
})