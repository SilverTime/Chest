/**
 * Created by mooshroom on 2015-06-12.
 * 版本：V3.0.0
 * 使用avalon组件模式重构
 */
define([
        //引入所依赖的文件
        "avalon",
        'text!../../ui/tip/tip.html',
        'css!../../ui/tip/tip.css'
    ],
    function (avalon, html) {
        var widget = avalon.ui.tip = function (element, data, vmodels) {
            var options = data.tipOptions//取得配置
            var objId = data.tipId//声明新生成组件的ID
            /**
             * 这里之所以要用"data.tipOptions"以及"data.tipId"，是因为我们这里定义的是："avalon.ui.tip"
             * 所以，如果我们定义的是"avalon.ui.xxx",那么这里就要使用data.xxxOptions和data.xxxId
             * 为什么？因为avalon给你把字符串拼接好了~要换一套规则，就去修改他源码吧
             */

            var vmodel = avalon.define({
                $id: objId,

                //使用$init可以让avalon自动在加载成功之后执行里面的方法
                $init: function () {
                    //填充DOM结构
                    element.innerHTML = html

                    //扫描新添加进来的DOM节点，一定要传第二个参数，否则有的东西扫描不到
                    avalon.scan(element, [vmodel].concat(vmodels))

                    /*
                     * 组件的$init方法里面,
                     * 在扫描后最好再调用一个onInit回调,传入当前组件的 vmodel, options, vmodels, this指向当前元素
                     * 这样用户就不需要定义组件的$id了
                     * (据说是这样，然而并没有感觉到什么卵用)
                     */
                    if (typeof vmodel.onInit === "function") {
                        vmodel.onInit.call(element, vmodel, options, vmodels)
                    }

                },

                //自爆~，自我销毁函数，在组件移除的时候自动调用这里面的方法
                $remove: function () {
                    element.innerHTML = ""

                },

                //并不知道有什么用，但是规范上面说要有这个方法（囧）
                onInit:function(){

                },

                /********以下是正常的组件的各个属性********/

                tips: [],    //要显示的提示信息
                tipsError: [],  //要显示的错误提示信息
                //isShow: false,  // 控制提示框的出现
                //提示信息
                infoObject: {
                    login: '登录中。。。。。。',
                    search: '搜索中。。。。。。',
                    data: '数据加载中。。。。。。',
                    submit: '提交中。。。。。。',
                    register: '注册成功！！！',
                    loginIn: '登录成功！！！',
                    loginOut: '退出登录成功！！！'
                },
//错误提示信息
                errorObject: {
                    login: '登录失败！！！',
                    register: '注册失败！！！',
                    submit: '提交失败！！！',
                    loginOut: '未登录，请登录！！！',
                    system: '系统错误！！！'
                },

                //message: 为提示的信息，id: 1为正常消息提示 0为错误消息提示
                on: function (message, id, time) {

                    var id=id||0
                        vmodel.tips.push({
                            msg:message,
                            type:id
                        });
                        if (time != null) {
                            setTimeout(function () {
                                vmodel.off(message, id);
                            }, time);
                        }
                        else {
                            //设置提示关闭默认时间
                            setTimeout(function () {
                                vmodel.off(message, id);
                            }, 15000);
                        }
                },

                off: function (message, id) {

                        if (message == '') {
                            vmodel.tips = [];
                        }
                        for (var i = 0; i < vmodel.tips.length; i++) {
                            if (vmodel.tips[i].msg == message&&vmodel.tips[i].type==id) {
                                break;
                            }
                        }
                        vmodel.tips.splice(i, 1);

                },

                //手动关闭
                close: function (index) {

                    //判断是正常提示消息还是错误提示消息（1为正常0为错误）
                        vmodel.tips.splice(index,1);
                }
                /********以上是正常的组件的各个属性********/
            })

            //传入配置，传入方法就是把option里面的属性和刚才创建的VM里面的属性搅拌起来
            avalon.mix(vmodel, options)

            //最后把创建好的VM赋值给当前域下面的以VM的ID为名称的对象里面去，我们就能在当前域调用了
            return this[objId] = vmodel
        }

        //这是给默认配置的地方，在这里暂时还用不上
        widget.defaults = {}

        //传说一定要这样,不过我注释了也没有什么异常
        return avalon
    })