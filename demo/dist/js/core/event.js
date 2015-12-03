/**
 * 事件定义，用于处理如data-click等事件，可能支持多个函数，使用空格分开，
 * 比如data-click="NAVIGATE.scrollToContainer EVENTS.closeDlg"
 *
 * @author helinjiang
 * @date   2015-11-30
 */
window.EVENT = (function (UTIL, undefined) {

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
        var targetElem = $(e.target),
            curNum = targetElem.data("count") || 0,
            index = parseInt(curNum) + 1,
            wrapper = $(".jbox");

        wrapper.append('<div class="box">' + index + '</div>');
        targetElem.data("count", index);

        // 假设数据已经加载完毕，这里使用3次来模拟
        if (index > 2) {
            wrapper.append('<p>数据已经加载完成</p>');

            // 移除懒加载锚点
            // targetElem.remove();

            // 或者将data-inview属性移除也可以
            targetElem.removeAttr("data-inview");
        }
    }

    function testInviewLazy(e) {
        console.log('testInviewLazy: ', e.target);
        var target = e.target;

        // 注意，只要该DOM在视窗内，滚动滚动条等操作就会一直触发，因此要设置一下标识，避免总被执行
        // if (!target.isload) {
        //     console.log("testInviewLazy loading");
        //     target.innerHTML = "我是后面生成的";
        //     target.isload = 1;
        // }

        // 或者将data-inview属性移除也可以
        target.removeAttribute("data-inview");
    }

    var exports = {
        "testClick": testClick,
        "testClick2": testClick2,
        "back": back,
        "testInview": testInview,
        "testInviewLazy": testInviewLazy
    };

    return exports;

})(window.UTIL);
