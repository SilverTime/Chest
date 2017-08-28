# CheckUp.js 数据验证弹出框组件（通常配合whatInput.js组件使用）
张功 2016年5月10日

---
## 功能说明：
针对需要在客户端进行输入的数据进行验证，例如手机号码、身份证号码、密码等。所包含的验证类型如下：
1. pwd  密码（长度大于或等于6）；
2. number 数字；
3. telephone 座机号码；
4. mobile 手机号码；
5. email 电子邮箱；
6. money 金钱格式（整数或只有2为小数的数值）；
7. id 身份证号码。
8. username 用户名 （长度在0~20之间，只能包含字母、数字和下划线）。

## 用法：
引入CheckUp.js


###配合whatInput组件时的使用时：
-----------------------------------------
在页面中插入whatInput组件，ms-data-id，slot为必须参数
 <div style="width: 316px;">
        <tsy:input ms-data-id="'i_value'">
            <input slot="core" class="tsy-input tsy-input-md">
        </tsy:input>
 </div>

####验证数据时使用方法：


 CheckUp(val, type, inputID);

 val: 待验证的字符串
 type: 需验证的类型，或者传入自定义的函数
 inputID: ms-data-id 中定义的名称

 CheckUp会得到返回值数组
 返回一个数组，数组第0项表示是否匹配成功，第1项为提示信息：
 [true,''] 说明匹配成功
 [false,'提示信息'] 说明不匹配

```javascript

//验证密码
CheckUp(val, 'pwd', 'i_value');

//验证数字
CheckUp(val, 'number', 'i_value');

//验证座机号码
CheckUp(val, 'telephone', 'i_value');

//验证手机号码
  CheckUp(val, 'mobile', 'i_value');

//验证邮箱
   CheckUp(val, 'email', 'i_value');

//验证金钱
  CheckUp(val, 'money', 'i_value');

//验证身份证号码
  CheckUp(val, 'id', 'i_value');

//验证用户名
  CheckUp(val, 'username', 'i_value');

//其他自定义的检验方法函数

//例子(自定义邮箱检验)：
     CheckUp(val, function(str){
                            var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                            if (reg.test(str)) {
                                return [true, ''];
                            }
                            return [false, '不是正确的自定义的电子邮箱格式'];
                        }, 'i_value');



```