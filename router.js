//路由定义
require(["mmRouter", "mmRequest", '../../plugins/door/door', '../../plugins/door/doorC'], function () {
    //首页，
    //监听路由
    avalon.router.get('/', function () {
        //调用门禁
        window.location.href = "#!/login"

    });


    // 检测登录状态，如果没登录就跳转这个页面进行登录
    avalon.router.get('/login', function (i) {
        try {
            layout.rightShowing = false

        }
        catch (err) {
        }
        try {
            pb.startT()
        } catch (err) {
        }
        require(['../../package/login/login.js'], function () {
            login.ready()
        })

        try {
            pb.endT()
        } catch (err) {
        }
        logUrl("/login")
        //调用门禁
        door.comeIn({
            haveLogin: function () {
                doorC.comeIn(function () {
                    login.getStart()
                }, notInCom)
            },
            notLogin: function () {


            }
        });
    });

    //开单的路由
    avalon.router.get("/bill/:id", function (id) {
        try {
            pb.startT()
        } catch (err) {
        }
        require(['../../package/bill/bill'], function () {
            door.comeIn({
                haveLogin: function () {
                    doorC.comeIn(function () {
                        getStart()
                        var params=String(id).split("&&")
                        if (params[0]>=0) {/*!isNaN(id)*/
                            logUrl("/bill/" + id)
                            bill.ready(id)
                            try {
                                pb.endT()
                            } catch (err) {
                            }
                            //绑定快速的快捷键
                            require(['../../package/quickStart/quickStart.js'], function () {
                                quickStart.bindBillKey()

                            })
                        }
                        else {
                            tip.on("没有这订单类型")
                            try {
                                pb.resetT()
                            } catch (err) {
                            }
                        }
                    }, notInCom)


                },
                notLogin: function () {
                    logUrl("/bill/" + id)
                    notLoginG()
                }
            });
        })
    })

    //开单草稿箱的路由
    avalon.router.get("/billDraft/:id", function (id) {
        try {
            pb.startT()
        } catch (err) {
        }
        require(['../../package/bill/billDraft'], function (billDraft) {
            door.comeIn({
                haveLogin: function () {
                    doorC.comeIn(function () {
                        getStart()
                        //if (id) {/*!isNaN(id)*/
                            logUrl("/billDraft/" + id)
                            billDraft.ready(id)
                            try {
                                pb.endT()
                            } catch (err) {
                            }
                            //绑定快速的快捷键
                            require(['../../package/quickStart/quickStart.js'], function () {
                                quickStart.bindBillKey()

                            })
                        //}
                        //else {
                        //    tip.on("没有这么个商品")
                        //    try {
                        //        pb.resetT()
                        //    } catch (err) {
                        //    }
                        //}
                    }, notInCom)


                },
                notLogin: function () {
                    logUrl("/billDraft/" + id)
                    notLoginG()
                }
            });
        })
    })

    avalon.router.get("/goodsInfo/:id", function (id) {
        try {
            pb.startT()
        } catch (err) {
        }
        require(['../../package/goods/info'], function (go) {
            door.comeIn({
                haveLogin: function () {
                    doorC.comeIn(function () {
                        getStart()
                        if (id) {/*!isNaN(id)*/
                            logUrl("/goodsInfo/" + id)
                            go.ready(id)
                            try {
                                pb.endT()
                            } catch (err) {
                            }
                            //绑定快速的快捷键
                            require(['../../package/quickStart/quickStart.js'], function () {
                                quickStart.bindBillKey()

                            })
                        }
                        else {
                            tip.on("没有这么个商品")
                            try {
                                pb.resetT()
                            } catch (err) {
                            }
                        }
                    }, notInCom)


                },
                notLogin: function () {
                    logUrl("/goodsInfo/" + id)
                    notLoginG()
                }
            });
        })
    })

    //订单详情路由
    avalon.router.get('/OrderInfo/:id', function (id) {
        //try{
        //    modal.mustOut()
        //}
        //catch(err){}
        try {
            pb.startT()
        } catch (err) {
        }

        require(['../../package/order/info'], function () {
            door.comeIn({
                haveLogin: function () {
                    doorC.comeIn(function () {
                        getStart()
                        if (!isNaN(id)) {
                            orderInfo.ready(id)
                            try {
                                pb.endT()
                            } catch (err) {
                            }
                            logUrl("/OrderInfo/" + id)
                            //绑定快速的快捷键
                            require(['../../package/quickStart/quickStart.js'], function () {
                                quickStart.bindBillKey()

                            })
                        } else {
                            tip.on("没有这么一条订单")
                            try {
                                pb.resetT()
                            } catch (err) {
                            }
                        }
                    }, notInCom)


                },
                notLogin: function () {
                    logUrl("/OrderInfo/" + id)
                    notLoginG()
                }
            });

        })
    })

    avalon.router.get("/customerInfo/:id", function (id) {
        try {
            //modal.mustOut()
            layout.rightShowing = false
        }
        catch (err) {
        }
        try {
            pb.startT()
        } catch (err) {
        }

        require(['../../package/customer/traderInfo.js'], function () {
            door.comeIn({
                haveLogin: function () {
                    doorC.comeIn(function () {
                        getStart()
                        if (!isNaN(id)) {
                            traderInfo.ready(id)
                            try {
                                pb.endT()
                            } catch (err) {
                            }
                            logUrl("/customerInfo/" + id)
                            //绑定快速的快捷键
                            require(['../../package/quickStart/quickStart.js'], function () {
                                quickStart.bindBillKey()

                            })
                        }
                        else {
                            tip.on("没有这样一个客户供应商")
                            try {
                                pb.resetT()
                            } catch (err) {
                            }
                        }
                    }, notInCom)


                },
                notLogin: function () {
                    logUrl("/customerInfo/" + id)
                    notLoginG()
                }
            })
        })
    })

    function logUrl(url) {
        //cache.go({
        //    lastUrl:url
        //})
        //ws.call({
        //    i:"Log/url",
        //    data:{
        //        url:url
        //    },
        //    success:function(res){
        //        if(!res.err){
        //            console.log(url+" pushed")
        //        }else{
        //            console.log(url+" push error")
        //        }
        //    }
        //})
    }

    var quickStartReady=false
    function getStart() {
        if(quickStartReady){
            return
        }
        require([
            '../../package/nav/nav.js',
            '../../package/quickStart/quickStart.js',
            '../../plugins/door/door.js',
            '../../plugins/isIt/isIt.js',
            'mmAnimate'
        ], function (nav, quickStart) {
//                控制器引入

            nav.ready()
            quickStart.ready()
            layout.getCarCache();
            avalon.scan()

            quickStartReady=true


        })
    }


    function newRouter(n) {
        var en = n.en;
        avalon.router.get('/' + en + '/:i', function (i) {
            console.log("mmRouter开始响应")
            try {
                //modal.mustOut()
                layout.rightShowing = false
            }
            catch (err) {
            }

            try {
                pb.startT()
            } catch (err) {}

            require(['../../plugins/door/door.js',], function () {


                door.comeIn({
                    haveLogin: function () {

                        doorC.comeIn(function () {
                            getStart()
                            require(['../../package/' + en + '/' + en + '.js'], function () {
                                //console.log("资源加载完成")
                                //console.log("开始执行模块下的ready方法")
                                avalon.vmodels[en].ready(i)
                                try {
                                    pb.endT()
                                } catch (err) {}

                                require(['../../package/quickStart/quickStart.js'], function () {
                                    quickStart.bindBillKey()
                                    console.log("快捷键绑定完成")

                                })
                                logUrl("/" + en + "/" + i)
                            })

                        }, notInCom)

                    },
                    notLogin: function () {
                        notLoginG()
                        try {
                            pb.resetT()
                        } catch (err) {
                        }
                    }
                })

            })
            nav.checkNow(en)

            if (document.documentElement && document.documentElement.scrollTop) {
                document.documentElement.scrollTop = 0//滚动
            }
            else if (document.body) {
                document.body.scrollTop = 0//滚动

            }
        });
        console.log(n.zh + "路由创建完毕")
    }

    function getMap() {
        var t = 0

        require(['../../package/nav/nav'], function (nav) {
            //导航地图加载完成，可以开始渲染路由
            console.log("开始构建路由")
            var l = nav.navList
            var ll = l.length
            var lsl;
            for (var i = 0; i < ll; ++i) {
                if (l[i].sub) {
                    //有第二级导航
                    lsl = l[i].sub.length
                    for (var o = 0; o < lsl; ++o) {
                        newRouter(l[i].sub[o])
                    }
                }
                else {
                    //直接渲染项目
                    newRouter(l[i])

                }
            }
            console.log("路由构建完毕")

            //构建错误页面
            avalon.router.error(function () {
                try {
                    window.location.href = '404.html';
                } catch (err) {
                }
            })

            //开始监听
            avalon.history.start();
            //扫描
            avalon.scan();
        })

    }



    getMap()

});

