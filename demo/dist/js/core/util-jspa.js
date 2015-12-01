/**
 * 与jSpa框架的api接口的工具，如果不引用该框架，可以不用引入本文件
 *
 * @author linjianghe
 * @date   2015-07-16
 */
(function(UTIL, jSpa) {
    if (typeof jSpa !== "object") {
        return;
    }

    if (typeof UTIL !== "object") {
        UTIL = {};
        window.UTIL = UTIL;
    }

    /**
     * 为某个dom设置html代码
     * @param  {Object}   container     目标DOM
     * @param  {String}   html          html代码
     * @param  {Boolean}   append        是否是追加的方式，true:追加，false:覆盖
     * @param  {Boolean}   triggerActive 是否触发active事件，true:触发，false:不处罚
     * @author linjianghe
     * @date   2015-09-18
     */
    UTIL.setHtml = function(container, html, append, triggerActive) {
        var elem;

        if (container.innerHTML) {
            // 如果该对象有innerHTML属性，说明是原生DOM对象
            elem = container;
        } else {
            // 如果该对象没有innerHTML属性，说明可能是jQuery或者Zepto对象，当然，这也不一定，看实际情况            
            elem = container[0];
        }

        jSpa.lib.setHtml(elem, html, append, triggerActive);
    };

    /**
     * 初始化jSpa框架
     * 
     * @author linjianghe
     * @date   2015-09-18
     */
    UTIL.initjSpa = function() {
        // jSpa.lib.renderPage(CONFIG.getjSpaConfig());
        jSpa.lib.renderPage({
            //默认的页面ID，如果没有#id这样的参数的话
            pageDefaultId: 'index',

            //出错的页面ID，如果有#id=xxx，但xxx在页面中又没定义的话
            page404Id: 'p404',

            beforeLoad: function(target) {
                console.log('beforeLoad: ', target);
            },

            afterLoad: function(target) {
                console.log('afterLoad: ', target);
            }
        });
    };

    /**
     * 跳转到哪个页面
     * @param  {String}   pageName 页面名称
     * 
     * @author linjianghe
     * @date   2015-09-18
     */
    UTIL.go = function(pageName) {
        jSpa.lib.goToPage(pageName);
    };

    /**
     * 虚拟页面对象，该对象有以下方法：
     * 
     * getContainer()：获得虚拟页面的最外层原生DOM对象
     * initPage(callback)：初始化虚拟页面，并执行回调。可以不设置。
     * triggerSwitch(callback)：触发该虚拟页面的switch事件，并执行回调
     * triggerActive(callback)：触发该虚拟页面的active事件，并执行回调
     * getPageName()：获得当前虚拟页面的页面名称
     * getParam(includeSearchParam)：获得当前页面url参数中的属性对象 
     * 
     * @type {Object}
     */
    UTIL.Page = jSpa.Page;

})(window.UTIL, jSpa);
