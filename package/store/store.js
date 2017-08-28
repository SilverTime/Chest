/**
 * Created by mooshroom on 2015/8/11.
 */
define('store',
    [
        'avalon',
        'text!../../package/store/store.html',
        'css!../../package/store/store.css',
        '../../lib/whatInput/whatInput'
    ], function (avalon, html, css) {
        var vm=avalon.define({
            $id:"store",
            ready: function () {
                vm.reset()
                layout.url=html;

                setTimeout(function () {
                    vm.getStores(1)
                },500)
                avalon.scan()
            },

            reset: function () {
                avalon.mix(vm,{
                    newName:'',
                    newAdmin:'',
                    newPhone:'',
                    //list:[],
                    editingIndex:-1,//列表中第几个正在被编辑
                    $old:{},
                    StoreStatus:1,
                })
            },

            /*添加*/
            newName:'',
            newAdmin:'',
            newPhone:'',
            timeoutAdd:'',
            addStore: function (test) {

                if(test){
                    clearTimeout(vm.timeoutAdd)
                    setTimeout(go,500)
                    return
                }

                go()

                function go(){
                    if(vm.newName==""){
                        newStoreName.error('库房名称不能为空')
                        return
                    }

                    //检查名称
                    ws.call({
                        i:"Store/Store/checkName",
                        data:{
                            SName:vm.newName,
                        },
                        success: function (res, err) {
                            if(err&&typeof err!='object'){
                                newStoreName.error(err)
                                return
                            }
                            if(res==true){
                                //已存在，不可以使用名称
                                newStoreName.error('库房名称已存在')
                                return
                            }

                            newStoreName.success()

                            if(test){
                                //开玩笑de，现在只是在做验证，并不提交
                                return
                            }

                            //提交
                            ws.call({
                                i:" Store/Store/add",
                                data:{
                                    SName:vm.newName,
                                    CName:vm.newAdmin,
                                    Phone:vm.newPhone,
                                },
                                success: function (res,err) {
                                    if(err){
                                        tip.on(err)
                                        return
                                    }

                                    tip.on("新店铺添加成功！",1,3000);
                                    vm.ready()
                                    quickStart.getStores()
                                }
                            })


                        }

                    })
                }



            },




            /*列表*/
            list:[],
            //获取库房
            getStores: function (disable) {
                ws.call({
                    i:"Store/Store/search",
                    data:{
                        P:1,
                        N:99999999,
                        W:{
                            Status:disable
                        }
                    },
                    success: function (res,err) {
                        if(err){
                            tip.on(err)
                            return
                        }
                        vm.list=res.L
                    }
                })
            },


        //    库房的编辑
            editingIndex:-1,//列表中第几个正在被编辑
            $old:{},
            edit: function (index) {
                vm.editingIndex=index
                vm.$old={}
                avalon.mix(vm.$old,vm.list[index])
            },

            clearEdit: function () {
                //还原值
                avalon.mix(vm.list[vm.editingIndex],vm.$old)

                vm.editingIndex=-1;
                vm.$old={}
            },

            saveEdit: function () {
                //加载字段
                var data={}
                var nameInput=window['editSName'+vm.editingIndex]
                ForEach(vm.list[vm.editingIndex], function (el, key) {
                    //过滤
                    if(key.charAt(0)=="$"){
                        return
                    }

                    //对比变更
                    if(vm.$old[key]==el){
                        return
                    }

                    data[key]=el
                })

                //验证
                if(data.SName==''){
                    nameInput.error('库房名称不能为空')
                    return
                }

                //检查名称
                ws.call({
                    i:"Store/Store/checkName",
                    data:{
                        SName:data.SName
                    },
                    success: function (res, err) {
                        if(err&&typeof err!='object'){
                            nameInput.error(err)
                            return
                        }
                        if(res){
                            //已存在，不可以使用名称
                            nameInput.error('库房名称已存在')
                            return
                        }

                        nameInput.default()



                        //提交
                        ws.call({
                            i:" Store/Store/save",
                            data:{
                                StoreID:vm.list[vm.editingIndex].StoreID,
                                Params:data

                            },
                            success: function (res,err) {
                                if(err){
                                    nameInput.error(err)
                                    return
                                }

                                tip.on("保存成功！",1,3000);
                                vm.ready()
                                quickStart.getStores()
                            }
                        })


                    }

                })
            },

            //禁用和启用
            StoreStatus:1,
            toListType: function (i) {
                vm.StoreStatus = i ? Number(!vm.StoreStatus) : i == "auto"
                vm.getStores(vm.StoreStatus)
            },

            disable: function (id) {
                ws.call({
                    i:"Store/Store/save",
                    data:{
                        StoreID:id,
                        Params:{
                            Status:0
                        }
                    },
                    success: function () {
                        vm.getStores(vm.StoreStatus)
                    }
                })
            },

            enable: function (id) {
                ws.call({
                    i:"Store/Store/save",
                    data:{
                        StoreID:id,
                        Params:{
                            Status:1
                        }
                    },
                    success: function () {
                        vm.getStores(vm.StoreStatus)
                    }
                })
            }

        })
        return window[vm.$id]=vm
    })