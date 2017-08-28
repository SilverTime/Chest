/**
 * 门禁系统，设计者：mooshroom
 * 当前版本，v0.1.5
 * 20150501
 */

//验证是否为登陆状态

define("door", function () {


    return door = {
        locked: true,//门禁状态
        logined: false,//用户登录状态
        hearting: false,

        //重置
        reset: function () {
            avalon.mix(door, {
                locked: true,//门禁状态
                logined: false,//用户登录状态
                hearting: false,
            })
        },
        //登录判断开始
        comeIn: function (fn) {

            //执行动作配置
            var active = {
                haveLogin: fn.haveLogin,
                notLogin: fn.notLogin
            };

            //判断是刷新还是跳转
            if (door.locked == true) {

                //判断为刷新，使用请求验证登录
                require(['mmRequest'], function () {
                    //try{
                    //    login.state="waiting"
                    //}
                    //catch(err){}
                    function success(data, err) {
                        door.locked = false;
                        cache.go({
                            SID: data.SID
                        })

                        if (err || !data.UID > 0) {
                            //自动登陆失败
                            door.logined = false;
                            try {
                                login.state = "err"
                            }
                            catch (err) {
                            }
                            //执行未登录的预定动作
                            active.notLogin();
                            cache.go({
                                "tsy": "",
                                "un": "",
                                "uid": "",
                                "Token": "",
                                //SID:""
                            })
                            return
                        }


                        //自动登陆成功
                        door.logined = true;
                        //login.getStart()
                        //执行已经登录的预定动作
                        if (active.haveLogin) {
                            active.haveLogin();
                        }

                        cache.go({
                            "un": data.Account,
                            "uid": data.UID,
                            //"Token":data.Token
                        })

                        if (window.quickStart != undefined) {
                            quickStart.inSide = true;
                            quickStart.user.UserName = data.Account
                            quickStart.user.uid = data.UID


                            console.log("uid:" + quickStart.user.uid)
                        }
                        //heart()

                    }

                    var SID = cache.go('SID')
                    if (SID == undefined || SID == '' || SID == 'undefined' || SID == null || SID == 'null') {
                        //success({err:'没有找到SID'})
                        //return
                        SID = ''
                    }
                    reLogin()
                    function reLogin() {
                        try {
                            ws.call({
                                i: "User/User/reLogin",
                                data: {
                                    SID: SID
                                },
                                success: success
                            });
                        } catch (err) {
                            setTimeout(function () {
                                reLogin()
                            }, 300)
                        }
                    }

                });
            }
            else {
                //判断为跳转，使用内存抓取验证登录
                if (door.logined == true) {

                    //heart()
                    //判断为已经登录，执行已登录动作
                    active.haveLogin();
                }
                else {

                    //执行未登录动作
                    active.notLogin();

                }
            }


        }
    }
});


