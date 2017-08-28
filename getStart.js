/**
 * Created by Administrator on 2015/8/10 0010.
 */
define('getStart', ['avalon'], function (avalon) {
    var vm = avalon.define({
        $id: "getStart",
        ready: function () {
            avalon.scan()
            vm.getCompanyList()
            vm.getDomian()

        },
        //抓取之前使用的域名
        CompanyDomian:'',
        getDomian: function () {
          vm.CompanyDomian=cache.go('CompanyDomian')
        },
        //控制表单的显示
        toggle: false,

        //点击开始按钮触发的函数
        start: function () {
            vm.toggle = true;

        },

        //控制焦点输入框的提示显示

        focusing: 0,
        focus: function (i) {
            vm.focusing == i
        },

        //抓取已注册的公司
        P:0,
        N:64,
        CList:[],
        getCompanyList: function () {
            ws.call({
                i:"Company/get",
                data:{
                    P:vm.P+1,
                    N:vm.N,

                },
                success: function (res) {
                    if(!res.err){
                        var list=vm.CList
                        for(var i=0;i<res.d.length;i++){
                            list.push(res.d[i])
                        }
                        vm.CList=list

                    }else{
                        console.log(err)
                    }

                }

            })
        },

        //创建公司
        Company: {
            Name: '',
            Address: '',
            Contact: '',
            Phone: '',
            Domain: '',
            //Config:[],//此处可选配置自己的数据库服务器，属于高级配置部分，包括redis缓存服务器的配置也可以，不配置的时候使用公用服务器，自动生成
            UN: '',
            PWD: ""

        },
        rePWD: '',
        //验证数据
        checkInput: function () {

            //验证手机号码
            function phone() {
                var telReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (telReg.test(vm.Company.Phone)) {
                    //验证通过
                    return true
                }
                else {
                    tip.on("电话号码没有填写正确！")
                }

            }

            //验证个性域名
            function domain() {
                return true
            }

            //验证密码
            function pwd() {
                var pw=vm.Company.PWD
                var numRe = /[0-9]/;  //匹配数字
                var charRe = /[A-Za-z]/;  //匹配英文字母
                var signRe = /[^0-9A-Za-z]/;  //匹配符号
                var safety = 0;  //安全性的值
                if(pw.length >5){
                    safety = safety + 10;
                }
                if(numRe.test(pw)){
                    safety = safety + 1;
                }
                if(charRe.test(pw)){
                    safety = safety + 1;
                }
                if(signRe.test(pw)){
                    safety = safety + 1;
                }
                //判断安全性的值
                if(pw==vm.rePWD){
                    if(safety < 10){
                        tip.on('密码过于简单，不能注册') ;
                        return false
                    }
                    else{
                        return true
                    }
                }else{
                    tip.on("两次输入的密码不一致，请检查密码")
                    return false
                }

            }

            if (phone() && domain() && pwd()) {
                return true
            }
            else {
                return false
            }

        },
        CompanyRegist: function () {
            //验证表单完善性
            function isOver() {
                var over = true
                var x;
                for (x in vm.Company) {
                    if (x.charAt(0) != '$' && vm.Company[x] == '') {
                        //这个没有填写
                        over = false
                        tip.on('没有填写' + x)
                    }
                }
                return over
            }


            if (isOver() && vm.checkInput()) {
                ws.call({
                    i: "Company/regist",
                    data: {
                        Name: vm.Company.Name,
                        Address: vm.Company.Address,
                        Contact: vm.Company.Contact,
                        Phone: vm.Company.Phone,
                        Domain: vm.Company.Domain,
                        //Config:[],//此处可选配置自己的数据库服务器，属于高级配置部分，包括redis缓存服务器的配置也可以，不配置的时候使用公用服务器，自动生成
                        UN: vm.Company.UN,
                        PWD: vm.Company.PWD
                    },
                    success: function (res) {
                        if (!res.err) {
                            //创建成功
                            vm.goCompany()
                        }
                        else{
                            console.log(res)
                        }
                    }
                })
            }


        },

        //注册成功之后跳转
        goCompany: function () {
            var target = "http://" + vm.Company.Domain + ".chest.tansuyun.cn"
            cache.go({
                CompanyDomian: target
            })
            window.location.href = target
        }


    })
    return getStart = vm
})
