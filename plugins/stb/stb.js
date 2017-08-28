/**
 * Created by mooshroom on 2015/3/25.
 */
define('stb', function () {
    return stb = avalon.define({
        $id: 'stb',
        aIndex: 0,//当前选中的标签索引
        ready: function () {
            require.config({
                paths: {
                    stbcss: "../../plugins/stb/stb.css"
                }
            })
            require(['css!stbcss'], function () {
            })
        },

        tab: function (id) {//点击切换标签事件
            stb.aIndex = id;
        },


        //验证登陆用户名
        login_account: '',
        login_acctip: '',
        loginAccFlag: 0,
        verifyLoginName: function () {
            if (stb.login_account == '') {
                stb.login_acctip = '用户名不能为空';
                stb.loginAccFlag = 1;
            }
            else {
                stb.login_acctip = '';
                stb.loginAccFlag = 0;
                return 1;
            }
        },
        //验证登陆密码
        login_pwd: '',
        login_pwdtip: '',
        loginPwdFlag: 0,
        verifyLoginPwd: function () {
            if (stb.login_pwd == '') {
                stb.login_pwdtip = '密码不能为空';
                stb.loginPwdFlag = 1;
            }
            else {
                stb.login_pwdtip = '';
                stb.loginPwdFlag = 0;
                return 1;
            }
        },
        //验证注册账户
        account: '',
        nameTip: '用户名不能以数字开头',
        verifyUsername: function (account) {
            var tip = regCheckOut.verifyUsername(account);
            if (tip == 1) {
                //添加对号
                stb.nameFlag = 1;
                return 1;
            }
            else {
                stb.nameFlag = 2;
                stb.nameTip = tip;
            }
        },
        //验证注册账户密码
        pwd: '',
        pwdTip: '密码6位以上',
        pwdFlag: 0,
        verifyPassword: function (pwd) {
            var tip = regCheckOut.verifyPassword(pwd);
            if (tip == 1) {
                //添加对号
                stb.pwdFlag = 1;
                return 1;
            }
            else {
                stb.pwdFlag = 2;
                stb.pwdTip = tip;
            }
        },
        //验证注册重复密码
        rePwd: "",
        rePwdFlag: "",
        rePwdTip: "",
        verifyRePassword: function () {
            if (stb.pwd === stb.rePwd) {
//                验证通过
                stb.rePwdFlag = 1;
                return 1;
            }
            else {
                stb.rePwdFlag = 0;
                stb.rePwdTip = "两次输入密码不一致！？";
                return 0
            }
        },
        //验证注册账户邮箱
        email: '',
        emailTip: '合法邮箱格式',
        nameFlag: 0,
        emailFlag: 0,
        verifyEmail: function (em) {
            var tip = regCheckOut.verifyEmail(em);
            if (tip == 1) {
                //添加对号
                stb.emailFlag = 1;
                return 1;
            }
            else {
                stb.emailFlag = 2;
                stb.emailTip = tip;
            }

        },
        //验证注册邀请码
        code: '',
        codeTip: '联系mooshroom <mooshroom@tansuyun.cn> 获取邀请码',
//        nameFlag: 0,
        codeFlag: 0,
        verifyCode: function (em) {
            var tip = regCheckOut.verifyCode(em);
            if (tip == 1) {
                //添加对号
                stb.codeFlag = 1;
                return 1;
            }
            else {
                stb.codeFlag = 2;
                stb.codeTip = tip;
            }

        },
        //验证找回密码邮箱
        findEmail: '',
        findEmailTip: '合法邮箱格式',
        findEmailFlag: 0,
        verifyFindEmail: function (em) {
            var tip = regCheckOut.verifyEmail(em);
            if (tip == 1) {
                //添加对号
                stb.findEmailFlag = 1;
                return 1;
            }
            else {
                stb.findEmailFlag = 2;
                stb.findEmailTip = tip;

            }

        },
        //    登录

        login: function () {
            if (stb.verifyLoginName() == 1 && stb.verifyLoginPwd() == 1) {
                stb.loginFlag = 0;
                $.call({
                    type: 'post',
                    i: 5,
                    data: {account: stb.login_account, pwd: stb.login_pwd},
                    success: function (data) {
                        if (data.c == 200) {
                            tip.on("登录成功", 1, 3000)
                            door.logined = true;
                            cache.go({
                                "tsy": data.tsy,
                                "un": data.un,
                                "uid": data.uid
                            })
                            layout.rightShowing=false
                            quickStart.inSide = true;
                            quickStart.user.UserName = data.un
                            door.locked = false;
                            //跳转首页
                            window.location.href = "./index.html#!/"
                        }
                        //401   用户名或密码错误
                        else if (data.c == 401) {
                            tip.on('用户名或密码错误', 0, 5000);
                        }
                        else {
                            tip.on('未知错误', 0, 5000);
                        }
                    }
                });
            }
        },
        //注册

        reg: function () {
            if (
                (stb.verifyUsername(stb.account) == 1)
                && (stb.verifyPassword(stb.pwd) == 1)
                && (stb.verifyEmail(stb.email) == 1)
                && (stb.verifyRePassword() == 1)
                && (stb.verifyCode(stb.code) == 1)
                ) {
                //发出请求
                $.call({
                    type: 'post',
                    i: 8,
                    data: {username: stb.account, pwd: stb.pwd, email: stb.email},
                    success: function (data) {
                        if (data.c == 200) {
                            tip.on('注册成功', 1, 3000);
                            stb.tab(0)
                        }
                        else {
                            tip.on('注册失败:' + data.c + data.m, 0.3000);
                        }
                    }
                });
            }
        },

        //发送验证码到邮箱

        reset: function () {
            if (stb.verifyFindEmail(stb.findEmail) == 1) {
                alert('稍后你将收到帐号激活的电子邮件');
                $.call({
                    type: 'post',
                    i: '22',
                    data: {Email: stb.findEmail},
                    success: function (data) {
                        if (data.c == 200) {
                            alert('发送验证码到邮箱成功');
                        }
                        else {
                            alert(data.m);
//                            tip.on(data.m,0);
//                            setTimeout(function(){
//                                tip.on(data.m,0);
//                            },3000);
                        }
                    }
                });
            }

        }

    })
});

