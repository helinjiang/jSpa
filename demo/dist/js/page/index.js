/**
 * 虚拟页面"index"，对应于设置了data-defpageid="index"的div区域
 *
 * 在本页面中，我们定义了三个接口，分别是:
 *     switchDo：切换到本页面时触发的函数，响应switch事件，这个每个页面都必须要定义，否则无法“切换”页面
 *     activeDo： 切换到本页面时触发的函数，响应active事件，非必须，主要用于某些场景，比如统计等
 *     getPageObj：获得本页Page对象，非必须，在event.js等页面使用时，便于操作相应的DOM
 *
 * @author helinjiang
 * @date   2015-11-30
 */
window.PAGEINDEX = (function () {

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
            console.debug("[index.js][_initPage] in! curPageObj only init one time!"); //@debug

            // 新建一个Page对象
            curPageObj = new UTIL.Page("index");
            curPageContainer = $(curPageObj.getContainer());

            // 设置该Page页面的初始化回调，只执行一次。非必须，可以省略该设置。
            curPageObj.initPage(function () {
                console.debug("[index.js] curPageObj.initPage callback in"); //@debug

                // 首次加载页面时的处理逻辑。如果每次切换到这个“页面”都需要执行，则请在Page.triggerSwitch的回调中定义。
                // 略
            });
        }
    }

    /**
     * 提供给外部的接口，绑定为switch事件
     * @param  {Object}   e 事件，e.data中还包含了urlCur和urlFrom，可用于统计等用途
     */
    function switchDo(e) {
        console.debug("[index.js][switchDo] in", e); //@debug

        // 初始化“虚拟页面”
        _initPage();

        // 调用Page对象的triggerSwitch方法，触发switch事件，并执行回调
        curPageObj.triggerSwitch(function () {
            console.debug("[index.js][switchDo] curPageObj.switchEvent callback in"); //@debug

            // 每次切换到这个“页面”都执行的方法，比如根据新数据重新渲染html等。如果从始至终只执行一次，请在Page.initPage()方法回调中定义。
            _showInfo();
        });
    }

    /**
     * 提供给外部的接口，绑定为active事件
     * @param  {Object}   e 事件，e.data中还包含了urlCur和urlFrom，可用于统计等用途
     */
    function activeDo(e) {
        console.debug("[index.js][activeDo] in", e); //@debug

        // 初始化“虚拟页面”
        _initPage();

        // 调用Page对象的triggerActive方法，触发active事件，并执行回调
        curPageObj.triggerActive(function () {
            console.debug("[index.js][activeDo] curPageObj.activeEvent callback in"); //@debug
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

    /**
     * 初始化，每次切换到首页时都要重新初始化，因为数据可能已经新增了，也可能已经修改了
     */
    function _showInfo() {
        //获取缓存在CACHE中的数据，并且渲染出来，如果存在则表格呈现，如果不存在，则提示无数据
        var jinfodom = $(".jinfo", curPageContainer),
            jinviewlasydom = $(".jinviewlazy", curPageContainer);

        UTIL.setHtml(jinfodom, 'Hello，我是请求数据之后再动态生成的！');
        UTIL.setHtml(jinviewlasydom, '<div data-inview="EVENT.testInviewLazy"></div><img src="http://mat1.gtimg.com/news/news2013/LOGO.jpg" data-src="http://mat1.gtimg.com/www/images/qq2012/qqlogo_1x.png">', true);

    }

    //提供给外部的接口
    var exports = {
        "switch": switchDo,
        "active": activeDo,
        "getPageObj": getPageObj
    };

    return exports;

})();