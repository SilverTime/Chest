/**
 * Created by Administrator on 2015-02-11.
 */

/*……………………………………………………………………………………配置区……………………………………………………………………………………*/


require.config({
    paths: {
        //这里只定义插件以及灵魂的外部入口，插件内部所依赖的在插件内部的ready函数内定义
        MDEditor:'../../plugins/MDEditor/MDEditor.js',
        modal:'../../ui/modal/modal.js',
        stb:'../../plugins/stb/stb.js',

        //soul
        nav:'../../package/nav/nav.js',



        //admin

    }

});
//接口地址
//var apiURL = 'http://demo.api.tansuyun.cn/index.html?i=';
var apiURL = 'http://chest.tansuyun.cn/ajax/?i=';

//开放的权限下的登录验证之后的操作
var openAccessDoing = {
    haveLogin: function () {


    },
    notLogin: function () {

    }
};
//严格的权限下的登录验证之后的操作
var seriousAccessDoing = {
    haveLogin: function () {
//        nav.haveLogin()
    },
    notLogin: function () {

//        nav.stbIn()
        tip.on('您尚未登录或登录已失效，请登录后再执行本次操作！', 0);
        setTimeout(function () {
            tip.off('您尚未登录或登录已失效，请登录后再执行本次操作！', 0);
        }, 15000);
        window.location.href="#!/login"

    }
};

function notLoginG(){
    try{
        login.target=window.location.href
    }catch(err){}
    tip.on('您尚未登录或登录已失效，请登录后再执行本次操作！', 0);
    setTimeout(function () {
        tip.off('您尚未登录或登录已失效，请登录后再执行本次操作！', 0);
    }, 15000);
    window.location.href="#!/login"
}

function logErr(res){
    console.log(res.c+":"+res.m)
}

