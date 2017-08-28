define('member', [
    'avalon',
    'text!../../package/member/member.html',
    'css!../../package/member/member.css',
    '../../plugins/ZeroClipboard/ZeroClipboard.min.js'
], function (avalon, html, css, ZeroClipboard) {
    var vm = avalon.define({
        $id: "member",
        ready: function (i) {
            vm.reset()
            layout.url = html
            layout.rightShowing = false

            vm.toTab(i)
            vm.joinBtnInit()
            vm.getWantJoinList()
            vm.checkAdmin(cache.go('uid'))

            vm.getPower();


        },
        reset: function () {
            avalon.mix(vm, {
                cname: cache.go('cname')
            })
        },

        //标签页控制
        tabList: [
            {
                name: '员工管理',
                href: "#!/member/0",
                ready: function () {

                }

            },
            {
                name: '审核申请',
                href: "#!/member/1",
                ready: function () {
                    //vm.getWantJoinList()


                }
            },
            //{
            //    name:'账户充值',
            //    href:"#!/member/2",
            //    ready: function () {
            //        setTimeout(vm.getMoney,400)
            //    }
            //}
        ],
        nowTab: -1,
        toTab: function (i) {
            if (vm.nowTab == i) {
                return
            }
            vm.nowTab = i
            vm.tabList[i].ready()
        },

        //验证当前用户是否管理员（创建则）
        admin: false,
        adminID: '',
        checkAdmin: function (uid) {

            vm.getMember(function (res, err) {
                admin = false
                ForEach(res, function (el) {
                    if (el.UID == uid && el.Rule == 1) {
                        vm.admin = true
                    }
                    if (el.Rule == 1) {

                    }
                })
            })
        },

        //加入按钮
        joinHref: '',
        state: 0,
        btn: ['复制链接邀请成员加入', '已复制'],
        href: '',
        joinBtnInit: function () {
            vm.joinHref = window.location.origin + window.location.pathname + '?cid=' + getComFromURL() + "&join=true" + "#!/login"
            setTimeout(function () {
                // 定义一个新的复制对象
                var clip = new ZeroClipboard(document.getElementById("join_btn"), {
                    moviePath: "plugins/ZeroClipboard/ZeroClipboard.swf"
                });
                // 复制内容到剪贴板成功后的操作
                clip.on('complete', function (client, args) {
                    alert("已复制到剪贴板：")
                });
                clip.on("ready", function () {
                    console.log('剪贴板已就绪')
                    this.on("aftercopy", function (event) {
                        vm.state = 1
                        console.log("Copied text to clipboard: " + event.data["text/plain"]);
                    });
                });
                clip.on("error", function (event) {
                    //$(".demo-area").hide();
                    console.log('error[name="' + event.name + '"]: ' + event.message);
                    ZeroClipboard.destroy();
                });
            }, 200)
        },

        //获取员工列表
        userList: [],
        lastGet: "",
        getMember: function (callback) {
            if (new Date().getTime() - vm.lastGet < 30000 && vm.lastGet != '') {
                //不再重复获取
                if (callback != undefined) {
                    callback(vm.userList)
                }
                return
            }

            ws.call({
                i: "Company/Company/getCompanyUsers",
                data: {},
                success: function (res, err) {
                    if (err) {
                        return
                    }
                    vm.lastGet = new Date().getTime()
                    vm.userList = res

                    if (callback != undefined) {
                        callback(res)
                    }

                }

            })
        },

        //修改员工权限
        changeRight: function () {

        },

        //踢出员工
        delMember: function (uid) {
            ws.call({
                i: "Company/Company/unbind",
                data: {
                    UID: uid
                },
                success: function (res, err) {
                    if (err) {
                        tip.on('删除失败：' + err)
                        return
                    }

                    vm.getMember()
                }
            })

        },

        //获取审核申请列表
        JList: [],
        getWantJoinList: function () {
            ws.call({
                i: "Company/Company/getNeedJudgeUsers",
                data: {},
                success: function (res, err) {
                    if (err) {
                        console.log('获取审核列表失败：' + err)
                        return
                    }

                    vm.JList = res
                }
            })
        },

        //通过申请
        pass: function (uid) {
            ws.call({
                i: "Company/Company/accept",
                data: {
                    CompanyID: getComFromURL(),
                    UID: uid
                },
                success: function (res, err) {
                    if (err) {
                        tip.on('审核失败：' + err)

                        return
                    }

                    tip.on('审核成功', 1)
                    vm.getWantJoinList()
                }
            })
        },

        //驳回申请
        refuse: function (uid) {
            ws.call({
                i: "Company/Company/deny",
                data: {
                    CompanyID: getComFromURL(),
                    UID: uid
                },
                success: function (res, err) {
                    if (err) {
                        tip.on('审核失败：' + err)

                        return
                    }

                    tip.on('审核成功', 1)
                    vm.getWantJoinList()
                }
            })
        },

        /*充值相关*/
        cname: "",
        Balance: '0.00',//当前企业创建者的账户余额
        //获取当前余额
        getMoney: function () {
            vm.getMember(function (res, err) {
                ForEach(res, function (el) {
                    if (el.Rule == 1) {
                        vm.Balance = el.Balance
                    }
                })
            })
        },

        //充值接口
        moneyList: [100, 200, 300, 400],

        //选择面额
        selectedMoney: -1,
        selectMoney: function (i) {
            vm.selectedMoney = i
        },

        pay: function (money) {
            //判断是否是当前企业的管理员
            if (!vm.admin) {
                alert('您不是当前企业的创建者，只有创建者才能为企业充值，请联系企业创建者。')
                return
            }
            ws.call({
                i: "User/Pay/pay",
                data: {
                    Money: money
                },
                success: function (res, err) {
                    if (err) {
                        tip.on(err)
                        return
                    }

                    vm.listenPayRes(res)
                    //跳转阿里支付页面
                    window.open(res.URL)
                }

            })
        },

        //监听支付状态
        payTimeout: "",
        listenPayRes: function (payOrder) {
            vm.payTimeout = setInterval(function () {
                ws.call({
                    i: "User/Pay/get",
                    data: {
                        PayID: payOrder.PayID
                    },
                    success: function (res, err) {
                        if (err) {
                            return
                        }

                        if (res.Result == 1) {
                            //todo 支付成功
                            clearInterval(vm.payTimeout)
                        }

                    }
                })
            }, 500)

        },
        power: [
            '修改商品信息',
            '消耗品出库开单',
            '修改交易方信息',
            '盘存报损调拨开单',
            '租赁开单',
            '采购开单',
            '访问报表中心'
        ],
        setPower: function (UID, num, that) {
            var data = [],
                check = that.querySelector('input').checked,
                group = {cid: cache.go('cid')};
            group = JSON.stringify(group);
            num = Number(num);
            switch (num) {
                case 1:
                    data.push({
                        'UID': UID,
                        'quanxian1': check
                    })
                    break;
                case 2:
                    data.push({
                        'UID': UID,
                        'quanxian2': check
                    })
                    break;
                case 3:
                    data.push({
                        'UID': UID,
                        'quanxian3': check
                    })
                    break;
                case 4:
                    data.push({
                        'UID': UID,
                        'quanxian4': check
                    })
                    break;
                case 5:
                    data.push({
                        'UID': UID,
                        'quanxian5': check
                    })
                    break;
                case 6:
                    data.push({
                        'UID': UID,
                        'quanxian6': check
                    })
                    break;
                case 7:
                    data.push({
                        'UID': UID,
                        'quanxian7': check
                    })
                    break;
            }

            data = JSON.stringify(data);
            ws.call({
                i: "Kv/Kv/set",
                data: {
                    Key: "power",
                    Value: data,
                    Group: group,
                    Default: null
                },
                success: function (res) {
                    // var res = JSON.parse(res)
                    console.log("设置权限成功：" + res);
                },
                error: function (err) {
                    console.log("设置权限失败");
                }
            })
        },
        getPower: function () {
            var group = {cid: cache.go('cid')};
            group = JSON.stringify(group);
            ws.call({
                i: "Kv/Kv/get",
                data: {
                    Key: "power",
                    Group: group,
                    Default: null
                },
                success: function (res, err) {
                    if (err) {
                        console.error(err);
                    }
                    console.info(res)
                }
            })
        }
    })

    window[vm.$id] = vm
    return vm
})