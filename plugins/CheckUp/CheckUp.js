/**
 * Created by Chris Chang on 2016/5/7.
 *
 * 调用CheckUp()方法检查字段类型
 * ---------------------------
 * 传入：
 * val 要检查的字段值
 * type 要检查是不是符合什么类型的数据
 * inputID 输入框的ID，将用于匹配完成之后弹出指定ID输入框输入框提示，依赖于 whatInput 组件（可选）
 *          如果匹配成功，则会调用 inputID.success()
 *          如果匹配失败，则会调用 inputID.error(tip)
 * ---------------------------
 * 返回一个数组，数组第0项表示是否匹配成功，第1项为提示信息：
 * [true,'提示信息'] 说明匹配成功
 * [false,'提示信息'] 说明不匹配
 * --------------------------
 * 所以在判断是否检查通过的时候：
 *
 * if(CheckUp(val,pwd)[0]===false){
 *      //错误操作
 * }
 *
 * 在手动处理提示信息的时候：
 *  var errorMassage=CheckUp(val,pwd)[1]
 */
define('CheckUp', [], function () {
    return CheckUp = function (val, type, inputID) {
        if(typeof type=='string'){

            type=type.toLowerCase();

        }

        //以下验证表达式
        var checkUtil = {
            pwd: function () {     //匹配密码
                if(val===undefined||val===null||val===''){
                    return [false, '请输入密码'];
                }
                //长度匹配
                if (val.length < 6) {
                    return [false, '密码错误：长度应不小于6'];
                }
                else if (val.length > 18) {
                    return [false, '密码错误：长度应不大于18'];
                }

                //内容匹配
                if (val.match(/[a-zA-Z]+/g)===null) {
                    return [false, "密码必须含有英文字母"];
                }
                if (val.match(/\d+/g)===null) {
                    return [false, "密码必须含有数字"];
                }
                return [true,''];

            },
            number: function () {
                var reg = /^[0-9-][0-9.]+$/;     //排除十六进制和未写整数部分的小数等情况
                if (reg.test(val)) {
                    if (isNaN(val)) {
                        try {
                            inputID.error("您输入的不是数字")
                        } catch (err) {
                            console.log(err);
                        }
                        return [false, '您输入的不是数字'];

                    }
                    return [true,''];
                }
                return [false, '您输入的不是数字'];

            },
            telephone: function () {
                var reg = /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/;///^\d{3}-\d{8}|\d{4}-\d{7}$/;///([0-9]{3,4}-)?[0-9]{7,8}/;d{3}-d{8}|d{4}-d{7};^((d{3,4})|d{3,4}-)?d{7,8}$
                if(val===undefined||val===null||val===''){
                    return [false, '请输入座机号码'];
                }
                if (reg.test(val)) {
                    return [true, ''];
                }
                return [false, '不是正确的座机号码'];
            },

            mobile: function () {
                //最新手机号段归属地数据库(2015年10月18日)
                /*  三大运营商最新号段  合作版
                 移动号段：
                 134 135 136 137 138 139 147 150 151 152 157 158 159 178（新） 182 183 184 187 188
                 联通号段：
                 130 131 132 145 155 156 175（新） 176（新） 185 186
                 电信号段：
                 133 153 177 180 181 189
                 虚拟运营商:
                 170
                 总结：
                 130-139/180-189
                 145 、147
                 150-153 、155-159
                 170 、175 、176 、177 、178
                 */
                var reg = /^((1[38][0-9][0-9]{8})|(14[57][0-9]{8})|(15[012356789][0-9]{8})|(17[05678][0-9]{8}))$/;
                if(val===undefined||val===null||val===''){
                    return [false, '请输入非空的手机号码'];
                }
                if (reg.test(val)) {
                    return [true, ''];
                }
                return [false, '不是正确的手机号码'];

            },
            email: function () {    //电子邮箱
                var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                if(val===undefined||val===null||val===''){
                    return [false, '请输入电子邮箱'];
                }
                if (reg.test(val)) {
                    return [true, ''];
                }
                return [false, '不是正确的电子邮箱格式'];
            },
            money: function () {
                var reg = /^[0-9]+(.[0-9]{1,2})?$/;
                if (reg.test(val)) {
                    return [true, ''];
                }
                return [false, '不是正确的金额，金额为整数或只有两位小数'];
            },
            id: function () {      //身份证验证
                var reg = /^\d{6}[12]\d{3}[01][0-9][0123][0-9]\d{3}[0-9xX]$/;
                if(val===undefined||val===null||val===''){
                    return [false, '请输入身份证号'];
                }
                if (reg.test(val)) {
                    var yy = parseInt(val[6] + val[7] + val[8] + val[9]);
                    var mm = parseInt(val[10] + val[11]);
                    var dd = parseInt(val[12] + val[13]);
                    var nowdate = new Date();
                    if (yy > nowdate.getFullYear()) {
                        return [false, '不是正确的身份证号码，因为出生年份大于当前年份'];
                    }
                    if (mm > 12 || mm == 0) {
                        return [false, '不是正确的身份证号码，因为出生月份错误'];
                    }
                    var day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    if ((yy % 400 == 0) || (yy / 4 == 0 && yy / 100 != 0)) {
                        day[1] = 29;
                    }
                    if (dd > day[mm - 1] || dd == 0) {
                        return [false, '不是正确的身份证号码，因为出生日期错误'];
                    }
                    return [true, ''];
                }
                return [false, '不是正确的身份证号码，因为出生日期错误'];
            },
            username: function () {
                //长度匹配
                if(val===undefined||val===null||val===''){
                    return [false, '请输入用户名'];
                }
                if (val.length>20) {
                    return [false, '长度应不大于20'];
                }
                var reg = /[a-zA-Z\u4E00-\u9FA5]\w{0,20}/;        //长度在0~20之间，只能包含中文字母、数字和下划线。
                if (reg.test(val)) {
                    return [true, ''];
                }
                return [false, '用户名只能包含字母、数字和下划线'];
            }
        };
        var result = [false, '未知错误']
        switch (type) {
            case 'pwd':
                result = checkUtil.pwd();
                break;

            case "number":
                result = checkUtil.number();
                break;

            case 'telephone':
                result = checkUtil.telephone();
                break;

            case 'mobile':
                result = checkUtil.mobile();
                break;

            case 'email':
                result = checkUtil.email();
                break;

            case 'money':
                result = checkUtil.money();
                break;

            case 'id':
                result = checkUtil.id();
                break;

            case 'username':
                result = checkUtil.username();
                break;

            default :
                //自定义的函数
                try{
                    result = type(val)
                }catch (err){}

        }


        try {
            if (result[0]) {
                window[inputID].success();
            } else {
                window[inputID].error(result[1]);
            }
        } catch (err) {
            //todo 扩展为支持传入一个回掉函数，用于判断完成之后执行
            console.log(result);
        }

        return result

    }
})
