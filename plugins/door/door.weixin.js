/**
 * Created by Administrator on 2015/4/22.
 */
/*
 * 微信版门禁系统使用说明
 * -----------------------
 * 处理流程：
 * 1、在微信菜单栏上绑定的地址如下
 *  https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6f12bf629ebda6dc&redirect_uri=http%3a%2f%2fwww.renchebond.com%2fOpenID.html&response_type=code&scope=snsapi_base&state=321#wechat_redirect
 * 2、然后用户在微信的破服务器上面跑一圈之后会回到www.renchebond.com/mobile.html，并且会在地址后面带上参数code和state。
 * state不重要，(毛线，很重要)
 * 3、getCode()这个方法就是用来从URL中解析出code的值，
 * 4、然后将code的值发送给后端，
 * 5、再由后端拿着这个code去问微信要用户的openID，要到了之后进行登录之类的操作，然后返回结果
 * 6、然后，该怎么弄怎么弄了
 * -----------------------
 * 詹伟，2015.4.24
 * */

/*
 https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6f12bf629ebda6dc&redirect_uri=http%3a%2f%2fwww.renchebond.com%2fWLogin.html&response_type=code&scope=snsapi_base&state=#wechat_redirect
 */

var doorWX = {
    UID: "",
    isLogined: false,
    code: "",
    target: "",
    //解析获得code
    getCode: function () {

        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }

        //获取目标业务页面
        if(theRequest.state){
            doorWX.target = theRequest.state;
        }

        //获取登录所用的code
        if (theRequest.code) {
            doorWX.code = theRequest.code;

            //执行请求动作
            try{
                doorWX.WCodeLogin(doorWX.code);
            }catch (err){
                alert(err.message)
            }



        }

    },

    //执行登录请求
    WCodeLogin: function (code) {
        tip.on("正在为您的登录",1)
        $.call({
            i: "WLogin",
            type: "post",
            data: {
                WechatID: 1,
                code: code
            },
            success: function (data) {

                if (data.c == 200) {
//                    alert(data.c)
                    //请求成功
                    if (data.uid !== "") {
                        tip.off("正在为您的登录",1)
                        tip.on("登录成功", 1)
                        doorWX.UID = data.d.UID;
                        //如果登录成
                        doorWX.isLogined = true
                        setCookie("tsy", data.tsy);
                        setCookie("un", data.un);
                        setCookie("uid", data.uid);
                        setCookie("HURL",data.HURL);
                        setCookie("openid",data.d.openid)
                    } else {
                        //如果登录不成功


                        tip.off("正在为您的登录",1)
                        tip.on("登录失败", 0)
                        doorWX.isLogined = false
                        setCookie("tsy", data.tsy);
                        setCookie("un", data.un);
                        setCookie("uid", data.uid);
                        setCookie("HURL",data.HURL);
                        setCookie("openid",data.d.openid)
                    }
                    window.location.href="./mobile.html#!/"+doorWX.target

                }
                //用户通过微信登录成功，但是没有绑定
                else if(data.c==403.1){
                    setCookie("openid",data.d.openid)
                    tip.off("正在为您的登录",1)
                    tip.on("您的尚未绑定人车帮的账户，请先绑定您的人车帮账户",1)
                    require(['regCheckOut','loginJS'], function () {
                        include.url = "./plugins/strawberry/stb.html";
                    })
                }
                else{
                    tip.on(data.m,0)
                }
            }
        })
    }

};



