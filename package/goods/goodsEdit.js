/**
 * Created by mooshroom on 2016/5/6.
 */
define('goodsEdit',[
    'avalon',
    'text!../../package/goods/goodsEdit.html',
    '../../lib/whatInput/whatInput',
    '../../lib/fileuploader/fileuploader'
], function (avalon, html) {
    var vm=avalon.define({
        $id:"goodsEdit",
        ready: function (GoodsID) {
            /*GoodsID ==0 添加商品
            * GoodsID>0 编辑商品*/


            layout.subUrl = html
            layout.subOpen()

            if(GoodsID==0){
                layout.rightTitle="添加商品";
                vm.nowState=0;

            }else if(GoodsID>0){
                layout.rightTitle="编辑商品";
                vm.nowState=1;
                vm.getGoods(GoodsID)
                vm.GoodsID=GoodsID
            }

            //vm.getClass()

        },
        GoodsID:'',
        //重置数据
        reset: function () {
            avalon.mix(vm,{
                GoodsID:'',
                nowState:0,
                New: {
                    Name: '',//必填
                    Disable:0,//是否启用
                    PinYin: '',//可选 商品拼音
                    Number: '',//商品号，可选
                    Standard: '',//规格 可选
                    UnitName : '',//单位 可选
                    BarCode: '',//条码 可选
                    Model: '',//型号
                    Price1: '',//标价
                    Price0:'',//成本
                    Price3:"",//租赁
                    Max:"",//库存最大值
                    Min:"",//库存最小值
                    Virtual:0,//是否虚拟商品
                    Memo:'',//商品备注
                    TotalStock:'',//初始库存
                    CID :"",
                    URL:'',
                },

                className:"",
                Class:[
                    {
                        Name:"",
                        CID:''
                    }
                ],
            })
        },

        $old:{},

        //获取商品信息
        getGoods: function (GoodsID) {
            //todo 查找商品的方法
            ws.call({
                i: "Goods/Goods/get",
                data: {
                    GoodsID: GoodsID,
                },
                success: function (res,err) {
                    if(err){
                        tip.on(err)
                        return
                    }


                    //如果商品没有 初始化租赁价格，则初始化租赁价格之后重置该模块
                    if(res.Prices.T3==undefined){
                        P3Init(vm.GoodsID,res.Prices.T1.Price, function () {
                            vm.ready(vm.GoodsID)
                        })
                        //return
                    }


                    vm.$old=res//记录旧的
                    avalon.mix(vm.New,res)
                    vm.Class=[]
                    ForEach(res.Class, function (el) {

                        vm.Class.push({
                            CID:el.CID,
                            Name:el.Name,
                        })
                    })

                    try{
                        vm.New.Price1=res.Prices.T2.Price
                        vm.New.Price3=res.Prices.T3.Price
                    }catch (err){}


                }
            })
        },

        nowState:0,
        //数据容器
        New: {
            Name: '',//必填
            Disable:0,//是否启用
            //PinYin: '',//可选 商品拼音
            Number: '',//商品号，可选
            Standard: '',//规格 可选
            UnitName : '',//单位 可选
            BarCode: '',//条码 可选
            Model: '',//型号
            Price1: '',//标价
            Price0:'',//成本
            Price3:"",//租赁
            //Price4:"",//未回本租赁
            //Price5:"",//已回本租赁
            Max:"",//库存最大值
            Min:"",//库存最小值
            Virtual:0,//是否虚拟商品
            Memo:'',//商品备注
            TotalStock:'',//初始库存
            CID :[],
            URL:'',
        },

        //保存商品信息
        save: function () {
            //加载
            var data={}
            ForEach(vm.New, function (el,key) {
                if(key.charAt(0)!="$"){
                    data[key]=el
                }
            })




            //验证
            //(function checkupname(){
            //    CheckUp(vm.New.Name,'userName','goodsName')
            //})();

            if(data.Name==''){
                goodsName.error('商品名称不能为空')
                return
            }
            console.log("商品名称！！！！！！！！！！！！！！！！！！")
            console.log(data.Name)

            if(data.UnitName==''){
                goodsUnit.error('商品单位不能为空')
                return
            }

            data.TotalStock=Number(vm.New.TotalStock);
            //加载价格
            var prices=[];
            if(data.Price0===''){
                data.Price0=0;
            }
            if(data.Price1===''){
                data.Price1=0;
            }
            if(data.Price3===''){
                data.Price3=0
            }
            //if(data.Price4===''){
            //    data.Price4=0
            //}
            //if(data.Price5===''){
            //    data.Price5=0
            //}

            console.log(data.Price0)
            //if(data.Price0!==''){
                //成本加载
                prices.push({
                    Price:data.Price0,
                    TypeID:1//1是成本价，2是标价
                })
            //}
            //if(data.Price1!==''){
                //标价加载
                prices.push({
                    Price:data.Price1,
                    TypeID:2//1是成本价，2是标价
                })
            //}

            //if(data.Price1!==''){
            //租赁价格加载
            prices.push({
                Price:data.Price3,
                TypeID:3//1是成本价，2是标价
            })
            //}
            if(prices.length>0&&vm.nowState==0){
                data.Prices=prices
                console.log(data.Prices)
            }


            //检擦是否有新分类
            for(var i= 0;i<vm.Class.length;i++){
                if(vm.Class[i].CID==''&&vm.Class[i].Name!=''){
                    ws.call({
                        i:"Goods/Class/add",
                        data:{
                            Name:vm.Class[i].Name
                        },
                        success: function (res,err) {
                            if(err){
                                tip.on(err)
                                return
                            }

                            ForEach(vm.Class, function (el) {
                                if(el.Name==res.Name){
                                    el.CID=res.CID
                                }
                            })

                            vm.save()
                        }
                    })
                    return
                }
            }

            //加载分类
            var CID=[]
            ForEach(vm.Class, function (el) {
                if(el.CID>0){
                    CID.push(el.CID)
                }
            })

            data.CID=CID




            if(vm.nowState==0){
                //添加商品 调用add
                ws.call({
                    i:"Goods/Goods/add",
                    data:data,
                    success: function (res,err) {
                        console.log(res)
                        if (err||res==false) {
                            tip.on(res.err)
                            return
                        }

                        tip.on('添加成功',1)
                        vm.reset()
                        console.log(res.Prices[0])
                        //更新列表
                        vm.uploadGoodsList(res)
                        vm.close()
                    }
                })


                return
            }
            if(vm.nowState==1){
                var Params={}
                //变更检测
                ForEach(vm.New, function (val, key) {

                    if(typeof data[key]=="object"){
                        //判断对象是否相等(不判断了，对象就直接丢进去)
                        Params[key]=data[key]
                    }else{
                        //检测一般字段是否相等
                        if(data[key]==vm.$old[key]||vm.$old[key]==undefined){
                            return
                        }


                        Params[key]=data[key]
                    }
                })

                //Params.CID=CID

                //编辑商品 调用save
                ws.call({
                    i:"Goods/Goods/save",
                    data:{
                        GoodsID:vm.GoodsID,
                        Params:Params,
                    },
                    success: function (res,err) {
                        if (err||res==false) {
                            tip.on(res.err)
                            return
                        }

                        tip.on('编辑成功',1);

                        [
                            {
                                TypeID:2,
                                Price:data.Price1
                            },
                            {
                                TypeID:3,
                                Price:data.Price3
                            },
                            //{
                            //    TypeID:4,
                            //    Price:data.Price4
                            //},
                            //{
                            //    TypeID:5,
                            //    Price:data.Price5
                            //},
                        ].forEach(function (el) {
                            //修改标价
                            ws.call({
                                i:"Store/GoodsPrice/save",
                                data:{
                                    GoodsID:vm.GoodsID,
                                    Params:el
                                },
                                success: function (res2,err) {
                                    if(err){
                                        tip.on('价格保存失败'+err)
                                        return
                                    }

                                    //vm.reset()

                                    //更新列表
                                    //vm.uploadGoodsList(res)

                                    require(['../../package/goods/goods.js'], function (goods) {
                                        goods.toInfo(res.GoodsID)
                                    })
                                }
                            })
                        })




                    }

                })

                return
            }

        },

        //更新商品列表
        uploadGoodsList: function (g) {
           try{
              goods.list.unshift(g);
           } catch (err){}
        },

        //商品分类

        Class:[
            {
                Name:"",
                CID:''
            }
        ],

        //记录当前聚焦的分类输入框，待会会往这个输入框填充分类
        classFocusing:'',
        classFocus: function (index) {
            vm.classFocusing=index
        },

        //添加一项
        addClassInput: function () {
            vm.Class.push({
                Name:"",
                CID:""
            })
        },

        //删除一项
        delClassInput: function ($index) {
            vm.Class.splice($index,1)
        },


        //close 关闭编辑商品
        close: function () {
            vm.reset()
            layout.subClose()
        },

        //填充分类到当前聚焦的输入框，在动态搜索组件的 callback函数内调用，见my.html:814
        fillClass: function (Class) {
            avalon.mix(vm.Class[vm.classFocusing],Class)
        },
        $optGoodsPic:{
            id:"goodsEditPic",
            //获取上传验证的函数
            getSign: function (callback) {
                //将在组件的$ready()中调用,
                //todo 必须在callback中传入sign（上传签名）
                ws.call({
                    i:"User/User/sign",
                    data:{},
                    success: function (res) {
                        callback(res.Sign)
                    }
                })
            },

            /*回调函数 必须*/

            //上传失败的回调函数
            error: function (res,err) {

            },
            success: function (file, res) {
                console.log(file)
                vm.New.URL=res[0].Domain
            },
        }

    })
    window[vm.$id]=vm
    return vm
})