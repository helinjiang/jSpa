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
        var target = $(e.target),
            curNum = target.data("count") || 0,
            index = parseInt(curNum) + 1,
            wrapper = $(".jbox");


        wrapper.append('<div class="box">' + index + '</div>');
        target.data("count", index);

        // 假设数据已经加载完毕，这里使用3次来模拟
        if (index > 2) {
            wrapper.append('<p>数据已经加载完成</p>');

            // 移除懒加载锚点
            // target.remove();

            // 或者将data-inview属性移除也可以
            target.removeAttr("data-inview");
        }        
    }


    var exports = {
        "testClick": testClick,
        "testClick2": testClick2,
        "back": back,
        "testInview": testInview
    };

    return exports;

})(window, window.UTIL);
