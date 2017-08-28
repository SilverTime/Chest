/**
 * Created by mooshroom on 2017/1/25.
 */
define('Goods', function () {
    return obj={
        search: function (data, success, error) {
            var configFn = {
                success: success ? success : function () {
                },
                error: error ? error : function (err) {
                    tip.on(err)
                }
            }

            ws.call({
                i: "Goods/Goods/search",
                data: data,
                success: configFn.success,
                error: configFn.error
            })
        },
    }
})