/*……………………………………………………………………………………layout 视图模型区……………………………………………………………………………………*/
define('layout', function () {

    var vm = avalon.define({
        $id: 'layout',
//        nav: './package/nav/nav.html',
        url: '',
//        footer: './package/public/footer.html',
        showTopBtn:false,
        computHeight:function(){
            //ff的 scroll
            var ffScroll = document.documentElement.scrollTop;
            //其他的 scroll
            var scroll = document.body.scrollTop;
            if(ffScroll >= 100 || scroll >= 100){
                layout.showTopBtn = true;
            } else {
                layout.showTopBtn = false;
            }
            setTimeout(function(){layout.computHeight();},300);
        },

        //火箭
        toTop: function () {
            layout.rocketStatue = 2
            layout.flyFast=20
            //设置加速度
            var a1 = 0.05
            //设置单位时间
            var t = 1000 / 60
            //设置当前时间
            var T = 0

            //设置减速度
            //获取总距离

            //开始的距离
            //已经移动了的距离
            var doneS = 0
            //开始计算
            function fly() {
                var S = getScrollTop()
                if (S != 0) {
//                    console.log("T:"+T)
                    layout.flyFast=200
                    layout.rocketStatue = 2
                    var s = 0//应当移动的距离
                    var v = 0
                    v = a1 * T//当前速度等于加速度乘以当前时间
                    //layout.fireLength=v*2
                    s = v * t//距离等于速度乘以时间
//                    console.log("s:"+s)
                    if(document.documentElement&&document.documentElement.scrollTop)
                    {
                        if (S - s > 0) {
                            document.documentElement.scrollTop = S - s//滚动
                        }
                        else {
                            document.documentElement.scrollTop = S-S/20
                            T=T- T/14

                        }
                    }
                    else if(document.body)
                    {
                        if (S - s > 0) {
                            document.body.scrollTop = S - s//滚动
                        }
                        else {
                            document.body.scrollTop = S-S/10
                            T=T- T/14

                        }
                    }
                    T = T + t//时间流逝
                    doneS = doneS + s//记录里程

                    setTimeout(function () {
                        if (getScrollTop() != 0) {
                            fly()
                        }
                        else{
                            layout.fireLength=0
                            layout.flyFast=0
                            layout.rocketStatue=1
                            setTimeout(function(){
                                layout.rocketStatue=0
                            },2600)
                        }
                    }, t)
                }
            }
            fly()


            setTimeout(function(){
                if(layout.mouseOn){
                    layout.rocketStatue = 1
                }
                else{
                    layout.rocketStatue = 0
                }
                layout.flyFast=0

            },2000)
        },
        flyFast:0,
        mouseOn:false,
        fireLength: 0,
        rocketStatue: 0,//0=休息状态;1=准备起飞;2=飞行中
        rocketReady: function () {
            layout.mouseOn=true
            if (layout.rocketStatue == 0) {

                layout.rocketStatue = 1
            }
        },
        rocketDown: function () {

            if (layout.mouseOn&&(layout.rocketStatue == 1||getScrollTop()==0)) {
                if (layout.rocketStatue == 2) {
                    setTimeout(function () {
                        layout.rocketStatue = 0
                    }, 4000)
                } else {
                    layout.rocketStatue = 0
                }
            }
            layout.mouseOn=false
        },
        /*备选商品*/
        GCList:[],
        goodsCarList:[],
        goodsCarLength:0,
        moreOption:true,
        getCarCache:function(){
            //初始化取得缓存内的商品个数

            require(['../../package/goods/selected'], function () {
                setTimeout(selected.reset,300)
            })
            //layout.GCList = cache.go("$GCList").split(",")

        },

        //展示备用商品列表
        //展示备用商品列表
        showGoodsCar:function(){

            require(['../../package/goods/selected.js'], function () {
                selected.ready()
                avalon.scan()
            })

        },

        subUrl:"",
        rightTitle:"",
        //控制右边框体
        rightShowing:false,
        subToggle:function(){
            layout.rightShowing=!layout.rightShowing
            if(layout.rightShowing){
                //layout.setTimeClose()
            }else{
                layout.clearClose()
            }

        },
        subClose:function(){
            layout.clearClose()
            setTimeout(function () {
                layout.rightShowing=false
            },10)
        },
        subOpen: function () {
            layout.clearClose()
            setTimeout(function () {
                layout.rightShowing=true
                //layout.setTimeClose()
            },10)
        },

        //延迟自动关闭
        readyClose:'',
        setTimeClose: function () {
            layout.clearClose()
            layout.readyClose=setTimeout(function () {
                //layout.subClose()
            },5000)
        },
        clearClose:function(){
            console.log("关闭延迟已清除")
            clearTimeout(layout.readyClose)
        },

        //浏览器版本检测
        browser:{},
        testBrowser:function(){
            require(['browser'],function(){
                console.log("^^^^^^当前浏览器版本^^^^^^")
                console.log(avalon.browser)
                layout.browser=avalon.browser
                if(layout.browser.ie>0&&layout.browser.ie<10){
                    window.location.href="browserErr.html"
                }
            })
        }

    });
    window.layout=vm
    vm.testBrowser()

});

/*……………………………………………………………………………………公共方法堆……………………………………………………………………………………*/

// 预先定义好的TSY，方便操作接口的时候直接调用
var tsy;
function setTsy(){
    tsy = cache.go("tsy");
}
setTsy();




function getScrollTop()
{
    var scrollTop=0;
    if(document.documentElement&&document.documentElement.scrollTop)
    {
        scrollTop=document.documentElement.scrollTop;
    }
    else if(document.body)
    {
        scrollTop=document.body.scrollTop;
    }
    return scrollTop;
}


//跨浏览器事件对象方法
var EventUtil = new Object;
EventUtil.addEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
};

EventUtil.removeEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = null;
    }
};

EventUtil.formatEvent = function (oEvent) {
    if (isIE && isWin) {
        oEvent.charCode = (oEvent.type == "keypress") ? oEvent.keyCode : 0;
        oEvent.eventPhase = 2;
        oEvent.isChar = (oEvent.charCode > 0);
        oEvent.pageX = oEvent.clientX + document.body.scrollLeft;
        oEvent.pageY = oEvent.clientY + document.body.scrollTop;
        oEvent.preventDefault = function () {
            this.returnValue = false;
        };

        if (oEvent.type == "mouseout") {
            oEvent.relatedTarget = oEvent.toElement;
        } else if (oEvent.type == "mouseover") {
            oEvent.relatedTarget = oEvent.fromElement;
        }

        oEvent.stopPropagation = function () {
            this.cancelBubble = true;
        };

        oEvent.target = oEvent.srcElement;
        oEvent.time = (new Date).getTime();
    }
    return oEvent;
};

