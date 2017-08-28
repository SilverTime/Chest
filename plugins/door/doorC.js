/**
 * Created by mooshroom on 2016/6/7.
 *
 * 企业进入门禁，思路与door一样
 * 用于鉴定是否进入企业以及进入了哪个企业
 *
 * 重置：doorC.reset()
 * 验证: doorc.comeIn()
 */
define('doorC', function () {





    function goto(){
        avalon.nextTick(function () {
            doorC.lastPage=''
        })
        if(doorC.lastPage!=""){
            window.location.href='?cid=' +
                doorC.CompanyID +
                '#' +
                doorC.lastPage
        }
    }

    function hiddeLoginPanel(){
        try{
            require(['../../package/login/login'], function (login) {
                login.hiddeDoor()

            })
        }catch (err){
            setTimeout(hiddeLoginPanel,400)
        }
    }




    return doorC={
        com:{},
        CompanyID:0,
        lastPage:'',
        comeIn: function (success,fail) {


            //开始验证
            if(Number(doorC.CompanyID)>0){
                //企业已进入

                success(doorC.com)
                //hiddeLoginPanel()

                //goto()
            }else{
                //企业未进入
                //记录当前页
                doorC.lastPage=location.hash
                //抓取url参数
                var cid=getComFromURL()

                if(cid==0){
                    doorC.reset()
                    fail()
                    return
                }

                //尝试进入企业
                ws.call({
                    i:"Company/Company/open",
                    data:{
                        CompanyID:cid
                    },
                    success: function (res,err) {
                        if(res==false||err){
                            if(err){
                                tip.on(err)
                            }else{
                                tip.on('打开企业失败，请尝试重新打开')
                            }
                            fail()
                            doorC.reset()
                            return
                        }

                        avalon.mix(doorC,{
                            com:res,
                            CompanyID:res.CompanyID
                        })

                        cache.go({
                            cid:res.CompanyID,
                            cname:res.Name
                        })

                        success(res)
                        hiddeLoginPanel()

                        //goto()
                    }
                })

            }
        },
        reset: function () {
            avalon.mix(doorC,{
                com:{},
                CompanyID:0,
                lastPage:'',
            })
        }
    }
})
