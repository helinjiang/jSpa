/**
 * 虚拟页面"tab2"，对应于设置了data-defpageid="tab2"的div区域
 *
 * 在本页面中，我们模拟了一个作为“tab”的“虚拟页面”，它们（tab.js和tab2.js）共同拥有一致的tab导航条，共同属于tabtest这个虚拟页面。
 *
 * @author linjianghe
 * @date   2015-09-18
 */
window.PAGETAB2 = (function() {

    var curPageObj, curPageContainer;

    /**
     * 初始化“虚拟页面”，注意只初始化一次，且仅在要使用的时候再初始化它。
     *
     * @author linjianghe
     * @date   2015-09-18
     */
    function _initPage() {
        if (!curPageObj) {
            console.debug("[tab2.js][_initPage] in! curPageObj only init one time!"); //@debug

            // 新建一个Page对象
            curPageObj = new UTIL.Page("tab2");
            curPageContainer = $(curPageObj.getContainer());
        }
    }

    /**
     * 提供给外部的接口，绑定为switch事件
     * @param  {object}   e 事件
     * @author linjianghe
     * @date   2015-08-06
     */
    function switchDo(e) {
        console.debug("[tab2.js][switchDo] in",e); //@debug

        // 初始化“虚拟页面”
        _initPage();

        // 调用Page对象的triggerSwitch方法，触发switch事件，并执行回调
        curPageObj.triggerSwitch(function() {
            console.debug("[tab2.js][switchDo] curPageObj.switchEvent callback in"); //@debug

            //tab页的nav样式
            $('#tabnav a').removeClass("cur");
            $('#tabnav a[data-nav="tab2"]').addClass("cur");
        });
    }


    //提供给外部的接口
    var exports = {
        "switch": switchDo
    };

    return exports;

})();
