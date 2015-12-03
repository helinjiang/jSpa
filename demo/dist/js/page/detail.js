/**
 * 虚拟页面"detail"，对应于设置了data-defpageid="detail"的div区域
 *
 * 在本页面中，我们定义了两个接口，分别是:
 *     switchDo：切换到本页面时触发的函数，响应switch事件，这个每个页面都必须要定义，否则无法“切换”页面
 *     getPageObj：获得本页Page对象，非必须，在event.js等页面使用时，便于操作相应的DOM
 *
 * 注意：在设置html代码时，建议用jSpa框架提供的设置，而不要采用Zepto框架的设置方法，这样可以更方便处理事件（比如active）
 *
 * @author helinjiang
 * @date   2015-11-30
 */
window.PAGEDETAIL = (function () {

    /**
     * 当前的页面对象，是一个jSpa.Page对象
     * @type {Object}
     */
    var curPageObj;

    /**
     * 当前的页面 container ，在通过$等找元素时的最外层父元素，可以看作是虚拟页面的“body”。
     * @type {Object}
     */
    var curPageContainer;

    /**
     * 初始化“虚拟页面”，注意只初始化一次，且仅在要使用的时候再初始化它。
     */
    function _initPage() {
        if (!curPageObj) {
            console.debug("[detail.js][_initPage] in! curPageObj only init one time!"); //@debug

            // 新建一个Page对象
            curPageObj = new UTIL.Page("detail");
            curPageContainer = $(curPageObj.getContainer());
        }
    }

    /**
     * 提供给外部的接口，绑定为switch事件
     * @param  {Object}   e 事件，e.data中还包含了urlCur和urlFrom，可用于统计等用途
     */
    function switchDo(e) {
        console.debug("[detail.js][switchDo] in", e); //@debug

        // 初始化“虚拟页面”
        _initPage();

        // 调用Page对象的triggerSwitch方法，触发switch事件，并执行回调
        curPageObj.triggerSwitch(function () {
            console.debug("[detail.js][switchDo] curPageObj.triggerSwitch callback in"); //@debug

            var resultObj = $(".jresult", curPageContainer),
                paramObj = curPageObj.getParam(true);

            //因为我们引入了Zepto.js，因此也可以直接使用其api设置html，但我们强烈建议使用jSpa框架的设置方式，这样可以灵活处理
            // UTIL.setHtml(resultObj, "当前请求参数值为：" + JSON.stringify(paramObj));
            resultObj.html("当前请求参数值为：" + JSON.stringify(paramObj));
        });
    }

    /**
     * 提供给外部的接口，获得本“虚拟页面”的Page对象
     * @return {Object}   本“虚拟页面”的Page对象
     */
    function getPageObj() {
        console.debug("[index.js][getPageObj] in"); //@debug

        // 初始化“虚拟页面”
        _initPage();

        return curPageObj;
    }

    //提供给外部的接口
    var exports = {
        "switch": switchDo,
        "getPageObj": getPageObj
    };

    return exports;

})();