/**
 * 公共处理函数,如果是业务处理相关的，则请放置在action.js中
 *
 * @author linjianghe
 * @date   2015-07-16
 */
window.UTIL = (function(global, undefined) {
    var type_text = ['unknown', 'ethernet', 'wifi', '2g', '3g', '4g', 'none'];


    /**
     * 获得当前的网络状况
     * @return {string}   ethernet、wifi、3g、2g、none、unknown
     * @author linjianghe
     * @date   2015-09-18
     */
    function getNetwork() {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {
            type: 'unknown'
        };
        if (typeof(connection.type) === "number") {
            connection.type_text = type_text[connection.type];
        } else {
            connection.type_text = connection.type;
        }
        if (typeof(connection.bandwidth) === "number") {
            if (connection.bandwidth > 10) {
                connection.type = 'wifi';
            } else if (connection.bandwidth > 2) {
                connection.type = '3g';
            } else if (connection.bandwidth > 0) {
                connection.type = '2g';
            } else if (connection.bandwidth === 0) {
                connection.type = 'none';
            } else {
                connection.type = 'unknown';
            }
        }
        return connection.type_text;
    }

    /**
     * 获得屏幕分辨率，例如1080x768
     * @return {string}   屏幕分辨率
     * @author linjianghe
     * @date   2015-09-18
     */
    function getResolution() {
        return [screen.width, screen.height].join("x");
    }

    /**
     * 重新加载页面，由于是单页面应用，有一些数据缓存，一般不使用这种方法来重加载，而是自定义函数重加载数据。
     * 只有在登录成功之后等场景下，要重载的东西很多时，再使用该方法。
     * @author linjianghe
     * @date   2015-07-16
     */
    function reload() {
        location.reload();
    }

    /**
     * 页面后退
     *
     * @author linjianghe
     * @date   2015-08-31
     */
    function back() {
        history.back();
    }


    function getTimeStamp(timeStamp) {
        var tmp = timeStamp + "";
        if (tmp.length < 11) {
            timeStamp *= 1000;
        }

        return timeStamp;
    }

    /**
     * 获得DOM上的数据，寻找data-[key]的值
     * @param  {Object} elem    DOM元素
     * @param  {String} key     key值
     * @param  {Bollean} upgoing 是否向上寻找，true：向上寻找，false：不用再向上寻找；
     * @return {String}         结果
     * @author linjianghe
     * @date   2015-09-21
     */
    function getDomData(elem, key, upgoing) {
        if (!elem) {
            return;
        }

        var val;

        var data = function(curelem, curkey) {
            var attr = curelem.attributes["data-" + curkey];
            if (attr) {
                return attr.value;
            }
        };

        if (upgoing) {
            while (!elem.is("body")) {
                val = elem.attr("data-" + key);
                if (val) {
                    break;
                } else {
                    elem = elem.parent();
                }
            }
        } else {
            val = elem.attr("data-" + key);
        }
        return val;
    }

    var exports = {
        "getNetwork": getNetwork,
        "getResolution": getResolution,
        "reload": reload,
        "back": back,
        "getTimeStamp": getTimeStamp,
        "getDomData": getDomData
    };

    return exports;

})(window);