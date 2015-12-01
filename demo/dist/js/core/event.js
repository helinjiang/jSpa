/**
 * 事件定义，用于处理如data-click等事件，可能支持多个函数，使用空格分开，
 * 比如data-click="NAVIGATE.scrollToContainer EVENTS.closeDlg"
 *
 * 如果是业务处理相关的，则请放置在action.js中，如果是公共处理相关的，则请放置在util.js中
 *
 * @author linjianghe
 * @date   2015-07-16
 */
window.EVENT = (function(global, UTIL, undefined) {

    function testClick(e) {
        console.log('testClick: ', e.target);
    }

    function testClick2(e) {
        console.log('testClick2: ', e.target);
    }

    function back(e) {
        UTIL.back();
    }

    function testInview(e) {
        console.log('testInview: ', e.target);

        // // 注意此处要设置些变量，避免频繁进行DOM操作，影响性能
        // if (!e.target.isload) {
        //     //将原来的内容直接替换
        //     UTIL.setHtml($(e.target), UI_tpl.testinview());

        //     //在原来的内容基础上追加
        //     UTIL.setHtml($(e.target), UI_tpl.testinview(), true);
        //     UTIL.setHtml($(e.target), UI_tpl.testinview(), true);

        //     e.target.isload = 1;
        // }
    }


    var exports = {
        "testClick": testClick,
        "testClick2": testClick2,
        "back": back,
        "testInview": testInview
    };

    return exports;

})(window, window.UTIL);
