/*! jspa - v1.2.0
* Copyright (c) linjianghe;
*/


var jSpa = (function(window, undefined) {/**
 * 注意，此文件稍微做了点修改，官网下载原版地址为：https://github.com/remy/min.js
 * @author linjianghe
 * @date   2015-08-28
 */
var $=function(t,n,e){var i=Node.prototype,r=NodeList.prototype,o="forEach",u="trigger",c=[][o],s=t.createElement("i");return r[o]=c,n.on=i.on=function(t,n){return this.addEventListener(t,n,!1),this},r.on=function(t,n){return this[o](function(e){e.on(t,n)}),this},n[u]=i[u]=function(n,e){var i=t.createEvent("HTMLEvents");return i.initEvent(n,!0,!0),i.data=e||{},i.eventName=n,i.target=this,this.dispatchEvent(i),this},r[u]=function(t){return this[o](function(n){n[u](t)}),this},e=function(n){var e=t.querySelectorAll(n||"☺"),i=e.length;return 1==i?e[0]:e},e.on=i.on.bind(s),e[u]=i[u].bind(s),e}(document,this);;/**
 * 工具库
 *
 * @author linjianghe
 * @date   2015-07-15
 */
var UTIL = (function () {
    var _reClassToken = /\s+/;

    /**
     * 获得DOM上的数据，寻找data-[key]的值
     * @param  {Object} elem    DOM元素
     * @param  {String} key     key值
     * @param  {Boolean} upgoing 是否向上寻找，true：向上寻找，false：不用再向上寻找；
     * @return {String}         结果
     */
    function getDomData(elem, key, upgoing) {
        if (!elem || typeof elem.length != "undefined") {
            return;
        }

        var val;

        var data = function (curelem, curkey) {
            var attr = curelem.attributes["data-" + curkey];
            if (attr) {
                return attr.value;
            }
        };

        if (upgoing) {
            while (elem && elem != document.body) {
                val = data(elem, key);
                if (val) {
                    break;
                } else {
                    elem = elem.parentNode;
                }
            }
        } else {
            val = data(elem, key);
        }
        return val;
    }

    function removeClass(elem, names) {
        if (elem && elem.length) {
            for (var i = 0, len = elem.length; i < len; i++) {
                _removeClassForOne(elem[i], names);
            }
        } else {
            _removeClassForOne(elem, names);
        }
    }

    function _removeClassForOne(elem, names) {
        return names && ((elem && elem.classList && !_reClassToken.test(names)) ? elem.classList.remove(names) : _updateClass(elem, names));
    }

    function addClass(elem, names) {
        if (elem && elem.length) {
            for (var i = 0, len = elem.length; i < len; i++) {
                _addClassForOne(elem[i], names);
            }
        } else {
            _addClassForOne(elem, names);
        }
    }

    function _addClassForOne(elem, names) {
        return names && ((elem && elem.classList && !_reClassToken.test(names)) ? elem.classList.add(names) : _updateClass(elem, null, names));
    }

    /**
     * 序列化参数方法
     * @param  {Object} param     所需序列化参数列表
     * @return {String} 序列化后的参数字符串
     */
    function serializeParam(param) {
        var arr = [];
        for (var a in param) {
            arr.push(a + "=" + encodeURIComponent(param[a]));
        }

        return arr.join("&");
    }

    function extend(res, obj) {
        for (var elem in obj) {
            res[elem] = obj[elem];
        }
        return res;
    }

    function _updateClass(elem, removeNames, addNames) {
        if (!elem || elem.nodeType != 1) {
            return "";
        }
        var oriName = elem.className,
            ar,
            b; //受否有变化的flag
        if (removeNames && typeof(removeNames) == 'string' || addNames && typeof(addNames) == 'string') {
            if (removeNames == '*') {
                oriName = '';
            } else {
                ar = oriName.split(_reClassToken);

                var i = 0,
                    l = ar.length,
                    n; //临时变量

                oriName = {};
                for (; i < l; ++i) { //将原始的className群结构化为表
                    if (ar[i]) {
                        oriName[ar[i]] = true;
                    }
                }
                if (addNames) { //结构化addNames群，将该加入的加入到oriName群
                    ar = addNames.split(_reClassToken);
                    l = ar.length;
                    for (i = 0; i < l; ++i) {
                        if ((n = ar[i]) && !oriName[n]) {
                            oriName[n] = true;
                            b = true;
                        }
                    }
                }
                if (removeNames) {
                    ar = removeNames.split(_reClassToken);
                    l = ar.length;
                    for (i = 0; i < l; i++) {
                        if ((n = ar[i]) && oriName[n] && (b = true)) {
                            delete oriName[n];
                        }
                    }
                }
            }
            if (b) {
                ar.length = 0;
                for (var k in oriName) { //构造结果数组
                    ar.push(k);
                }
                oriName = ar.join(' ');
                elem.className = oriName;
            }
        }
        return oriName;
    }

    return {
        getDomData: getDomData,
        addClass: addClass,
        extend: extend,
        removeClass: removeClass,
        serializeParam: serializeParam
    };
})();;/**
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

})(UTIL);;/**
 * TinySpa 类定义
 *
 * @author linjianghe
 * @date   2015-11-26
 */

/**
 *
 * @constructor
 */
function TinySpa() {

    /**
     * 默认的页面ID，如果没有#id这样的参数的话
     * @type {string}
     */
    this.pageDefaultId = 'index';

    /**
     * 出错的页面ID，如果有#id=xxx，但xxx在页面中又没定义的话
     * @type {string}
     */
    this.page404Id = this.pageDefaultId;

    /**
     * 页面列表
     * @type {Array}
     */
    this.pageList = [];

    /**
     * 需要延迟处理的事件名称数组
     * @type {Array}
     */
    this.queueEvent = [];

    /**
     * 访问历史路径
     * @type {Array}
     */
    this.queueHistory = [];

    this.currScrollY = 1;
    this.urlFrom = undefined;
    this.urlCur = undefined;
    /**
     * 加载前调用的方法
     * @type {function}
     */
    this.beforeLoad = function () {
    };

    /**
     * 加载后调用的方法
     * @type {function}
     */
    this.afterLoad = function () {
    };
}

/**
 * 设置默认页面
 * @param  {String}   pageId 页面ID
 */
TinySpa.prototype.setPageDefaultId = function (pageId) {
    if (typeof pageId !== "string") {
        console.error("[jspa][tinyspa.js][setPageDefaultId] pageId is not string! It's type is " + (typeof pageId)); //@debug
        return;
    }

    if (!isExist(this.pageList, pageId)) {
        console.error("[jspa][base.js][setDefaultPageId] pageId is not in pageList! pageId=" + pageId + ",pageList=[" + this.pageList.join(",") + "]"); //@debug
        return;
    }

    this.pageDefaultId = pageId;
};

/**
 * 设置404页面
 * @param  {String}   pageId 页面ID
 */
TinySpa.prototype.setPage404Id = function (pageId) {
    if (typeof pageId !== "string") {
        console.error("[jspa][tinyspa.js][setPage404Id] pageId is not string! It's type is " + (typeof pageId)); //@debug
        return;
    }

    if (!isExist(this.pageList, pageId)) {
        console.error("[jspa][base.js][setPage404Id] pageId is not in pageList! pageId=" + pageId + ",pageList=[" + this.pageList.join(",") + "]"); //@debug
        return;
    }

    this.page404Id = pageId;
};

/**
 * 增加一个页面
 * @param  {String}   pageId 页面ID
 */
TinySpa.prototype.addPage = function (pageId) {
    if (!isExist(this.pageList, pageId)) {
        this.pageList.push(pageId);
    }
};

/**
 * 获得检查过后的页面ID，如果该ID没有在pageList中定义，则默认值为page404Id
 * @param  {String} pageId 页面ID
 * @return {String}    检查过后的页面ID
 */
TinySpa.prototype.getCheckedId = function (pageId) {
    //如果id没有值，则应该是默认页面
    if (typeof pageId === "undefined") {
        return this.pageDefaultId;
    }

    //如果id有值，但并不是页面ID，则返回404页面
    return isExist(this.pageList, pageId) ? pageId : this.page404Id;
};

/**
 * 设置默认页面
 * @param  {string}   pageId 默认页面ID
 */
TinySpa.prototype.setPageDefaultId = function (pageId) {
    if (typeof pageId !== "string") {
        console.error("[jspa][base.js][setDefaultPageId] pageId is not string! It's type is " + (typeof pageId)); //@debug
        return;
    }

    //默认的pageId必须在pageList中，否则报错
    if (!isExist(this.pageList, pageId)) {
        console.error("[jspa][base.js][setDefaultPageId] pageId is not in pageList! pageId=" + pageId + ",pageList=[" + this.pageList.join(",") + "]"); //@debug
    }

    this.pageDefaultId = pageId;
};

/**
 * 设置404页面
 * @param  {String}   pageId 404页面ID
 */
TinySpa.prototype.setPage404Id = function (pageId) {
    if (typeof pageId !== "string") {
        console.error("[jspa][base.js][setPage404Id] pageId is not string! It's type is " + (typeof pageId)); //@debug
        return;
    }

    //默认的pageId必须在pageList中，否则报错
    if (!isExist(this.pageList, pageId)) {
        console.error("[jspa][base.js][setPage404Id] pageId is not in pageList! pageId=" + pageId + ",pageList=[" + this.pageList.join(",") + "]"); //@debug
    }

    this.page404Id = pageId;
};

/**
 * 设置加载前执行的方法
 * @param  {Function}   fn 回调
 */
TinySpa.prototype.setBeforeLoad = function (fn) {
    if (typeof fn !== "function") {
        console.error("[jspa][base.js][setBeforeLoad] fn is not function! It's type is " + (typeof fn)); //@debug
        return;
    }

    this.beforeLoad = fn;
};

/**
 * 设置加载后执行的方法
 * @param  {Function}   fn 回调
 */
TinySpa.prototype.setAfterLoad = function (fn) {
    if (typeof fn !== "function") {
        console.error("[jspa][base.js][setAfterLoad] fn is not function! It's type is " + (typeof fn)); //@debug
        return;
    }

    this.afterLoad = fn;
};

/**
 * 触发某个DOM上的某个事件
 * @param  {Object}   elem  jQuery对象
 * @param  {String}   event 事件名称
 * @param  {Object}   data  附加在event.data的数据，非必须
 */
TinySpa.prototype.triggerEvent = function (elem, event, data) {
    elem.trigger(event, data);
};

/**
 * 事件处理
 * @param  {Object}   target DOM
 * @param  {Object}   e 事件
 */
TinySpa.prototype.addEventAction = function (target, e) {
    var etype = e.type,
        type = (etype == "touchend") ? "click" : etype, //将toucheend事件修改为click
        actions = UTIL.getDomData(target, type);

    // 如果该DOM上面没有指定的事件，则返回
    if (!actions || !actions.length) {
        return;
    }

    //actions 可以支持多个，以空格分隔，因此此处要区分处理
    actions = actions.split(/\s+/);
    for (var i = 0, length = actions.length; i < length; i++) {
        var fnName = actions[i].trim(),
            isInvokeSuccess = this.invoke(fnName, target, e);

        // 如果此时的事件分发有问题，则需要存入队列中，后续在处理
        if (!isInvokeSuccess) {
            var exists = false;

            //如果事件分发失败，有可能是因为js文件还未完全加载完毕，
            //则将该此事件存放在队列中，待scriptload事件触发之后，再来处理队列中的事件
            for (var j = 0, n = this.queueEvent.length; j < n; ++j) {
                var obj = this.queueEvent[j];
                if (obj.fnName === fnName && obj.target === target) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                this.queueEvent.push({
                    fnName: fnName,
                    target: target,
                    event: e
                });
            }
        }
    }
};

/**
 * 在目标上显示加载中图片显示
 * @param  {Object} target DOM
 */
TinySpa.prototype.showLoading = function (target) {
    if (!target) {
        return;
    }

    if (this.getBeforeLoad === "function") {
        this.getBeforeLoad(target);
    }
};

/**
 * 隐藏目标上的加载中图片显示
 * @param  {Object} target DOM
 */
TinySpa.prototype.hideLoading = function (target) {
    if (!target) {
        return;
    }

    if (this.getAfterLoad === "function") {
        this.getAfterLoad(target);
    }
};

/**
 * 加载并渲染某页面中的元素
 * @param  {string} id    page id
 * @param  {object} data    附加的数据，包括urlFrom和urlCur等
 * @author linjianghe
 */
TinySpa.prototype.loadDom = function (id, data) {
    id = this.getCheckedId(id);

    var target = $("#" + id);

    if (!target) {
        console.error("[jwap][domloader.js] loaddom NO TARGET by id=" + id); //@debug
        return;
    }

    if (UTIL.getDomData(target, "domloaded")) {
        //如果该页面已经加载过了，则直接展示，并且立即触发active事件
        this.showActive(target, 1, data);
    } else {
        //如果该页面还未加载，则在该页面上显示加载中，然后准备加载，active事件则留到后面的setHtml完毕之后再派发
        this.showLoading(target);
        this.showActive(target, 0, data); // 在setHtml方法中进行active的事件派发
    }
};

/**
 * 设置container中的html
 * @param {object} container     DOM元素
 * @param {string} html          html代码
 * @param {boolean} append       是否为追加，如果为true，则container中的内容会先被销毁，默认为false，即覆盖
 * @param {boolean} triggerActive 是否触发active事件，如果为ture，则若container元素上定义了data-active就会触发其中的方法，默认不触发
 * @author linjianghe
 */
TinySpa.prototype.setHtml = function (container, html, append, triggerActive) {
    var tinyspa = this;
    if (container) {
        // //如果是覆盖的方式，则需要将原有的元素去除掉
        // if (!append && container.children().length) {
        //     container.empty();
        // }

        // //设置html
        // container.append(html);

        // 如果是覆盖，且之前就已经存在了内容，则触发destroy事件
        if (!append && container.children.length > 0) {
            tinyspa.triggerEvent(container, "destroy");
        }

        // 如果是追加
        if (append) {
            html = container.innerHTML + html;
        }

        container.innerHTML = html;

        //触发相关事件
        setTimeout(function () {
            INVIEW.bindInview(container, function (e) {
                TINYSPA.addEventAction(this, e);
            });
            tinyspa.triggerEvent(container, "domchange");
            if (triggerActive) {
                tinyspa.triggerEvent(container, "active");
            }
        }, 0);
    }
};

/**
 * 获得当前的页面ID，即page id
 * @return {string} 页面ID
 */
TinySpa.prototype.getHashId = function () {
    return this.getCheckedId(this.getHashKV().id);
};

/**
 * 获得URL中参数对象
 * @return {object} URL中参数对象
 */
TinySpa.prototype.getHashKV = function () {
    var hash = decodeURIComponent(location.hash);
    var res = {},
        array = (hash[0] == '#' ? hash.substring(1) : hash).split("&");
    for (var i = 0, m = array.length; i < m; ++i) {
        var s = array[i],
            k = s.indexOf("=");
        if (k > 0) {
            res[s.substring(0, k)] = s.substring(k + 1).replace(/＆/g, "&");
        }
    }
    return res;
};

/**
 * 页面切换都指定page页面，同时传递参数param
 * @param  {string} id    page id
 * @param  {object} param 附加参数
 */
TinySpa.prototype.goToPage = function (id, param) {
    //如果id为http或https请求，则直接跳转到指定页面
    if (/^http(s)?:/i.test(id)) {
        setTimeout(function () {
            location.href = id;
        }, 500);
        return;
    }

    //设置要跳转的页面ID
    param.id = this.getCheckedId(param.id);

    //处理hash
    var hashTo = "#" + UTIL.serializeParam(param);

    var len = this.queueHistory.length,
        last,
        lastSecond;

    if (len > 0) {
        last = this.queueHistory[len - 1];
        if (last.hash === hashTo) {
            // 如果要去的页面就是当前页面，则不会发生跳转
            console.debug("[jwap][navigate.js][to] to self!"); //@debug
            return;
        } else {
            if (len > 1) {
                // 如果队列中倒数第二个就是本页，则模拟“后退”，
                // 比如跳转之前是[index,detail]，下一步要跳转到index，则此时应该是[index]而不是[index,detail,index]
                lastSecond = this.queueHistory[len - 2];
                if (lastSecond.hash === hashTo) {
                    console.debug("[jwap][navigate.js][to] Equal to history.back()", lastSecond.hash, hashTo); //@debug
                    this.queueHistory.pop();
                    len--;

                    // currScrollY = lastSecond.scrollY || 1;
                    console.debug("[jwap][navigate.js][to] Equal to history.back() after pop:", JSON.stringify(this.queueHistory), history.length); //@debug
                    history.back();
                    return;
                }
            }

            // 记录跳转之前页面的滚动条位置
            last.scrollY = window.scrollY;
        }
    }

    // 如果不是当前页面，则增加历史记录
    this.queueHistory.push({
        hash: hashTo
    });

    // 设置当前的页面滚动条位置
    this.currScrollY = 1;

    // 跳转到新的页面
    location.hash = hashTo;
};

/**
 * 激活某个页面
 * @param  {string} id    page id
 * @param  {object} data    附加的数据，包括urlFrom和urlCur等
 */
TinySpa.prototype.activePage = function (id, data) {
    UTIL.removeClass($("[data-defpageid].active"), 'active');

    id = this.getCheckedId(id);

    this.loadDom(id, data);

    //回到上次记录的高度
    window.scrollTo(0, this.currScrollY);
};

/**
 * 触发hashchange事件，使之开始渲染页面
 * @return {[type]}   [description]
 * @author linjianghe
 * @date   2015-09-16
 */
TinySpa.prototype.render = function () {
    if (location.hash.indexOf("#") < 0) {
        this.goToPage(this.getCheckedId());
    } else {
        this.triggerEvent(window, "hashchange");
    }
};

/**
 * 分发函数
 * @param  {String}   fnName 行数名称
 * @param  {object}   target DOM对象，不是jQuery对象
 * @param  {String}   event  事件名称
 * @return {boolean}          true：处理成功，false：处理失败
 * @author linjianghe
 * @date   2015-08-05
 */
TinySpa.prototype.invoke = function (fnName, target, event) {
    var names = fnName.split("."),
        action = window;
    //fnName是一个方法名，例如ACTION.reload，则以下方法获取到这个方法
    for (var j = 0, n = names.length; j < n && action; ++j) {
        action = action[names[j]];
    }
    //处理事件，如果这个方法存在的化
    if (typeof action === "function") {
        action.call(target, event);
        return true;
    } else {
        return false;
    }
};

/**
 * 设置target为active状态，并触发DOM元素中的data-switch事件
 * @param {object} target     DOM元素jQuery对象
 * @param {boolean} activeTri 是否触发active事件，如果为ture，则若container元素上定义了data-active就会触发其中的方法
 * @param  {object} data    附加的数据，包括urlFrom和urlCur等
 * @author linjianghe
 */
TinySpa.prototype.showActive = function (target, activeTri, data) {
    if (typeof data !== "object") {
        data = {};
    }

    //向上冒泡，如果冒泡经过的元素定义了data-switch或者data-active，则触发之
    //TODO data-switch是页面切换时触发的，如果子页面切换了，则将事件冒泡，注意此时该“页面”可能还未渲染完毕
    //TODO data-active是页面激活时触发的，如果之前“页面”已经渲染完成，此时才会触发该事件
    //如果没有data-switch和data-active等事件，则不再展示加载中
    while (target && target != document.body) {
        //只有定义了页面的元素才处理data-switch和data-active
        if (UTIL.getDomData(target, "defpageid")) {
            var existEvent = false;
            if (UTIL.getDomData(target, "switch")) {
                existEvent = true;
                this.triggerEvent(target, "switch", data);
            }
            if (activeTri && UTIL.getDomData(target, "active")) {
                existEvent = true;
                this.triggerEvent(target, "active", data);
            }
            UTIL.addClass(target, 'active');

            if (!existEvent) {
                this.hideLoading(target);
            }
        }

        target = target.parentNode;
    }
};

/**
 * 数组中是否存在某个元素
 * @param {Array} arr 数组
 * @param {*} item 元素
 * @returns {Boolean} true:存在，false:不存在
 */
function isExist(arr, item) {
    return arr.indexOf(item) > -1;
};/**
 * TinySpa的一个对象，全局变量，在lib.js中被赋值。
 */
var TINYSPA = new TinySpa();;/**
 * 页面处理类
 *
 * @author linjianghe
 * @date   2015-07-15
 */
var Page = (function(TINYSPA) {

    /**
     * 定义一个Page类，用于处理页面
     * @param  {string}   pageName 页面名字，需要唯一
     * @author linjianghe
     * @date   2015-08-06
     */
    function Page(pageName) {
        this.pageName = pageName;

        /**
         * 页面初始化时执行的方法，它通过Page.prototype.initPage方法进行覆盖
         * @author linjianghe
         * @date   2015-08-06
         */
        this.init = function() {
            console.debug("[jwap][page.js][this.init] pageName=" + this.pageName); //@debug
        };
    }

    /**
     * 设置page的container，一般只需要执行一次即可
     * @author linjianghe
     * @date   2015-08-31
     */
    Page.prototype.getContainer = function() {
        console.debug("[jwap][page.js][Page.prototype.getContainer] ", this); //@debug

        if (!this.container) {
            this.container = $('[data-defpageid="' + this.pageName + '"]');
        }
        return this.container;
    };


    /**
     * 页面初始化时执行的方法
     * @param  {function} callback 回调
     * @author linjianghe
     * @date   2015-08-06
     */
    Page.prototype.initPage = function(callback) {
        console.debug("[jwap][page.js][Page.prototype.initPage] ", this); //@debug

        if (_isFunction(callback)) {
            this.init = callback;
        }
    };

    /**
     * 页面的switch事件触发函数
     * @param  {function}   callback 回调处理函数
     * @author linjianghe
     * @date   2015-08-06
     */
    Page.prototype.triggerSwitch = function(callback) {
        console.debug("[jwap][page.js][Page.prototype.triggerSwitch] ", this); //@debug
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
            setTimeout(function() {
                callback.call(that);
            }, 10);
        }
    };

    /**
     * 页面的active事件触发函数
     * @param  {function}   callback 回调处理函数
     * @author linjianghe
     * @date   2015-08-06
     */
    Page.prototype.triggerActive = function(callback) {
        console.debug("[jwap][page.js][Page.prototype.triggerActive] ", this); //@debug

        //切换函数
        if (_isFunction(callback)) {
            callback.call(this);
        }
    };

    /**
     * 获得页面名称
     * @return {string}   页面名称
     * @author linjianghe
     * @date   2015-08-31
     */
    Page.prototype.getPageName = function() {
        return this.pageName;
    };

    /**
     * 获得在本页的请求参数，从URL中获得。
     * 比如?channel=78788#id=index&idno=4，
     *  如果只是hash值，则返回{"id":"index","idno":"4"}
     *  如果还包含search值，则返回{"id":"index","idno":"4","channel":"78788"}
     * @param  {boolean}   includeSearchParam 是否追加返回location.search中的请求
     * @return {object}                      结果
     * @author linjianghe
     * @date   2015-08-10
     */
    Page.prototype.getParam = function(includeSearchParam) {
        console.debug("[jwap][page.js][Page.prototype.getParam] ", includeSearchParam, this); //@debug
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

})(TINYSPA);;/**
 * 初始化一些事件、行为等
 *
 * @author linjianghe
 * @date   2015-11-26
 */

var _t;

/**
 * 绑定click事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("click", function (e) {
    console.debug("[jspa][event.js] event happend : click", e.target); //@debug
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
    console.debug("[jspa][event.js] event happend : switch"); //@debug
    var target = e.target,
        action = UTIL.getDomData(target, "switch");

    if (action) {
        TINYSPA.addEventAction(target, e);
    }

    //TODO 触发switchbegin事件，用于显示加载中
});

/**
 * 绑定active事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("active", function (e) {
    console.debug("[jspa][event.js] event happend : active"); //@debug

    var target = e.target;
    if (target) {
        TINYSPA.addEventAction(target, e);
    }
});

/**
 * 绑定scriptload事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("scriptload", function (e) {
    console.debug("[jspa][event.js] event happend : scriptload"); //@debug

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
    }, 50); //加个等待时间, 等待js代码加载完毕.
});

//绑定这些事件，它们触发时动作都一样的
(function () {
    var events = ["scroll", "resize", "onorientationchange", "domchange"];
    var fn = function (e) {
        console.debug("[jspa][event.js] event happend : " + e.type); //@debug
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
    console.debug("[jspa][event.js] event happend : viewchange"); //@debug
    INVIEW.handle(e);
});

/**
 * 绑定viewchange事件
 * @param  {String}   事件类型
 * @return {Function}      执行函数
 */
window.on("load", function (e) {
    console.debug("[jspa][event.js] event happend : load"); //@debug
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


//全局绑定hashchange事件
window.on("hashchange", function(e) {
    console.log("[jwap][navigate.js] hash QUEUE:", JSON.stringify(TINYSPA.queueHistory), history.length); //@debug

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
            console.debug("[jwap][navigate.js] hashchange happend! Equal to history.back()"); //@debug
            TINYSPA.queueHistory.pop();
            len--;

            TINYSPA.currScrollY = lastSecond.scrollY || 1;
            console.log("[jwap][navigate.js] hash QUEUE after history.back():", JSON.stringify(TINYSPA.queueHistory)); //@debug
        }
    }

    // 如果队列中最后一个地址不是location.hash，则增加之。
    if (len > 0) {
        last = TINYSPA.queueHistory[len - 1];

        if (last.hash !== curHash) {
            console.log("[jwap][navigate.js] add in QUEUE before:", JSON.stringify(TINYSPA.queueHistory)); //@debug
            // 如果不是当前页面，则增加历史记录，且设置滚动条位置
            TINYSPA.queueHistory.push({
                hash: curHash,
                scrollY: window.scrollY
            });
            console.log("[jwap][navigate.js] add in QUEUE after:", JSON.stringify(TINYSPA.queueHistory)); //@debug
        } else {
            //找到当前的页面，则要设置滚动条位置
            console.log("[jwap][navigate.js] Exist in QUEUE scrollY:", JSON.stringify(last)); //@debug
            TINYSPA.currScrollY = last.scrollY || 1;
        }
    } else {
        console.log("[jwap][navigate.js] QUEUE is EMPTY", JSON.stringify(TINYSPA.queueHistory)); //@debug
        // 如果队列为空，则增加一条记录
        TINYSPA.queueHistory.push({
            hash: curHash,
            scrollY: window.scrollY
        });
        console.log("[jwap][navigate.js] add first one in QUEUE ", JSON.stringify(TINYSPA.queueHistory)); //@debug
    }

    if (!TINYSPA.urlFrom) {
        TINYSPA.urlFrom = "DIRECT";
        TINYSPA.urlCur = curHash;
    } else {
        TINYSPA.urlFrom = TINYSPA.urlCur;
        TINYSPA.urlCur = curHash;
    }

    console.log("[jwap][navigate.js] urlFrom,urlCur:", TINYSPA.urlFrom, TINYSPA.urlCur); //@debug



    // if (location.hash == (QUEUE[QUEUE.length - 2] && "#" + QUEUE[QUEUE.length - 2].hash)) {
    //     QUEUE.pop();
    //     TINYSPA.currScrollY = QUEUE.length > 0 && QUEUE[QUEUE.length - 1].scrollY || 1;
    // }
    TINYSPA.activePage(TINYSPA.getHashKV().id, {
        "urlFrom": TINYSPA.urlFrom,
        "urlCur": TINYSPA.urlCur
    });
});;/**
 * jWap对外暴露的一些公用函数
 *
 * @author linjianghe
 * @date   2015-07-15
 */
var LIB = (function() {

    function renderPage(options) {
        if (typeof options === "object") {
            var isSetDefault = false;

            //设置默认页面
            if (typeof options.pageDefaultId === "string") {
                TINYSPA.setPageDefaultId(options.pageDefaultId);
                isSetDefault = true;
            }

            //设置404页面
            if (typeof options.page404Id === "string") {
                TINYSPA.setPage404Id(options.page404Id);
            } else if (isSetDefault) {
                TINYSPA.setPage404Id(options.pageDefaultId);
            }

            //设置beforeLoad
            if (typeof options.beforeLoad === "function") {
                TINYSPA.setBeforeLoad(options.beforeLoad);
            }

            //设置afterLoad
            if (typeof options.afterLoad === "function") {
                TINYSPA.setAfterLoad(options.afterLoad);
            }
        }

        // TODO EVENT.trigger(window, "hashchange",{"test32":"33333333"});
        TINYSPA.render();
    }

    function goToPage(pageId, param) {
        TINYSPA.goToPage(pageId, param);
    }

    function setHtml(container, html, append, triggerActive) {
        TINYSPA.setHtml(container, html, append, triggerActive);
    }

    return {
        renderPage: renderPage,
        goToPage: goToPage,
        setHtml: setHtml
    };
})();
;/**
 * 做一些基本的初始化工作
 *
 * @author linjianghe
 * @date   2015-07-15
 */
// var INIT = (function() {
//设置基本样式，定义div[id]和section[id]


// function _initStyle() {
//  var arr = [];
//  //arr.push('<style type="text/css">');
//  arr.push('  *[data-defpageid]{display: none; }');
//  arr.push('  *[data-defpageid].active{display: block;}');
//  //arr.push('</style>');

//  var styleDom = document.createElement("style");
//  styleDom.type = "text/css";
//  styleDom.innerHTML = arr.join("\n");
//  document.head.appendChild(styleDom);
// }

// _initStyle();

// 自动将data-defpageid的加入page中，自动生存ID
// $(function() {
//     $("[data-defpageid]").each(function() {
//         var $this = $(this),
//             pageId = $this.attr("data-defpageid");

//         //增加ID以便后续操作
//         $this.attr("id", pageId);

//         //将其增加到页面数组中
//         jWap._config.addPage(pageId); //页面ID
//     });
// });

// 要处理?channel=77777#id=index情况

// })();


// 自动将data-defpageid的加入page中，自动生存ID

$("[data-defpageid]").forEach(function(elem, index) {

    var pageId = UTIL.getDomData(elem, "defpageid");

    //增加ID以便后续操作
    elem.setAttribute("id", pageId);

    //将其增加到页面数组中
    TINYSPA.addPage(pageId); //页面ID
});

return {
    render: LIB.renderPage,
    goToPage: LIB.goToPage,
    setHtml: LIB.setHtml,
    Page: Page
};
})(window);