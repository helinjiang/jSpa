/**
 * 初始化jSpa框架的一些事件、行为等
 *
 * @author helinjiang
 * @date   2015-11-30
 */


/**
 * 绑定click事件，绑定到window对象上，通过e.target来确定当前的对象
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("click", function (e) {
    console.debug("[jspa][app.js] event happend : click", e.target); //@debug
    var target = e.target,
        clickFn,
        navTo,
        action = function () {
            // 处理click事件
            if (clickFn && clickFn !== null && clickFn.length) {
                TINYSPA.addEventAction(target, e);
            }

            // 处理页面切换
            if (navTo && navTo !== null && navTo.length) {
                var pattern0 = /(\w+)(\(([\w\d, ]+)\))?/g,
                    pattern1 = /[\w\d]+/g,
                    res={};

                //处理类似这种带参数的跳转id：<a data-nav="search(key)" data-key="xxx"></a>
                navTo.replace(pattern0, function () {
                    res.id = arguments[1];
                    if (arguments[3]) {
                        var params = arguments[3].match(pattern1);
                        for (var i = 0, m = params.length; i < m; ++i) {
                            var val = UTIL.getDomData(target, params[i]);
                            if (val) {
                                res[params[i]] = val;
                            }
                        }
                    }
                });

                TINYSPA.goToPage(navTo, res);
            }
        };

    // 冒泡处理click和nav事件
    while (target && target != document.body && target != document.documentElement) {
        clickFn = UTIL.getDomData(target, "click");
        navTo = UTIL.getDomData(target, "nav");

        if (!clickFn && !navTo) {
            target = target.parentNode;
        } else {
            action();
            break;
        }
    }

    //实际上，此处只需要处理下a标签即可，其他元素的默认行为还是不要阻止的好
    if (e.target.nodeName.toUpperCase() === "A") {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
});

/**
 * 绑定switch事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("switch", function (e) {
    console.debug("[jspa][app.js] event happend : switch"); //@debug
    var target = e.target,
        action = UTIL.getDomData(target, "switch");

    // TODO 此处的写法还有待优化，实际上可以将action传递过去的。而且switch和e.type什么关系，是一样的吗？
    if (action) {
        TINYSPA.addEventAction(target, e);
    }

    //TODO 可考虑广播jspa-switch事件，当业务端可以接受到这个事件，然后再处理之，比如用于显示加载中
});

/**
 * 绑定active事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("active", function (e) {
    console.debug("[jspa][app.js] event happend : active"); //@debug

    var target = e.target,
        action = UTIL.getDomData(target, "active");

    if (action) {
        TINYSPA.addEventAction(target, e);
    }
});

/**
 * 绑定scriptload事件，再处理之前执行失败的事件。因为导致这些事件执行失败的原因有可能是因为js还没加载完毕
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("scriptload", function (e) {
    console.debug("[jspa][app.js] event happend : scriptload"); //@debug

    //加个等待时间, 等待js代码加载完毕.
    setTimeout(function () {
        for (var i = 0, m = TINYSPA.queueEvent.length; i < m; ++i) {
            var obj = TINYSPA.queueEvent[i];
            if (TINYSPA.invoke(obj.fnName, obj.target, obj.event) && TINYSPA.queueEvent.splice(i, 1)) {
                --m;
                --i;
            }
        }
        //TODO 判断是否在视野中显示
        INVIEW.handle(e);
    }, 50);
});

//绑定这些事件，它们触发时动作都一样的，因此使用循环赋值方式
(function () {
    var events = ["scroll", "resize", "onorientationchange", "domchange"],
        _t;

    var fn = function (e) {
        console.debug("[jspa][app.js] event happend : " + e.type); //@debug
        if (_t) {
            clearTimeout(_t);
        }

        _t = setTimeout(function (e) {
            INVIEW.handle(e);
        }, 320);
    };

    for (var i = 0, length = events.length; i < length; i++) {
        window.on(events[i], fn);
    }
})();

/**
 * 绑定viewchange事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("viewchange", function (e) {
    console.debug("[jspa][app.js] event happend : viewchange"); //@debug
    INVIEW.handle(e);
});

/**
 * 绑定viewchange事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("load", function (e) {
    console.debug("[jspa][app.js] event happend : load"); //@debug
    // 引用FastClick以便解决点击穿透与延迟的问题
    // 只有引入了FastClick再处理
    if (FastClick) {
        FastClick.attach(document.body);
    }

    setTimeout(function () {
        window.scrollTo(0, 1);
    }, 1000);

    TINYSPA.triggerEvent(window, "scriptload");
});

// 等同于jQuery的$(document).ready方法
document.addEventListener("DOMContentLoaded", function () {
    TINYSPA.triggerEvent(window, "load");
});


// 全局绑定hashchange事件
// TODO 这一块对history的模拟操作好像有问题
window.on("hashchange", function(e) {
    console.log("[jspa][app.js] hash QUEUE:", JSON.stringify(TINYSPA.queueHistory), history.length); //@debug

    var len = TINYSPA.queueHistory.length,
        curHash = location.hash,
        lastSecond,
        last;

    if (len > 1) {
        lastSecond = TINYSPA.queueHistory[len - 2];
        // console.log("-------", lastSecond.hash, curHash, lastSecond.hash === curHash);
        if (lastSecond.hash === curHash) {
            // 如果队列中倒数第二个就是本页，则模拟“后退”，
            // 比如跳转之前是[index,detail]，hashchange之后到了index，则此时应该是[index]而不是[index,detail,index]
            console.debug("[jspa][app.js] hashchange happend! Equal to history.back()"); //@debug
            TINYSPA.queueHistory.pop();
            len--;

            TINYSPA.currScrollY = lastSecond.scrollY || 1;
            console.log("[jspa][app.js] hash QUEUE after history.back():", JSON.stringify(TINYSPA.queueHistory)); //@debug
        }
    }

    // 如果队列中最后一个地址不是location.hash，则增加之。
    if (len > 0) {
        last = TINYSPA.queueHistory[len - 1];

        if (last.hash !== curHash) {
            console.log("[jspa][app.js] add in QUEUE before:", JSON.stringify(TINYSPA.queueHistory)); //@debug
            // 如果不是当前页面，则增加历史记录，且设置滚动条位置
            TINYSPA.queueHistory.push({
                hash: curHash,
                scrollY: window.scrollY
            });
            console.log("[jspa][app.js] add in QUEUE after:", JSON.stringify(TINYSPA.queueHistory)); //@debug
        } else {
            //找到当前的页面，则要设置滚动条位置
            console.log("[jspa][app.js] Exist in QUEUE scrollY:", JSON.stringify(last)); //@debug
            TINYSPA.currScrollY = last.scrollY || 1;
        }
    } else {
        console.log("[jspa][app.js] QUEUE is EMPTY", JSON.stringify(TINYSPA.queueHistory)); //@debug
        // 如果队列为空，则增加一条记录
        TINYSPA.queueHistory.push({
            hash: curHash,
            scrollY: window.scrollY
        });
        console.log("[jspa][app.js] add first one in QUEUE ", JSON.stringify(TINYSPA.queueHistory)); //@debug
    }

    if (!TINYSPA.urlFrom) {
        TINYSPA.urlFrom = "DIRECT";
        TINYSPA.urlCur = curHash;
    } else {
        TINYSPA.urlFrom = TINYSPA.urlCur;
        TINYSPA.urlCur = curHash;
    }

    console.log("[jspa][app.js] urlFrom,urlCur:", TINYSPA.urlFrom, TINYSPA.urlCur); //@debug



    // if (location.hash == (QUEUE[QUEUE.length - 2] && "#" + QUEUE[QUEUE.length - 2].hash)) {
    //     QUEUE.pop();
    //     TINYSPA.currScrollY = QUEUE.length > 0 && QUEUE[QUEUE.length - 1].scrollY || 1;
    // }
    TINYSPA.activePage(TINYSPA.getHashKV().id, {
        "urlFrom": TINYSPA.urlFrom,
        "urlCur": TINYSPA.urlCur
    });
});

// TODO 要处理?channel=77777#id=index情况
/**
 * 自动将data-defpageid的加入page中，自动生存ID
 */
$("[data-defpageid]").forEach(function(elem, index) {

    var pageId = UTIL.getDomData(elem, "defpageid");

    //增加ID以便后续操作
    elem.setAttribute("id", pageId);

    //将其增加到页面数组中
    TINYSPA.addPage(pageId); //页面ID
});
