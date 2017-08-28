/**
 * Created by luodan on 2015/3/2 0002.
 */
define('regCheckOut',function(){
    return regCheckOut = {

        isPassUN: false,  //用于判断“用户名”是否通过验证
        isPassPW: false,  //用于判断“密码”是否通过验证
        isPassEM: false,  //用于判断“邮箱”是否通过验证

        //验证用户名
        verifyUsername: function(un){
            //var un = regCheckOut.username;
            var unRe = /^[0-9]/;
            var unSRe= /[^\u4e00-\u9fa50-9A-Za-z]/;
            if(un == ''){
                return '用户名不能为空';
            }
            else if(un.length > 50){
                return '用户名过长';
            }
            //判断首字母是否为数字
            else if(unRe.test(un)){
                return '用户名不可以以数字开头';
            }
            //用户名只能包含汉字、英文字母、数字
            else if(unSRe.test(un)){

                return '用户名中不能包含特殊符号';
            }
            else{
                regCheckOut.isPassUN=true;
                return 1;

            }
        },

        //验证用户名是否被使用
        submitUN: function(un){
            if(regCheckOut.isPassUN == false){
                regCheckOut.verifyUsername(un);
            }
            else{
                //TODO:将用户名作为参数发送至API检测用户名是否被使用,如果被使用，提示用户名已被注册了，否则通过
            }
        },

//验证密码
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
                return '密码安全性：完全没有~（不允许注册！）' ;
            }
            if(safety == 11){
                regCheckOut.isPassPW=true;
                return 1;

            }
            if(safety == 12){
                regCheckOut.isPassPW=true;
                return 1;
            }
            if(safety == 13){
                regCheckOut.isPassPW=true;
                return 1;
            }
        },
//验证邮箱
        verifyEmail: function(em){
            //var em = regCheckOut.email;
            var emRe = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
            if(em == ''){
                return'邮箱不能为空' ;
            }
            else if(emRe.test(em)){
                regCheckOut.isPassEM=true;
                return 1;
            }
            else{
                return'请输入正确的邮箱' ;
            }
        },
        //验证邀请码
        verifyCode:function(em){
            if(em == ''){
                return'邀请码为空不能注册，请联系mooshroom' ;
            }
            else if(em=="我爱碳素云"){
                regCheckOut.isPassEM=true;
                return 1;
            }
            else{
                return'请输入正确的邀请码' ;
            }
        },

        //验证邮箱是否被使用
        submitEM: function(em){
            if(regCheckOut.isPassEM == false){
                regCheckOut.verifyEmail(em);
            }
            else{
                //TODO:将邮箱作为参数发送至API检测邮箱是否被使用,如果被使用，提示邮箱已被注册了，否则通过
            }
        },

        //注册
        register: function(un,pw,em) {
            if (un == '' || pw == '' || em == '') {
                return '输入不能为空';
            }
            else if (regCheckOut.isPassUN == false || regCheckOut.isPassPW == false || regCheckOut.isPassEM == false) {
                var prompt = '';
                if (regCheckOut.isPassUN == false) {
                    prompt = prompt + '用户名 ';
                }
                else if (regCheckOut.isPassPW == false) {
                    prompt = prompt + '密码 ';
                }
                else if (regCheckOut.isPassEM == false) {
                    prompt = prompt + '邮箱 ';
                }
                return prompt + '输入格式不正确';

            }
            else {
                return 1;
            }
        }
    }
});