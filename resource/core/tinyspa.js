/**
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
 * 为某个DOM对象处理事件
 * @param  {Object}   target DOM
 * @param  {Object}   e 事件
 */
TinySpa.prototype.addEventAction = function (target, e) {
    var etype = e.type,
        type = (etype == "touchend") ? "click" : etype, //TODO 为什么将toucheend事件修改为click
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
        console.error("[jspa][domloader.js] loaddom NO TARGET by id=" + id); //@debug
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
                TINYSPA.addEventAction(this, e); // TODO 此处可能会有问题
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

    // 如果param不是对象，则将其设置为空对象
    if(typeof param !== "object"){
        param = {};
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
            console.debug("[jspa][navigate.js][to] to self!"); //@debug
            return;
        } else {
            if (len > 1) {
                // 如果队列中倒数第二个就是本页，则模拟“后退”，
                // 比如跳转之前是[index,detail]，下一步要跳转到index，则此时应该是[index]而不是[index,detail,index]
                lastSecond = this.queueHistory[len - 2];
                if (lastSecond.hash === hashTo) {
                    console.debug("[jspa][navigate.js][to] Equal to history.back()", lastSecond.hash, hashTo); //@debug
                    this.queueHistory.pop();
                    len--;

                    // currScrollY = lastSecond.scrollY || 1;
                    console.debug("[jspa][navigate.js][to] Equal to history.back() after pop:", JSON.stringify(this.queueHistory), history.length); //@debug
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
        // 如果没有hash，则做一次跳转，默认会跳转到首页
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
}