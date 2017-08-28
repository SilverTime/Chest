/**
 * Created by Administrator on 2015/7/5 0005.
 *
 * 用户登录注册找回密码进入企业创建企业
 * html在my.html第339行开始
 */
define('login',
    ['avalon', 'css!../../package/login/login.css', 'mmAnimate', '../../plugins/CheckUp/CheckUp.js'],
    function (avalon, css) {
        var vm = avalon.define({
            $id: "login",
            notLogin: true,
            target: '#!/Order/0',
            state: "default",//default默认状态 waiting 等待返回 sucess成功 err出错
            animateTime: 250,
            join: false,


            //是否显示登录界面
            showLoginPanel:true,

            inLoginPage: function () {
                vm.notLogin = true
                vm.showLoginPanel=true
                window.document.getElementById("desk").style.display='none'
            },
            outLoginPage: function () {
                door.logined = true
                vm.notLogin = false
                vm.showLoginPanel=false
                window.document.getElementById("desk").style.display = "block"

            },

            ready: function () {
                vm.reset()
                var Request = new GetRequest();
                var i=Request['join']
                if (i == 'true') {
                    vm.join = true
                    vm.toPage(0);
                    vm.getThisCOM()
                }

                //todo 登陆界面进入
                //avalon(window.document.getElementById("loginPanel")).fadeIn(vm.animateTime)
                //setTimeout(function () {
                //    vm.notLogin = true
                //}, vm.animateTime)
                //avalon(window.document.getElementById("desk")).fadeOut(vm.animateTime)
                vm.inLoginPage()

                //清除不该出现的快捷键
                try {
                    quickStart.removeBillKey()
                }
                catch (err) {
                    console.log(err.message)
                }

                //layout.url = html


                //隐藏工作区

                avalon.scan()


                //获取账户输入框的焦点
                function inputInit() {
                    setTimeout(function () {
                        try {
                            window.document.getElementById("account").focus()
                            //绑定密码输入框的快捷键
                            vm.bindEnter()
                        } catch (err) {
                            inputInit()
                        }
                    }, 1000)
                }

                inputInit()

                //老用户检测
                if (cache.go('SID') != '') {
                    vm.toPage(1)
                }


            },
            bindEnter: function () {
                //绑定密码输入框的快捷键
                require(['../../plugins/shortcut/shortcut.js'], function () {
                    var target = window.document.getElementById("pwd")
                    shortcut.add("enter", function () {
                        vm.login();
                        shortcut.remove("enter")
                    }, {
                        type: "keyup",
                        target: target
                    })

                })
            },


            //验证登陆用户名
            login_account: '',
            LoginName_time_judge: "",
            verifyLoginName: function () {
                clearTimeout(vm.LoginName_time_judge);
                vm.LoginName_time_judge = setTimeout(function () {
                    if (vm.login_account == '') {
                        nameInput.warning('用户名不能为空');
                        vm.loginAccFlag = 1;
                    }
                    else if (vm.page == 0) {

                        //检测用户名
                        vm.checkAccount(vm.login_account, 'nameInput', '用户名已被占用')
                    } else {
                        nameInput.success()
                    }
                }, 400)
            },

            nameInput: false,
            passwordInput: false,
            phoneInput: false,
            emailInput: false,

            checkAccount: function (account, inputID, intro) {
                ws.call({
                    i: "User/User/checkAccount",
                    data: {
                        Account: account
                    },
                    success: function (res, err) {
                        if (err||res==false) {
                            console.log(err)
                            return
                        }
                        if (res) {
                            window[inputID].error(intro, 10000);
                            vm[inputID] = false
                        } else {
                            window[inputID].success();
                            vm[inputID] = true
                        }
                    }
                })
            },
            //验证登陆密码
            login_pwd: '',
            login_pwdtip: '',

            verifyLoginPwd: function () {
                clearTimeout(vm.LoginPwd_judge_time);
                vm.LoginPwd_judge_time = setTimeout(function () {
                    if (vm.login_pwd == '') {
                        passwordInput.warning('密码不能为空');
                        vm.passwordInput = false

                    }
                    else {
                        if (vm.login_pwd === vm.login_account) {
                            passwordInput.error('请勿使用账户名作为密码')
                        }
                        if (vm.login_pwd.length < 6 || vm.login_pwd.length > 16) {
                            passwordInput.error('密码错误：长度小于6或者大于16')
                            vm.passwordInput = false
                        }
                        else {

                            passwordInput.success()
                            vm.passwordInput = true

                        }
                    }
                }, 1500);
            },

            //动态监测
            cpt: "",
            checkPhone: function () {

                if (CheckUp(vm.phone, 'mobile', 'phoneInput')[0] === false) {
                    return
                }
                clearTimeout(vm.cpt)
                vm.cpt = setTimeout(function () {
                    vm.checkAccount(vm.phone, 'phoneInput', "该手机号已注册")
                }, 300)
            },
            cet: "",
            checkEmail: function () {

                if (CheckUp(vm.email, 'email', 'emailInput')[0] === false) {
                    return
                }
                clearTimeout(vm.cet)
                vm.cet = setTimeout(function () {
                    vm.checkAccount(vm.email, 'emailInput', "该邮箱已注册")
                }, 300)
            },

            //    登录

            login: function () {
                var data = {
                    Account: vm.login_account,
                    PWD: vm.login_pwd
                }
                vm.state = "waiting"
                if (data.PWD == '') {
                    vm.state = "err";
                    passwordInput.error('密码不能为空')
                    vm.bindEnter()
                    return false
                }

                //if (!vm.passwordInput&&CheckUp(data.PWD, 'pwd', 'passwordInput')[0] === false) {
                //    vm.state = 'err'
                //    vm.bindEnter()
                //    return false
                //}
                if (data.Account == "") {
                    nameInput.error('账户名不能为空')
                    vm.state = 'err'
                    vm.bindEnter()
                    return false
                }

                //if (CheckUp(data.Account, 'username', 'nameInput')[0] === false) {
                //    vm.state = 'err'
                //    vm.bindEnter()
                //    return false
                //}


                //if (CheckUp(data.PWD, 'pwd', 'passwordInput')[0] === false) {
                //    vm.state = 'err'
                //    return
                //}

                //发起请求
                ws.call({
                    i: "User/User/login",
                    data: data,
                    success: function (res, err) {
                        if (err || res == false) {
                            vm.state = "err"
                            if (err != '') {

                                err = "：" + err
                            }
                            vm.login_pwd = ''
                            passwordInput.error('登录失败' + err, 5000);
                            //vm.notLogin=true
                            vm.bindEnter()
                            setTimeout(function () {
                                window.document.getElementById("pwd").focus()
                            }, 300)

                            return false
                        }
                        vm.uid = res.UID
                        vm.state = "success"
                        tip.on("登录成功", 1, 3000)
                        door.logined = true;
                        //vm.notLogin=false
                        cache.go({
                            "un": res.Account,
                            "uid": res.UID,
                            //"Token":data.Token
                        })


                        doorC.comeIn(function () {
                            vm.getStart()
                        }, function () {
                            if (vm.join == true) {
                                //加入企业的逻辑
                            } else {
                                vm.getMineCompany()
                            }
                        })
//
                    }
                })
            },
            uid: "",
            companyList: [],
            getMineCompany: function () {
                ws.call({
                    i: "Company/Company/getMine",
                    data: {},
                    success: function (res, err) {
                        if (err||res==false) {
                            console.log(err)
                        }
                        vm.companyList = res
                    }
                })
            },

            toDesk: function () {
                modal.mustOut()
                quickStart.inSide = true;
                quickStart.user.UserName = data.UN
                quickStart.user.UID = data.UID
                door.locked = false;


                quickStart.getStores()


                //记录这次使用的地址
                cache.go({
                    CompanyDomian: window.location.href
                })

                //重新绑定该有的快捷键
                try {
                    quickStart.bindBillKey()
                }
                catch (err) {
                    console.log(err.message)
                }

                //跳转首页

                //window.location.href = "#!/Order/0"
                //window.document.getElementById("topBar").style.display = "block"

                vm.getStart()
            },

            //注册逻辑
            phone: '',
            email: "",
            register: function () {
                vm.state = "waiting"
                var data = {
                    'Account': vm.login_account, //帐号
                    'PWD': vm.login_pwd, //密码
                    'Phone': vm.phone, //手机
                    'Email': vm.email //邮箱
                }


                //验证数据

                //if (!vm.nameInput) {
                //    vm.state = 'err'
                //    return
                //}
                //if (!vm.passwordInput) {
                //    vm.state = 'err'
                //    return
                //}
                //
                //if (!vm.phoneInput) {
                //    vm.state = 'err'
                //    return
                //}
                //
                //if (!vm.emailInput) {
                //    vm.state = 'err'
                //    return
                //}


                if (CheckUp(data.Account, 'username', 'nameInput')[0] === false) {
                    return vm.state = 'err'
                }
                if (CheckUp(data.PWD, 'pwd', 'passwordInput')[0] === false) {
                    return vm.state = 'err'
                }
                if (CheckUp(data.Phone, 'mobile', 'phoneInput')[0] === false) {
                    return vm.state = 'err'
                }
                if (CheckUp(data.Email, 'Email', 'emailInput')[0] === false) {
                    return vm.state = 'err'
                }

                //发起请求
                ws.call({
                    i: "User/User/add",
                    data: data,
                    success: function (res, err) {
                        if (err || res == false) {
                            //注册失败
                            vm.state = "err"
                            return
                        }
                        vm.state = "success"
                        //vm.login_pwd = ''
                        vm.phone = ''
                        vm.email = ''
                        vm.toPage(1)
                        vm.login()


                    }
                })

            },

            //控制页面切换  0-注册 1-登陆 2 找回
            page: 0,
            toPage: function (i) {
                vm.page = i
            },

            //进入工作区
            getStart: function (cid) {
                var search = ''
                if (cid > 0) {
                    search = '?cid=' + cid
                }
                vm.state = "success"
                //抓取上次的页面地址
                //todo 这里与doorC里面的跳转有逻辑冲突

                window.location.href = search + vm.target

                //vm.hiddeDoor()


            },

            hiddeDoor: function () {
                if (!vm.notLogin) {
                    return
                }
                //todo 进入工作区域动画
                vm.outLoginPage()

            },

            //           找回密码模块


            //验证邮箱
            psw_email: "",
            pwd_new: "",
            psw_pin: "",
            typePIN: 1,
            sendPINstate: 0,
            accountYes: 0,
            iseconds: 60,

            checkPswEmail: function () {
                if (CheckUp(vm.psw_email, 'email', 'pswMail')[0] === false) {
                    return
                }
                var data = {
                    Account: vm.psw_email
                }
                ws.call({
                    i: "User/User/findMyAccount",
                    data: data,
                    success: function (res, err) {
                        if (err||res==false) {
                            if (err == "ACCOUNT_NOT_EXIST") {
                                vm.accountYes = 0;
                                pswMail.error("请重新输入您的绑定邮箱")
                            } else {
                                vm.accountYes = 0;
                                console.log(err)
                            }
                            return
                        }
                        vm.UID = res.UID;
                        vm.accountYes = 1;

                    }
                })
            },

            //计时60s

            secondsCount: function () {
                vm.iseconds--;
                setTimeout(function () {
                    vm.secondsCount();
                }, 1000);
                if (vm.iseconds === 0) {
                    vm.sendPINstate = 0;

                }
            },

            //发送验证码
            sendPIN: function () {
                var data = {
                    UID: vm.UID,//mooshroom@tansuyun.cn
                    Type: vm.typePIN
                }
                if (vm.accountYes === 1) {
                    ws.call({
                        i: "User/User/sendVerify",
                        data: data,
                        success: function (res, err) {
                            if (err||res==false) {
                                console.log(err)
                            }
                            if (res === true) {
                                vm.sendPINstate = 1;
                                //pswMail.success();
                                vm.secondsCount();
                            }

                        }
                    })
                }
                else {
                    pswMail.error("请输入绑定的邮箱")
                }
            },

            //设置为新的密码
            pswOK: 0,
            checkPsw: function () {
                if (CheckUp(vm.pwd_new, 'pwd', 'pswNew') === false) {
                    return
                }
                vm.pswOK = 1;
            },
            //成功（弹出提示）
            pswReset: function () {
                if (vm.psw_pin === "" || vm.psw_pin === undefined || vm.psw_pin === null) {
                    pswPIN.error('请输入您的验证码')
                    return
                }
                vm.checkPswEmail();
                vm.checkPsw();
                if (vm.accountYes === 1 && vm.pswOK === 1) {
                    var data = {
                        UID: vm.UID,
                        PWD: vm.pwd_new,
                        Code: vm.psw_pin
                    }
                    ws.call({
                        i: "User/User/resetPWD",
                        data: data,
                        success: function (res, err) {
                            alert("你的密码已重置，请重新登录")
                        }
                    })
                }
            },


            //返回登陆页面


            //创建企业
            addingCom: false,
            comName: "",
            stateComName: '',
            //comAdd:"",
            //manName:"",
            //manPhone:"",

            openAddCom: function () {
                vm.addingCom = true;
                comName = '';
                //comAdd='';
                //manName='';
                //manPhone=''
            },
            closeAddCom: function () {
                vm.addingCom = false
            },
            timeoutComName: '',
            //timeoutComAdd:'',
            //timeoutManName:'',
            //timeoutManPhone:'',
            checkComName: function () {
                var Name = vm.comName
                clearTimeout(vm.timeoutComName)
                vm.timeoutComName = setTimeout(function () {
                    if (Name == "") {
                        return
                    }
                    ws.call({
                        i: "Company/Company/checkCompanyName",
                        data: {
                            Name: Name,
                        },
                        success: function (res, err) {
                            if (err) {
                                console.log(err)
                                vm.stateComName = 0;
                                return
                            }
                            if (res) {
                                comNameInput.error('名称已被占用')
                                vm.stateComName = 0;
                                return
                            }

                            comNameInput.success()
                            vm.stateComName = 1;


                        }
                    })
                }, 300)

            },




            comInfo: [],
            addCom: function () {

                if (vm.stateComName != 1) {
                    comNameInput.error('名称已被占用')
                    return
                }

                ws.call({
                    i: "Company/Company/add",
                    data: {
                        Name: vm.comName,
                        //Address: vm.comAdd,
                        //UN: vm.manName,
                        //Phone: vm.manPhone,
                    },
                    success: function (res, err) {
                        if (err||res==false) {
                            console.log(err)
                            comNameInput.error(err)
                            return
                        }
                        if (res) {
                            vm.getMineCompany()
                            console.log(res)
                            vm.closeAddCom()
                        }
                    }
                })
            },

            //加入企业的控制逻辑
            joinTip:"",
            COM:{},
            getThisCOM: function () {
                var cid=getComFromURL()
                if(cid>0){
                    ws.call({
                        i:"Company/Company/get",
                        data:{
                            CompanyID:cid,
                        },
                        success: function (res, err) {
                            if(err){
                                //输出错误
                                vm.joinTip='未找到您要加入的企业，请与企业创建者联系。'
                                vm.join=false
                                return
                            }

                            vm.COM=res





                        }
                    })
                }else{
                    //todo 输出错误
                    vm.joinTip='未找到您要加入的企业，请与企业创建者联系。'
                    vm.join=false
                }
            },
            $login_pwd:"",
            joinCOM: function () {

                ws.call({
                    i:"Company/Company/join",
                    data:{
                        CompanyID:getComFromURL(),
                    },
                    success: function (res, err) {
                        if(err){
                            vm.joinTip=err
                            return
                        }

                        vm.joinTip='成功加入' +
                            vm.COM.Name +
                            '！请等待企业创建者审核，通过后我们将通过邮件通知您。'

                        vm.join=false
                    }
                })
            },


            //重置
            reset: function () {
                avalon.mix(vm, {
                    notLogin: '',
                    target: '#!/Order/0',
                    state: "default",//default默认状态 waiting 等待返回 sucess成功 err出错
                    //验证登陆用户名
                    login_account: '',
                    login_acctip: '',
                    loginAccFlag: 0,
                    LoginName_bool: 0,
                    LoginPwd_bool: 0,
                    login_pwd: '',
                    login_pwdtip: '',
                    loginPwdFlag: 0,
                    page: 0,
                    join: false,
                    $login_pwd:"",
                })

                //判断新老用户
                if (cache.go('uid') > 0) {
                    vm.page = 1
                } else {
                    vm.page = 0
                }

                /*取消登录，返回主页*/
                //window.location.href = "http://chest.tansuyun.cn/";

                try {
                    nameInput.default()
                    passwordInput.default()
                } catch (err) {
                }
            }
        })
        return login = vm
    })