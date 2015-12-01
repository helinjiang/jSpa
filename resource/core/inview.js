/**
 * 这个JS定义了一个控件, 当已注册的页面元素显现时(出现在用户视窗内)触发动作，
 * 用以识别并触发data-inview中的事件，并处理data-src图片懒加载
 *
 * @author linjianghe
 * @date   2015-07-15
 */
var INVIEW = (function(UTIL) {
    var threshold = 30; //预加载30像素,即目标还有30像素才显示就开始加载
    var waitshow = []; //所有需要延迟加载的DOM列表

    //获得对象相距上下左右高宽值
    function getOffset() {
        if (!this) {
            return this;
        }
        if (this == window) {
            return {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        } else {
            var obj = this.getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                right: obj.right + window.pageXOffset,
                bottom: obj.bottom + window.pageYOffset,
                width: obj.right - obj.left,
                height: obj.bottom - obj.top
            };
        }
    }

    //负责检查当前元素是否可见, 或马上可见(距离可视区域30像素以内)
    function test() {
        var offset = getOffset.call(this);
        return (offset.width > 0 || offset.height > 0) && //检查是否可见
            window.pageYOffset + window.innerHeight > offset.top - threshold && //上边界检查
            window.pageYOffset < offset.bottom + threshold && //下边界
            window.pageXOffset + window.innerWidth > offset.left - threshold && //左
            window.pageXOffset < offset.right + threshold; //右
    }

    //绑定事件处理函数到当前元素, 当元素出现在视窗内时触发处理函数
    function bind(func, once) {
        for (var i = 0, l = this.length; i < l; i++) {
            var index = waitshow.indexOf(this[i]);
            if (index < 0) {
                waitshow.push(this[i]);
            }
            this[i]["inview-once"] = once;
            this[i]["inview-func"] = func;
        }
    }

    //当出现在视野时触发的方法
    function bindInview(node, fn) {
        bind.call(node.querySelectorAll("[data-inview]"), fn);

        bind.call(node.querySelectorAll("img[data-src]"), function() {
            var that = this,
                src = UTIL.getDomData(that, "src"),
                temp = new Image();
            temp.onload = function() {
                that.setAttribute("src", src); //后台加载完之后再给赋值.
                that.removeAttribute("data-src");
            };
            temp.src = src;
        }, true);
    }

    //触发方法，返回有多少个被触发
    function handle(event) {
        var count = 0;
        for (var m = waitshow.length - 1; m >= 0; --m) { //反向迭代防止数据移除导致的异常
            var t = waitshow[m];
            if (test.call(t)) {
                t["inview-func"]({
                    type: "inview",
                    target: t
                });
                if (t["inview-once"] === true) {
                    waitshow.splice(m, 1);
                }
                ++count;
            }
        }
        return count;
    }

    // 这个逻辑需要仔细看下 把要清除掉的html中已经绑定了inview的在waitshow里面的去除掉
    window.addEventListener("destroy", function(e) {
        var target = e.target,
            inviews = [].concat(target.querySelectorAll("[data-inview]"), target.querySelectorAll("img[data-src]"));
        for (var i = 0, one, l = inviews.length;
            (one = inviews[i]) && i < l; i++) {
            if (waitshow.indexOf(one) >= 0) {
                waitshow.splice(index, 1);
            }
        }
    }, false);

    return {
        handle: handle,
        bindInview: bindInview
    };

})(UTIL);