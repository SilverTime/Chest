/**
 * Created by lili on 2015/3/30.
 */
var $ = {};
$.call = function (config) {
    avalon.ready(function () {
        require(["mmRequest"], function () {
            var url = $.call.makeUrl(config.i);
            config.url = url;
            avalon.ajax({
                url: url,
                type: "post",
                data: config.data,
                success: function (res) {
                    //console.log(res)
                    if (!res.err) {
                        //执行成功

                        config.success(res.d)
                    }
                    else {
                        //执行失败
                        config.error(res.err)
                        console.log('服务端执行错误：' + res.m)
                        console.log(res)
                    }
                    if (res.tsy) {
                        cache.go({tsy: res.tsy})

                    }
                }
            });
        })

    })

};
$.call.makeUrl = function (i) {
    var tsy = cache.go("tsy");
    var urlV;
    if (tsy != 'null' && tsy != null && tsy != '') {
        urlV = apiURL + i + '&tsy=' + tsy;
    }
    else {
        urlV = apiURL + i;
    }
    return urlV;
};


//avalon.ajax({
//    url: 'http://www.xmxing.net//panda_api_new/anonymous_car_illegal_list.php',
//    type: "post",
//    data: {
//        phone: 21838194,
//        pass: '1471f23c0513cd19b5993b94763aaff94e935c119ff865296ce5e643758fb3f4',
//        hpzl: 02,
//        hphm: 'BU6112',
//        cjh: 060505,
//    },
//    success: function (res) {
//        console.log(res)
//    }
//});
