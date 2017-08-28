/**
 * Created by Administrator on 2015/7/27 0027.
 */
define('goods', [
    'avalon',
    'text!../../package/goods/goods.html',
    'text!../../package/goods/info.html',
    'css!../../package/goods/goods.css'
], function (avalon, html, info, css) {
    var vm = avalon.define({
        $id: "goods",
        ready: function (id) {
            /*以下这句话会改变HTML*/

            layout.url = html;
            if (id) {
                vm.GoodsId = id;
                vm.computeIndex();
            }
            else {
                vm.GoodsId = -1
            }
//            avalon.scan()

            if (vm.firstTime) {
                vm.list = [];
                vm.P = 0;
                vm.T = 0;
                setTimeout(function () {
                    vm.getGoods()
                }, 1)

                vm.firstTime = false
                vm.className = "选择类型"
            }
            /* else {
             vm.list = [];
             vm.P = 0;
             vm.T = 0
             }*/

            //vm.getClass()
            vm.$watch('Keyword',function () {
                clearTimeout(vm.keyTimeout)
                vm.keyTimeout=setTimeout(function () {
                    vm.list=[]
                    vm.P=0
                    vm.T=0
                    vm.getGoods()
                },500)
            })
        },
        keyTimeout:"",

        firstTime: true,
        /*显示控制*/
        showBtn: -2,
        showThisBtn: function (i) {
            vm.showBtn = i
        },
        hideThisBtn: function (i) {
            vm.showBtn = -2
        },


        /*控制商品列表渲染*/
        list: [],
        Keyword:"",
        GoodsId: 0,//商品ID，用户查看商品详情，商品详情与列表的切换也是根据这个值，
        P: 0,
        T: 0,
        N: 48,
        //获取商品列表
        getGoods: function () {

            var data = {
                //GoodsIDs: [],
                Keyword:vm.Keyword,
                P: vm.P + 1,
                N: vm.N,
                W: {
                    Disable: vm.listType
                }
                //
            }



            if(vm.checked.length>0){
                data.W.CID=vm.checked
            }
            ws.call({
                i: "Goods/Goods/search",
                data: data,
                success: function (res, err) {
                    if (!res.err) {
                        vm.P = res.P
                        vm.T = res.T
                        if (res.L.length > 0) {
                            for (var i = 0; i < res.L.length; i++) {
                                vm.list.push(res.L[i])
                                console.log(res.L[i].Disable + res.L[i].Name)
                            }
                        }
                        else {
                            vm.P = res.P - 1
                            tip.on('没有更多数据了……', 1, 3000)
                        }

                    }
                    else {
                        console.log(res)
                    }
//console.log(vm.list[0].Prices[0].Price)
//console.log(vm.list[0].TotalStock)    库存传入参数

                }
            })
        },


        //更新列表中的某一条数据
        updateGoods: function (goods) {
            for (var k = 0; k < vm.list.length; k++) {
                if (vm.list[k].GoodsID == goods.GoodsID) {
                    //找到更新的数据
                    var target = vm.list[k], x;
                    for (x in goods) {
                        if (x.charAt(0) != '$') {
                            target[x] = goods[x]
                        }
                    }

                    break
                }
            }
        },

        //商品启用禁用相关
        listType: 0,
        toListType: function (i) {
            vm.listType = i ? Number(!vm.listType) : i == "auto"

            if (i == 'auto') {
                vm.list = []
                vm.P = 0
                vm.T = 0
                vm.getGoods()

            }
        },
        changeState: function (i, GoodsID, index) {
            ws.call({
                i: "Goods/Goods/save",
                data: {
                    GoodsID: GoodsID,
                    Params: {
                        Disable: i
                    }
                },
                success: function (res, err) {
                    if (err || res == false) {
                        return
                    }
                    vm.list[index].Disable = i

                }

            })
        },


        //跳转商品详情
        toInfo: function (i) {

            require(['../../package/goods/info'], function (info) {
                info.ready(i)
            })

            vm.showClass = false


        },

        //跳转商品列表？？这不就是列表了？
        toList: function () {
            window.location.href = "#!/goods"
            vm.showClass = false
        },
        buildInfo: function (obj) {
            var poto = obj
            var x;
            var a = {};
            for (x in poto) {
                if (x.charAt(0) != '$') {
                    a[x] = poto[x]
                }
            }
            vm.info = a


        },

        //构建价格
        infoPrices: [
            {
                Name: "加权成本",
                Type: 0,
                Price: "未设置"
            },
            {
                Name: "标准售价",
                Type: 1,
                Price: "未设置"
            },
            {
                Name: "会员售价",
                Type: 2,
                Price: "未设置"
            }
        ],
        buildPrices: function (obj) {
            var poto = obj.Price || null;
            if (poto != null) {

                var readyPoto = {}

                //构建价格，进价为 price0，标价为price1，会员价为price2
                for (var i = 0; i < poto.length; i++) {
                    readyPoto = poto[i];
                    if (readyPoto.Type == 0) {
//                        readyPoto.Name="加权成本"
                        vm.infoPrices[0].Price = readyPoto.Price
                    }
                    else if (readyPoto.Type == 1) {
//                        readyPoto.Name="标准售价"
                        vm.infoPrices[1].Price = readyPoto.Price
                    }
                    else if (readyPoto.Type == 2) {
//                        readyPoto.Name="会员售价"
                        vm.infoPrices[2].Price = readyPoto.Price
                    }


                }
            }


        },


        //库存
        infoStore: [],
        thisStoreTotal: 0,
        buildStore: function () {
            var nowStore = quickStart.nowStore;

            try {
                if (vm.info.Store == undefined) {
                    return;
                }
            } catch (err) {
                return;
            }


            vm.infoStore = vm.info.Store
            var finded = false
            //循环查找
            for (var i = 0; i < vm.infoStore.length; i++) {

                if (vm.infoStore[i].StoreID == nowStore.StoreID) {
                    vm.thisStoreTotal = vm.infoStore[i].Amount
                    finded = true
                    break
                }
            }
            if (!finded) {
                //这是最后一个而且还没有找到
                vm.thisStoreTotal = 0
            }

        },


        /*开单快捷*/
        toBill: function (type) {
            quickStart.start(type)
            bill.getGoodsCarList([vm.info.GoodsID])
        },
        //列表上面的入库
        toBillPur: function (goods) {
            quickStart.start("0")
            bill.getGoodsCarList([vm.info.GoodsID])
        },


        /*商品类别操作*/
        className: "选择类型",
        classID: '',
        classList: [],
        showClass: false,
        letShowClass: function () {
            if (vm.showClass) {
                vm.showClass = false
            }
            else {
                vm.showClass = true

                if (vm.classList.length == 0) {
                    vm.getClass()
                }
            }
            vm.classEditing = false
        },
        getClass: function () {
            ws.call({
                i: "Goods/Class/search",
                data: {
                    P: 1,
                    N: 9999
                },
                success: function (res, err) {

                    if (err) {
                        tip.on('商品分类获取失败：' + err)
                        return
                    }

                    ForEach(res.L, function (el) {
                        el.check = false
                    })

                    vm.classList = res.L


                }
            })

        },

        //新加分类
        newClassName: '',
        addClass: function () {

            if(vm.newClassName==''){
                return
            }

            ws.call({
                i: "Goods/Class/add",
                data: {
                    Name: vm.newClassName,
                    ParentID: 0
                },
                success: function (res, err) {

                    if (err) {
                        console.log(res)
                        tip.on('分类添加失败')
                        return
                    }

                    tip.on('分类添加成功！', 1)
                    res.check = false
                    vm.classList.unshift(res)
                    vm.newClassName = ''

                }
            })

            vm.newClassName=''
        },

        //根据分类获取商品

        byClass: function (id, index) {
            vm.classList[index].check = !vm.classList[index].check
            vm.getGoodsByChecked()
        },

        resetClass: function () {
            ForEach(vm.classList, function (el) {
                el.check = false
            })
            vm.getGoodsByChecked()
        },

        checked: [],
        getGoodsByChecked: function () {
            var checklist=[]
            vm.classList.forEach(function (el) {
                if(el.check){
                    checklist.push(el.CID)
                }
            })

            if(checklist.length>0){
                vm.checked=['and',checklist]
            }else{
                vm.checked=[]
            }

            vm.list=[]
            vm.P=0
            vm.getGoods()
        },

        //分类的编辑和删除
        classEditing: false,
        toggleEdit: function () {
            if (vm.classEditing) {
                vm.classEditing = false
            }
            else {
                vm.classEditing = true
            }
        },


        CEindex: -1,
        editingName: "",
        toEdit: function (index) {
            vm.CEindex = index
            vm.editingName = vm.classList[index].Name
        },
        closeCE: function () {
            vm.CEindex = -1
            vm.editingName = ""
        },
        editingID: "",
        saveClass: function (index) {
            if (vm.classList[index].CID > 0) {
                ws.call({
                    i: "Goods/Class/save",
                    data: {
                        CID: vm.classList[index].CID,
                        Params: {
                            Name: vm.editingName
                        }
                    },
                    success: function (res, err) {
                        if (err) {
                            tip.on("修改出错，请重新尝试……")
                            console.log(res)
                            return
                        }

                        tip.off("修改出错，请重新尝试……")
                        tip.on("修改成功", 1, 300)
                        vm.getClass()
                        vm.CEindex = -1

                    }
                })
            } else {
                tip.on("修改出错，请重新尝试……")
                vm.classList = []
                //vm.getClass()
                vm.CEindex = -1
            }

        },
        delClass: function (index) {
            ws.call({
                i: "Goods/Class/del",
                data: {
                    CID: vm.classList[index].CID
                },
                success: function (res, err) {


                    if (res) {
                        tip.on("删除成功", 1, 3000)
                        vm.getClass()
                    }
                    else {
                        tip.on("删除失败")
                    }

                }
            })
        },


        curListIndex: 0,
        computeIndex: function () {
            for (var i = 0; i < vm.list.length; i++) {
                if (vm.list[i].GoodsID == vm.GoodsId) {
                    vm.curListIndex = i;
                    break;
                }
            }
        },
        lookLastGood: function () {
            var i = 0;
            if (vm.curListIndex > 0) {
                vm.curListIndex--;
                i = vm.list[vm.curListIndex].GoodsID;

                vm.toInfo(i);
            }
        },
        lookNextGood: function () {
            var i = 0;
            if (vm.curListIndex < vm.list.length - 1) {
                vm.curListIndex++;
                i = vm.list[vm.curListIndex].GoodsID;

                vm.toInfo(i);
            }
        },


        /*以下是从订单查看商品的逻辑*/
        DDIndex: 0,
        computeDDIndex: function () {
            for (var i = 0; i < vm.infoGoo.length; i++) {
                if (vm.infoGoo[i].GoodsID == vm.GoodsId) {
                    vm.DDIndex = i;
                    break;
                }
            }
        },
        lookLastDD: function () {
            console.log("--------------------------上一个订单的商品")
            var i = 0;
            if (vm.DDIndex > 0) {
                vm.DDIndex--;
                vm.GoodsId = vm.infoGoo[vm.DDIndex].GoodsID;

                vm.info = vm.infoGoo[vm.DDIndex];
            }
        },
        lookNextDD: function () {
            console.log("--------------------------下一个订单的商品")
            var i = 0;
            if (vm.DDIndex < vm.infoGoo.length - 1) {
                vm.DDIndex++;
                vm.GoodsId = vm.infoGoo[vm.DDIndex].GoodsID;

                vm.info = vm.infoGoo[vm.DDIndex];
            }
        },
        infoGoo: [],
        getInfo: function (id) {
            vm.infoGoo = [];
            ws.call({
                i: "Order/get",
                data: {
                    OrderIDs: [id],
                    P: 1,
                    N: 20
                },
                success: function (res, err) {
                    if (!res.err) {
                        console.log("--------------------\\\\\\\\\\\\\\\\\\========");
                        console.log(res);

                        //获取订单内商品列表
                        var l = res.L[0].Goods;
                        for (var x in l) {
                            vm.infoGoo.push(l[x]);
                        }
                    } else {
                        console.log(res.err)
                    }
                }
            });
        },
        /*备选商品的上下一个商品*/
        GCIndex: "",
        computeGCIndex: function () {
            for (var i = 0; i < layout.goodsCarList.length; i++) {
                if (layout.goodsCarList[i].GoodsID == vm.GoodsId) {
                    vm.GCIndex = i;
                    break;
                }
            }
        },
        lookLastGCar: function () {
            console.log("------------备选商品--------------上一个订单的商品")
            var i = 0;
            if (vm.GCIndex > 0) {
                vm.GCIndex--;
                vm.GoodsId = layout.goodsCarList[vm.GCIndex].GoodsID;

                vm.info = layout.goodsCarList[vm.GCIndex];
            }
        },
        lookNextGCar: function () {
            console.log("-------------备选商品-------------下一个订单的商品")
            var i = 0;
            if (vm.GCIndex < layout.goodsCarList.length - 1) {
                vm.GCIndex++;
                vm.GoodsId = layout.goodsCarList[vm.GCIndex].GoodsID;

                vm.info = layout.goodsCarList[vm.GCIndex];
            }
        },
        //加入备选商品车
        addToCar: function (index) {
            /*防止重复*/

            require(['../../package/goods/selected'], function () {
                selected.ready()
                for (var i = 0; i < selected.goodsCarList.length; i++) {
                    if (selected.goodsCarList[i].GoodsID == vm.list[index].GoodsID) {
                        return;
                    }
                }
                selected.newSelected(vm.list[index].GoodsID)
            })

        },

        //添加商品以及编辑商品
        toGoodsEdit: function (GoodsID) {
            require(['../../package/goods/goodsEdit'], function (goodsEdit) {
                goodsEdit.ready(GoodsID)
            })
        }
    });
    return goods = vm;
});