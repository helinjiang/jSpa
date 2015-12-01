/**
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
})();