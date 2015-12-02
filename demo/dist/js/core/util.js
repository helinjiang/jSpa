/**
 * 公共处理函数,如果是业务处理相关的，则请放置在action.js中
 *
 * @author linjianghe
 * @date   2015-07-16
 */
window.UTIL = (function() {

    /**
     * 重新加载页面，由于是单页面应用，有一些数据缓存，一般不使用这种方法来重加载，而是自定义函数重加载数据。
     */
    function reload() {
        location.reload();
    }

    /**
     * 页面后退
     */
    function back() {
        history.back();
    }

    /**
     * 为某个dom设置html代码
     * @param  {Object}   container     目标DOM
     * @param  {String}   html          html代码
     * @param  {Boolean}   append        是否是追加的方式，true:追加，false:覆盖
     * @param  {Boolean}   triggerActive 是否触发active事件，true:触发，false:不处罚
     */
    function setHtml(container, html, append, triggerActive) {
        var elem;

        if (container.innerHTML) {
            // 如果该对象有innerHTML属性，说明是原生DOM对象
            elem = container;
        } else {
            // 如果该对象没有innerHTML属性，说明可能是jQuery或者Zepto对象，当然，这也不一定，看实际情况            
            elem = container[0];
        }

        jSpa.setHtml(elem, html, append, triggerActive);
    }

    /**
     * 初始化jSpa框架
     */
    function initjSpa() {
        jSpa.render({
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
    }

    /**
     * 跳转到哪个页面
     * @param  {String}   pageName 页面名称
     */
    function go(pageName) {
        jSpa.goToPage(pageName);
    }

    var exports = {
        "reload": reload,
        "back": back,
        "setHtml": setHtml,
        "initjSpa": initjSpa,
        "go": go,
        "Page": jSpa.Page
    };

    return exports;

})();
