/**
 * 页面处理类
 *
 * @author helinjiang
 * @date   2015-11-30
 */
var Page = (function (TINYSPA) {

    /**
     * 定义一个Page类，用于处理页面
     * @param  {String}   pageName 页面名字，需要唯一
     */
    function Page(pageName) {
        this.pageName = pageName;

        /**
         * 页面初始化时执行的方法，它通过Page.prototype.initPage方法进行覆盖
         */
        this.init = function () {
            console.debug("[jspa][page.js][this.init] pageName=" + this.pageName); //@debug
        };
    }

    /**
     * 设置page的container，一般只需要执行一次即可
     */
    Page.prototype.getContainer = function () {
        console.debug("[jspa][page.js][Page.prototype.getContainer] ", this); //@debug

        if (!this.container) {
            this.container = $('[data-defpageid="' + this.pageName + '"]');
        }
        return this.container;
    };

    /**
     * 页面初始化时执行的方法
     * @param  {Function} callback 回调
     */
    Page.prototype.initPage = function (callback) {
        console.debug("[jspa][page.js][Page.prototype.initPage] ", this); //@debug

        if (_isFunction(callback)) {
            this.init = callback;
        }
    };

    /**
     * 页面的switch事件触发函数
     * @param  {Function}   callback 回调处理函数
     */
    Page.prototype.triggerSwitch = function (callback) {
        console.debug("[jspa][page.js][Page.prototype.triggerSwitch] ", this); //@debug
        var curPageContainer = this.getContainer();

        //此处控制首次加载页面时，某些元素是否要重复加载，如果不需要重复加载的则在此处进行处理
        if (!UTIL.getDomData(curPageContainer, "domloaded")) {
            //首次加载页面时的处理逻辑.....
            this.init();

            //处理完毕之后设置处理完毕的标志，同时将加载中状态去除
            curPageContainer.setAttribute("data-domloaded", 1);
            TINYSPA.hideLoading(curPageContainer);
        }

        //切换函数，此处要延时执行，是以防在init()方法中进行了dom更新，要留事件让dom更新完成
        if (_isFunction(callback)) {
            var that = this;
            setTimeout(function () {
                callback.call(that);
            }, 10);
        }
    };

    /**
     * 页面的active事件触发函数
     * @param  {Function}   callback 回调处理函数
     */
    Page.prototype.triggerActive = function (callback) {
        console.debug("[jspa][page.js][Page.prototype.triggerActive] ", this); //@debug

        //切换函数
        if (_isFunction(callback)) {
            callback.call(this);
        }
    };

    /**
     * 获得页面名称
     * @return {String}   页面名称
     */
    Page.prototype.getPageName = function () {
        return this.pageName;
    };

    /**
     * 获得在本页的请求参数，从URL中获得。
     * 比如?channel=78788#id=index&idno=4，
     *  如果只是hash值，则返回{"id":"index","idno":"4"}
     *  如果还包含search值，则返回{"id":"index","idno":"4","channel":"78788"}
     * @param  {Boolean} includeSearchParam 是否追加返回location.search中的请求
     * @return {Object} 结果
     */
    Page.prototype.getParam = function (includeSearchParam) {
        console.debug("[jspa][page.js][Page.prototype.getParam] ", includeSearchParam, this); //@debug
        var defaultResult = TINYSPA.getHashKV();
        if (!includeSearchParam) {
            return defaultResult;
        }

        //如果要追加location.search中的请求参数，则还需要增加进去！
        var searchText = decodeURIComponent(window.location.search);
        if (searchText) {
            searchText = searchText.replace('?', '');
            var tempArr = searchText.split('&');
            for (var i = 0; i < tempArr.length; i++) {
                var temp = tempArr[i].split('=');
                defaultResult[temp[0]] = temp[1];
            }
        }
        return defaultResult;
    };

    function _isFunction(fn) {
        return typeof fn === "function";
    }

    /**
     * 对外提供Page类
     */
    return Page;

})(TINYSPA);