EventUtil.getEvent = function() {
    if (window.event) {
        return this.formatEvent(window.event);
    } else {
        return EventUtil.getEvent.caller.arguments[0];
    }
}


//new Date的兼容性处理
function newDateAndTime(dateStr){
    var ds = dateStr.split(" ")[0].split("-");
    var ts = dateStr.split(" ")[1]?dateStr.split(" ")[1].split(":"):['00','00','00'];
    var r = new Date();
    r.setFullYear(ds[0],ds[1] - 1, ds[2]);
    r.setHours(ts[0], ts[1], ts[2], 0);
    return r;
}
function NewDate(str) {
    str=str.split('-');
    var date=new Date();
    date.setUTCFullYear(str[0], str[1]-1, str[2]);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}


//批量绑定快捷键
function bindK(obj){
    require(['../../plugins/shortcut/shortcut.js'], function () {
        /*快捷键设置*/

        var x
        for (x in obj) {
            if(x.charAt(0)!="$"){
                if(obj.$opt!=undefined){
                    shortcut.add(x, obj[x],obj.$opt)
                }else{
                    shortcut.add(x, obj[x])
                }

                //console.log(x + "快捷键绑定成功")
            }

        }
    })
}

//批量删除快捷键
function removeK(obj){
    require(['../../plugins/shortcut/shortcut.js'], function () {
        /*快捷键设置*/

        var x
        for (x in obj) {
            if(x.charAt(0)!="$"){
                shortcut.remove(x)
                //console.log(x + "已解除绑定")
            }

        }
    })
}

var $waitTime= 2,$waiting=false;


//用来延迟触发de函数
function listen(fn){
    $waitTime=2

    if(!$waiting){
        $waiting=true
        var listener=setInterval(function(){
            $waitTime--
            if($waitTime==0){
                fn()
                clearInterval(listener)
                $waiting=false
            }
            //todo 调整这里的值可以调整请求延时的长度，越长服务器越好，用户越不好，反之
        },50)
    }
}


function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) obj.className += " " + cls;
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}

function cutLength(el){
    if(el.value.length>=50){

        el.value=el.value.slice(0,49)
        addClass(el,"input-err")

        try{
            tip.on("输入内容太长啦~~")
        }
        catch(err){
            console.log(err.message)
        }

    }else{
        removeClass(el,"input-err")
    }
}

function ForEach(obj, func) {
    if(typeof obj=="object"){
        if(obj.length==undefined){
            for (var i in obj) {
                func(obj[i],i);
            }
        }else{
            for (var i = 0; i < obj.length; i++) {
                func(obj[i],i);
            }
        }
    }else{
        console.log('类型错误:'+JSON.stringify(obj))
    }
}

//获取url参数 cid（企业编号）
function getComFromURL(){
    var Request = new GetRequest();
    var cid=Request['cid']
    if(cid==undefined||cid==null||cid==''){
        return 0
    }
    return cid
}
function GetRequest() {

    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}


//界面跳转的封装函数
function goto(href){
    window.location.href=href
}

//打开企业失败
function notInCom() {
    console.log('!!!!!企业开启失败')
    window.location.href = "#!/login"
    function changeState() {
        login.state = "success"
        login.getMineCompany()
    }

    try {
        changeState()
    } catch (err) {
        setTimeout(changeState, 300)
    }
}

//
function logouted(){
    require(['../../package/quickStart/quickStart'], function () {
        quickStart.inSide = false
        //tip.on("已退出登录", 1, 3000)
        cache.go({
            "Token": "",
            "un": "",
            "uid": "",
            "HURL": "",
            SID:""
        })
        doorC.reset()
        door.reset()
        window.location.href = "my.html#!/login"
    })

}

//添加默认的租赁价格
function P3Init(GoodsID,P1,callback){
    if(P1===undefined){
        P1=0
    }
    ws.call({
        i:"Store/GoodsPrice/add",
        data:{
            GoodsID:GoodsID,

                TypeID:3,
                Price:P1,
        },
        success: function (res,err) {
            if(err){
                console.log('价格保存失败'+err)
                return
            }
            callback(res)
        }
    })
}