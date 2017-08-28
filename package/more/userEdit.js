/**
 * Created by mooshroom on 2015/9/24.
 */
define('userEdit', ['avalon'], function (avalon) {

    var vm = avalon.define({
        $id: "userEdit",
        ready: function (user) {
            //console.log(user)
            if (user.UID > 0) {
                vm.$orderUser = vm.user = {};
                //数据没问题
                for (var x in user) {
                    if (x.charAt(0) != "$") {
                        vm.user[x]=vm.$oldUser[x] = user[x]
                    }
                }
            }
            //vm.user=vm.$oldUser
        },

        user: {
            UID: '',
            UN: '',
            Job: "",
            Number: "",
            Phone: ""
        },
        $oldUser: {
            UID: '',
            UN: '',
            Job: "",
            Number: "",
            Phone: ""
        },


        //保存
        saveUser: function () {
            var Param = {}
            for (var x in vm.$oldUser) {
                if (vm.$oldUser[x] != vm.user[x]) {
                    Param[x] = vm.user[x]
                }
            }
            ws.call({
                i: "User/save",
                data: {
                    UID: vm.$oldUser.UID,
                    Params: Param
                },
                success: function (res,err) {
                    if (!res.err) {
                        tip.on("保存成功", 1, 3000)
                        vm.close();
                        more.getUser()
                    }
                }
            })
        },




        //修改密码
        oldPWD: "",
        newPWD: "",
        rePWD: "",
        savePWD: function () {
            if (vm.verifyPassword(vm.newPWD) && vm.newPWD == vm.rePWD) {
                ws.call({
                    i: "User/changePwd",
                    data: {
                        UID: vm.user.UID,
                        OldPWD: vm.oldPWD,
                        NewPWD: vm.newPWD,
                        RePWD: vm.rePWD
                    },
                    success: function (res,err) {
                        if (!res.err) {
                            vm.user = {};
                            vm.oldPWD = ""
                            vm.newPWD = ""
                            vm.rePWD = ""
                            tip.on("密码修改成功!请重新登录。正在为您退出……", 1, 3000)
                            setTimeout(function () {
                                quickStart.logout()
                            }, 3000)


                        }
                        else {
                            tip.on(res.err)
                        }
                    }
                })
            }
        },
        verifyPassword: function (pw) {
            //var pw = regCheckOut.password;
            var numRe = /[0-9]/;  //匹配数字
            var charRe = /[A-Za-z]/;  //匹配英文字母
            var signRe = /[^0-9A-Za-z]/;  //匹配符号
            var safety = 0;  //安全性的值
            if (pw.length > 5) {
                safety = safety + 10;
            }
            if (numRe.test(pw)) {
                safety = safety + 1;
            }
            if (charRe.test(pw)) {
                safety = safety + 1;
            }
            if (signRe.test(pw)) {
                safety = safety + 1;
            }
            //判断安全性的值
            if (safety < 10) {
                tip.off("密码安全性不足，不能添加用户")
                tip.on("密码安全性不足，不能添加用户")
                return false;
            }
            if (safety == 11) {
                //regCheckOut.isPassPW=true;
                return true;

            }
            if (safety == 12) {
                //regCheckOut.isPassPW=true;
                return true;
            }
            if (safety == 13) {
                //regCheckOut.isPassPW=true;
                return true
            }
        },
        //关闭
        close: function () {
            vm.$orderUser = vm.user = {};
            layout.subClose()
            layout.subUrl=""
            layout.rightTitle=""
        }


    })

    return userEdit = vm;
})