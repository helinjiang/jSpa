/**
 * 业务处理模块，如果是一些公共且和具体业务关系不大的模块，请放入到util.js中
 *
 */
window.ACTION = (function() {

    /**
     * 初始化页面
     * @author linjianghe
     * @date   2015-07-15
     */
    function initSystem() {


        // 初始化jwap框架
        UTIL.initJWap();

        // 初始化widget/shop.js组件
        UTIL.initShop();

        if (typeof SHOP !== "undefined" && SHOP.isSupport()) {
            CACHE.debug = false;
        } else {
            CACHE.debug = true;
        }

    }


    /**
     * 重新加载页面。
     *
     * 如果是“懒重载”，则为重新请求数据，然后重新全局渲染；否则，简单的location.reload重新请求页面，这种方式最为暴力
     *
     * @param  {Boolean}   lazyLoad 是否是“懒重载”
     * @author linjianghe
     * @date   2015-09-23
     */
    function reload(lazyLoad) {
        if (lazyLoad) {
            // ...
        } else {
            UTIL.reload();
        }
    }

    var exports = {
        "initSystem": initSystem,
        "reload": reload
    };

    return exports;

})();
