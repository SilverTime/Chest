/**
 * Created by mooshroom on 2015/9/22.
 */
define('more',
    [
        'avalon',
        'text!../../package/more/more.html',
        'text!../../package/more/member.html',
        'text!../../package/more/init.html',
        'css!../../package/more/more'
    ],
    function(avalon,html,member,init){
    var vm=avalon.define({
        $id:"more",
        ready: function (i) {
            layout.url=html
            vm.nowTable=i

            //执行各自的初始化方法
            vm.tableList[i].ready()
        },

        url:'',

        //标签
        tableList:[
            {
                name:'员工管理',
                href:"#!/more/0",
                ready:function(){
                    vm.url=member
                    vm.adding=false
                    vm.nowUser.uid=cache.go("uid")
                    vm.getUser()
                }
            },
            {
                name:'基础数据管理',
                href:"#!/more/1",
                ready:function(){
                    vm.url=init
                    vm.initState=0
                }
            }
        ],
        //当前活动的表格
        nowTable:0,

        /************员工管理*******************/


        nowUser:{
            uid:""
        },

        adding:false,
        toggleAdd: function () {
            vm.adding=!vm.adding
        },

        //添加用户
        newUser:{
            'UN':"",
            'PWD':"",
            'Memo':"",
            'Number':"",
            'Phone':"",
            'Job':""
        },
        //清空表单
        addUserReset: function () {
            vm.newUser={
                'UN':"",
                'PWD':"",
                'Memo':"",
                'Number':"",
                'Phone':"",
                'Job':""
            }
        },
        verifyPassword: function(pw){
            //var pw = regCheckOut.password;
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
            if(safety < 10){
                tip.off("密码安全性不足，不能添加用户")
                tip.on("密码安全性不足，不能添加用户")
                return false ;
            }
            if(safety == 11){
                //regCheckOut.isPassPW=true;
                return true;

            }
            if(safety == 12){
                //regCheckOut.isPassPW=true;
                return true;
            }
            if(safety == 13){
                //regCheckOut.isPassPW=true;
                return true
            }
        },
        addUser: function () {

            var newUser={}
            //检查并转化数据
            function check(data){
                //验证用户名
                if(data.UN===""){
                    tip.on("姓名不能为空!")
                    return false
                }else{
                    newUser.UN=data.UN;

                    //验证密码
                    if(!vm.verifyPassword(data.PWD)){
                        return false
                    }else{
                        newUser.PWD=data.PWD
                        newUser.Number=data.Number
                        newUser.Phone=data.Phone
                        newUser.Job=data.Job
                        //newUser.Memo=data.Memo
                        return true
                    }

                }

            }

            if(check(vm.newUser)){
                ws.call({
                    i:"User/add",
                    data:newUser,
                    success:function(res){
                        if(!res.err){
                            if(res.UID>0){
                                tip.on("新用户添加成功",1,3000)
                                vm.addUserReset()
                                //重新获取用户列表
                                vm.getUser()
                            }
                        }
                        else{
                            console.log(res.err)
                            tip.on(res.err)
                        }
                    }
                })
            }

        },

        //获取用户列表
        userList:[],
        my:{},
        getUser: function () {
            ws.call({
                i:"User/get",
                success:function(res){
                    if(!res.err){
                            vm.userList=res

                        //找出自己的信息
                        for(var i=0;i<res.length;i++){
                            if(res[i].UID==cache.go("uid")){
                                //找到了
                                vm.my=res[i]
                                break
                            }
                        }
                    }
                    else{
                        console.log(res.err)
                    }
                }
            })
        },

        //禁用与启用
        userToggle: function (UID,i) {
            ws.call({
                i: "User/save",
                data: {
                    UID: UID,
                    Params: {
                        Disable:i
                    }
                },
                success: function (res,err) {
                    if (!res.err) {
                        tip.on("保存成功", 1, 3000)
                        more.getUser()
                    }
                }
            })
        },

        toEdit: function (obj,type) {
            var html='';
            switch(type){
                case 0:
                    //编辑普通那个信息
                    html='text!../../package/more/modal-userEdit.html';
                    break
                case 1:
                     //编辑密码
                    html='text!../../package/more/modal-pwdEdit.html';
                    break
            }

           require(['../../package/more/userEdit',html], function (userEdit,body) {
                //var body=""
               layout.subUrl = body
               layout.rightTitle="用户编辑"
               layout.subOpen()
               console.log(obj)
               userEdit.ready(obj)
               //avalon.scan()
           })
        },



        /************基础数据管理*******************/
        initState:0,//状态
        init: function (i) {
            //todo 开启导入导出功能
            tip.on("导入导出功能暂时未开放",1,3000)
            //vm.initState=i
        },

        file:null,
        //文件上传
        readFile:function(){
            var file=document.getElementById("inFile").files[0];
            if(file){
                var fileSize = 0;
                if (file.size > 1024 * 1024)
                    fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                else
                    fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

                vm.file=file

                return file
            }
        },

        uploadFile: function () {
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            //fd.append("author", "Shiv Kumar");
            //fd.append("name", "Html 5 File API/FormData");
            fd.append("fileToUpload", vm.readFile());

            /* event listners */
            xhr.upload.addEventListener("progress", uploadProgress, false);
            xhr.addEventListener("load", uploadComplete, false);
            xhr.addEventListener("error", uploadFailed, false);
            xhr.addEventListener("abort", uploadCanceled, false);
            /* Be sure to change the url below to the url of your upload server side script */
            xhr.open("POST", "http://api.tansuyun.cn?i=50");
            xhr.send(fd);


            //进度条
            function uploadProgress(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                    document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
                }
                else {
                    document.getElementById('progressNumber').innerHTML = 'unable to compute';
                }
            }

            //成功之后的回调
            function uploadComplete(evt) {
                /* This event is raised when the server send back a response */
                alert(evt.target.responseText);
            }

            //失败之后的回调
            function uploadFailed(evt) {
                alert("There was an error attempting to upload the file.");
            }

            //取消之后的回调
            function uploadCanceled(evt) {
                alert("The upload has been canceled by the user or the browser dropped the connection.");
            }
        }



    })

        return more=vm
})