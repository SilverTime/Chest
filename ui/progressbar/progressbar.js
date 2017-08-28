define([
    "avalon",
    "text!.. /../ui/progressbar/progressbar.html",
    "css!../../ui/progressbar/progressbar.css"
    ],function(avalon,html){
        var widget = avalon.ui.progressbar = function(element,data,vmodels){
            var options = data.progressbarOptions;     //取得配置
            var objId = data.progressbarId;        //声明新生成组件的ID
            var vm = avalon.define({
                $id:"progressbar",
                $init:function(){       //组件加载成功后自动执行
                    element.innerHTML = html;       //填充DOM

                    //扫描新添加节点，第二个参数必要
                    avalon.scan(element,[vm].concat(vmodels));

                    /*
                     * 扫描后再调用onInit回调,传入当前组件
                     * vmodel, options, vmodels, this 指向当前元素
                     * 不需要定义组件$id了
                     */
                    if(typeof vm.onInit === "function"){
                        vm.onInit.call(element,vm,options,vmodels);
                    }
                },
                $remove:function(){     //销毁时调用
                    element.innerHTML = "";
                },
                onInit:function(){

                },
                present:0,
                scope:20,
                down:1,
                timeout:null,
                timeend:null,
                waitime:100,
                state:"default",//"default"默认状态； running 读条中；
                startT:function(){
                    if(vm.state=="running"){
                        vm.resetT()
                    }
                    if(vm.timeout != null){
                        clearInterval(vm.timeout);

                    }
                    vm.state="running"
                    vm.timeout=setInterval(run,vm.waitime)

                    function run(){
                        if(vm.state=="running"){
                            var s=(100-vm.present)/20
                            if(vm.present+s>99.5){
                                vm.present=99.5
                            }
                            else{
                                vm.present+=s
                            }


                        }

                    }

                },
                endT:function(){
                    var last=100-vm.present
                    if(vm.timeout != null) {
                        clearInterval(vm.timeout);
                    }
                    if(vm.timeend != null) {
                        clearInterval(vm.timeend);
                    }
                    vm.timeend = setInterval(function(){
                        if(vm.present < 100){
                            var s=vm.present+last/2.5
                            if(s<99){
                                vm.present=s
                            }else{
                                vm.present=100
                            }
                        }
                        else {
                            if(vm.timeout != null){
                                clearInterval(vm.timeend);

                                setTimeout(function(){
                                    vm.state="default"
                                    vm.resetT()
                                },500)

                            }
                        }
                    },vm.waitime);

                },
                pauseT:function(){
                    if(vm.timeout != null){
                        clearInterval(vm.timeout);
                        clearInterval(vm.timeend)
                    }
                },
                resetT:function() {
                    if(vm.timeout != null){
                        clearInterval(vm.timeout);
                        clearInterval(vm.timeend)
                        vm.timeout = null;
                    }
                    //vm.waitime = 10;
                    vm.present = 0;
                    vm.scope=20
                    vm.state="default"
                }
            });
            avalon.mix(vm,options);     //传入配置
            return this[objId] = vm;        //vm赋值给当前域下以vm的Id命名的对象，在当前域调用
        };
    widget.default = {};        //默认配置
    return avalon;
});
