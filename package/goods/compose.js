/**
 * Created by Chris Chang on 2016/6/15.
 */
define('compose', [
    'avalon',
    'text!../../package/goods/compose.html',
    '../../lib/whatInput/whatInput'
], function (avalon, html) {
    var vm = avalon.define({
        $id: "compose",
        ready: function (CombineID) {
            layout.subUrl = html
            layout.subOpen()
            layout.rightTitle = "合成公式";

            if(CombineID>0){
                //编辑de初始化逻辑
                vm.CombineID=CombineID
                vm.fill(CombineID)
                return
            }

            vm.addCompose('Left');
            vm.addCompose("Right")

        },
        reset: function () {
            avalon.mix(vm,{
                CombineID: "",
                CombineName:"",
                //左侧合成公式
                ComposeLeft: [],
                //右侧合成公式
                ComposeRight: [],
                focusing:[0,-1],//[x,y] x==0 则为左边的，x==1 则为右边的，y为第几个
            })
        },
        CombineID: "",
        CombineName:"",

        $goods:{
            GoodsID:"",
            Name:"",
            Amount:1,
            UnitName:"",
            Model:"",
            Standard:""
        },
        //左侧合成公式
        ComposeLeft: [],
        //右侧合成公式
        ComposeRight: [],
        addCompose: function (side) {
            vm['Compose'+side].push(vm.$goods)
        },
        //删除一项
        delCompose: function (side,$index) {
            vm['Compose'+side].splice($index,1)
            if(vm['Compose'+side].length==0){
                vm.addCompose(side)
            }
        },

        //close 关闭
        close: function () {
            vm.reset()

            try{
                goodsInfo.ready(goodsInfo.goodsID)
            }catch (err){
                layout.subClose()
            }
        },

    //    搜索
        focusing:[0,-1],//[x,y] x==0 则为左边的，x==1 则为右边的，y为第几个
        focus: function (x, y) {
            vm.focusing=[x,y]
        },


        //编辑公式的填入
        fill: function (id) {
            //获取
            ws.call({
                i:"Store/Combine/get",
                data:{
                    CombineID:id,
                },
                success: function (res, err) {
                    if(err){
                        tip.on(err)
                        return
                    }
                    vm.CombineName=res.Name
                    ForEach(res.In, function (el,i) {
                        vm.addCompose('Left')
                        avalon.mix(vm.ComposeLeft[i],el)
                    })
                    ForEach(res.Out, function (el,i) {
                        vm.addCompose('Right')
                        avalon.mix(vm.ComposeRight[i],el)
                    })
                }
            })
        },

        //提交逻辑
        save: function () {
            // 加载数据
            var d={
                Name:vm.CombineName,
                In:[],
                Out:[]
            }

            //验证
            if(d.Name==''){
                composeName.error('还未填入公式名称')
                return
            }

            var composes=[
                vm.ComposeLeft,
                vm.ComposeRight
            ]

            //加载in out
            var sideName=['Left','Right']
            var io=[
                [],
                []
            ]

            //填入商品
            var error=false
            ForEach(composes, function (el,o) {
                ForEach(el, function (al,i) {
                    if(al.GoodsID==''&&al.Name==""){
                       return
                    }

                    if(al.GoodsID==''&&al.Name!=""){
                        window['goodsName'+sideName[o][0]+i].warning("没有正确选择商品")
                        error=true
                        return
                    }

                    var g={
                        GoodsID:al.GoodsID,
                        Amount:al.Amount
                    }
                    io[o].push(g)

                })
            })

            if(error){
                return
            }

            if(io[0].length==0){
                goodsNameL0.error('没有正确选择任何商品')
                return
            }
            if(io[1].length==0){
                goodsNameR0.error('没有正确选择任何商品')
                return
            }

            //验证完毕，开始保存
            d.In=io[0]
            d.Out=io[1]
            if(vm.CombineID>0){
                //编辑的逻辑
                ws.call({
                    i:"Store/Combine/save",
                    data:{
                        CombineID:vm.CombineID,
                        Params:d
                    },
                    success: function (res,err) {
                        if(err){
                            tip.on(err)
                            return
                        }

                        tip.on('保存成功！',1)
                        vm.close()
                    }
                })
                return
            }

            //添加的逻辑
            ws.call({
                i:"Store/Combine/add",
                data:d,
                success: function (res,err) {
                    if(err){
                        tip.on(err)
                        return
                    }

                    tip.on('保存成功！',1)
                    vm.close()
                }
            })

        }

    });
    window[vm.$id] = vm
    return vm
})