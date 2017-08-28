/**
 * Created by Administrator on 2015/6/28 0028.
 */
define('nav', ['avalon'], function () {
    var vm = avalon.define({
        $id: "nav",
        ready: function () {
//        nav.getMap()
            console.log("导航加载完成")
        },

        //高亮当前
        now: -1,
        toNow: function (i) {
            vm.now = i
        },

        checkNow: function (en) {
            for (var i = 0; i < vm.navList.length; i++) {
                if (vm.navList[i].en == en) {
                    vm.toNow(i)
                    break
                }
            }
        },
        //获取导航项目
        navList: [
            /*{
                "en": "all",
                "zh": "总账记录",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-home icon-large"></i>'
            },
            {
                "en": "search",
                "zh": "订单查询",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-search icon-large"></i>'
            },*/
            {
                "en": "order",
                "zh": "单据管理",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-desktop "></i>'
            },
            {
                "en": "goods",
                "zh": "商品管理",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-inbox "></i>'
            },
            {
                "en": "customer",
                "zh": "交易方",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-user "></i>'
            },

            {
                "en": "store",
                "zh": "门店管理",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-truck "></i>'
            },
            {
                "en": "addUp",
                "zh": "报表中心",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-bar-chart "></i>'
            },
            {
                "en": "member",
                "zh": "企业账户",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-key "></i>'
            },
            {
                "en": "printer",
                "zh": "打印设置",
                "info": "",
                "html": "",
                "js": "",
                "css": "",
                icon: '<i class="icon-print "></i>'
            }

        ],
        getMap: function () {
            require(['mmRequest'], function () {
                //todo  未来这里可能会从服务器获取站点地图
                avalon.ajax({
                    url: './package/nav/siteMap.json',
                    type: "get",
                    success: function (res,err) {
                        //成功获取后的操作
                        vm.navList = res
                    }
                })
            })

        },

        //控制下拉菜单的可见性
        navToggle: {
            senior: false
        },
        toggle: function (key) {
            if (vm.navToggle[key] == true) {
                vm.navToggle[key] = false
            }
            else {
                vm.navToggle[key] = true
            }
        },

        //预加载
        preLoad:function(index){
            var en=vm.navList[index].en
            require(['../../package/'+en+'/'+en])
        },


    })
    return nav = vm
})
