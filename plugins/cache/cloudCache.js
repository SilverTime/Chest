/**
 * Created by mooshroom on 2015/9/26.
 * 云缓存插件
 * 依赖 mmResquest call
 *
 *todo 经过实战调整之后添加大tsyStart中去
 *
 * 关于如何启用：window.cc=new cc('TennisClub')
 */

define('cc', [
    'mmRequest'
], function () {
    return cc = function (group) {
        var group = group != undefined ? group : "global"
        this.Get = function (key, callback) {
            $$.call({
                i: "Kv/Kv/get",
                data: {
                    Key: key,
                    Default: null,
                    Group: group
                },
                success: function (res) {
                    var res = JSON.parse(res[key])
                    callback(res)
                    console.log("获取" + key + '成功：' + res)
                },
                error: function (err) {

                    callback({},err)
                    console.log("获取" + key + '失败')
                }
            })
        }
        this.Set = function (key, data, callback) {
            $$.call({
                i: "Kv/Kv/set",
                data: {
                    Key: key,
                    Value: JSON.stringify(data),
                    Default: null,
                    Group: group
                },
                success: function (res) {
                    var res = JSON.parse(res)
                    callback(res)
                    console.log("设置" + key + '成功：' + res)
                },
                error: function (err) {

                    callback({},err)
                    console.log("设置" + key + '失败')
                }
            })
        }

    }
})