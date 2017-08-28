/**
 * Created by mooshroom on 2016/8/5.
 * 草稿箱模块
 * 使用KV存储完成
 * V0.0.1
 */
define('billDraft',[
    'avalon',
    'text!../../package/bill/billDraft.html',
    'css!../../package/bill/bill.css',
    '../../lib/pager/pager.js'
], function (avalon, html, css) {
    var vm=avalon.define({
        $id:'billDraft',
        ready: function (i) {
            //解析参数
            /*
             * 可能的参数格式:P&&type&&listType
             * */
            var params = String(i).split("&&")

            if(params.length<3){
                console.log('参数传入错误')
                goto('#!/'+vm.$id+'/1&&0&&0')
                return
            }

            vm.reset(params)

            vm.getDrafts()
        },
        reset: function (params) {
            layout.url = html
            layout.rightShowing = false
            avalon.mix(vm,{
                P:params[0],
                nowBillType:params[1],
                listType:params[2]
            })
        },

        //变量
        billType:['全部草稿','采购入库', '采购退货', '销售出库', '销售退货', '报损', '盘存', '调拨'],
        nowBillType:0,
        //修改类型
        changeType: function (i) {
            vm.nowBillType=i

            goto('#!/'+vm.$id+'/'+vm.buildListParams(1,vm.nowBillType,vm.listType))
        },

        list:[],
        P:1,
        N:16,

        //分页配置
        $paper: {
            id: "DraftListP",
            N: 16,
            showPage: 6,
            getList: function (p) {
                goto('#!/'+vm.$id+'/'+vm.buildListParams(p,vm.nowBillType,vm.listType))
            }
        },


        //查看我的和全部的相关 0,只看我的，1，看全部的
        listType: 0,
        toListType: function (i) {
            //vm.listType = i ? Number(!vm.listType) : i == "auto"

            if(i=='auto'||i==undefined){
                vm.listType=Number(!Number(vm.listType))
            }else{
                vm.listType=i
            }

            goto('#!/'+vm.$id+'/'+vm.buildListParams(1,vm.nowBillType,vm.listType))
        },


        buildListParams: function (p,t,k) {
            var params = [p,t,k]
            return params.join("&&")
        },

        //获取草稿箱
        getDrafts: function () {
            var data={
                P:vm.P,
                N:vm.N,
                W:{}
            }
            var needW=false
            if(vm.nowBillType>0){
                data.W.Type=vm.nowBillType-1
                needW=true
            }
            if(vm.listType==0){
                data.W.UID=cache.go('uid')
                needW=true
            }
            if(!needW){
                data.W=undefined
            }
            //发起请求
            ws.call({
                i:"Order/Draft/search",
                data:data,
                success: function (res, err) {
                    if(err){
                        return console.log(err)
                    }
                    vm.list=res.L
                    vm.P=res.P
                    vm.T=res.T
                    DraftListP.build(res.P,res.T)

                }
            })

        },

        //更新草稿箱
        saveDraft: function (draft,Type,ID,callback) {
            //转换为字符串
            var dr=JSON.stringify(draft)
            //构建请求参数
            var data={
                Draft:dr,
                Type:Type
            }


            //验证
            if(data.Type==undefined){
                tip.on('未传入草稿类型')
                return
            }



            //判断是编辑还是添加
            var i=''
            var d={}
            if(ID>0){
                i="Order/Draft/save"
                d={
                    DraftID:ID,
                    Params: {
                        Draft: dr
                    }
                }
            }else{
                i="Order/Draft/add"
                d=data
            }


            //编辑
            ws.call({
                i:i,
                data:d,
                success: function (res, err) {
                    if(err){
                        console.log(err)
                        return
                    }
                    try{
                        callback(res)
                    }
                    catch(err){}

                }
            })



        },

        //删除草稿箱
        del: function (DraftID) {
            ws.call({
                i:"Order/Draft/del",
                data:{
                    DraftID:DraftID
                },
                success: function (res,err) {
                    if(err){
                        tip.on(err)
                        return
                    }

                   vm.ready(vm.buildListParams(vm.P,vm.nowBillType,vm.listType))
                }
            })
        },

        //继续编辑账单
        $readyDraft:{},
        $readyDID:"",
        goOn: function (index) {
            var d=vm.list[index]
            vm.$readyDraft= d.Draft
            vm.$readyDID= d.DraftID
            goto('#!/bill/'+d.Type+"&&draft")
        },
        loadDraft: function () {
            avalon.mix(bill,JSON.parse(vm.$readyDraft))
            vm.$readyDraft={}
            bill.draftID=vm.$readyDID
        }




    })

    window[vm.$id]=vm
    return vm
})
