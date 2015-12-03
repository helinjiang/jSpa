/*! jspa - v0.2.0
 * Copyright (c) helinjiang;
 */


var jSpa = (function(window, undefined) {
    /**
     * 注意，此文件稍微做了点修改，官网下载原版地址为：https://github.com/ftlabs/fastclick
     * @author helinjiang
     * @date   2015-11-30
     */
    var FastClick = (function() {
        'use strict';

        /**
         * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
         *
         * @codingstandard ftlabs-jsv2
         * @copyright The Financial Times Limited [All Rights Reserved]
         * @license MIT License (see LICENSE.txt)
         */

        /*jslint browser:true, node:true*/
        /*global define, Event, Node*/


        /**
         * Instantiate fast-clicking listeners on the specified layer.
         *
         * @constructor
         * @param {Element} layer The layer to listen on
         * @param {Object} [options={}] The options to override the defaults
         */
        function FastClick(layer, options) {
            var oldOnClick;

            options = options || {};

            /**
             * Whether a click is currently being tracked.
             *
             * @type boolean
             */
            this.trackingClick = false;


            /**
             * Timestamp for when click tracking started.
             *
             * @type number
             */
            this.trackingClickStart = 0;


            /**
             * The element being tracked for a click.
             *
             * @type EventTarget
             */
            this.targetElement = null;


            /**
             * X-coordinate of touch start event.
             *
             * @type number
             */
            this.touchStartX = 0;


            /**
             * Y-coordinate of touch start event.
             *
             * @type number
             */
            this.touchStartY = 0;


            /**
             * ID of the last touch, retrieved from Touch.identifier.
             *
             * @type number
             */
            this.lastTouchIdentifier = 0;


            /**
             * Touchmove boundary, beyond which a click will be cancelled.
             *
             * @type number
             */
            this.touchBoundary = options.touchBoundary || 10;


            /**
             * The FastClick layer.
             *
             * @type Element
             */
            this.layer = layer;

            /**
             * The minimum time between tap(touchstart and touchend) events
             *
             * @type number
             */
            this.tapDelay = options.tapDelay || 200;

            /**
             * The maximum time for a tap
             *
             * @type number
             */
            this.tapTimeout = options.tapTimeout || 700;

            if (FastClick.notNeeded(layer)) {
                return;
            }

            // Some old versions of Android don't have Function.prototype.bind
            function bind(method, context) {
                return function() {
                    return method.apply(context, arguments);
                };
            }


            var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
            var context = this;
            for (var i = 0, l = methods.length; i < l; i++) {
                context[methods[i]] = bind(context[methods[i]], context);
            }

            // Set up event handlers as required
            if (deviceIsAndroid) {
                layer.addEventListener('mouseover', this.onMouse, true);
                layer.addEventListener('mousedown', this.onMouse, true);
                layer.addEventListener('mouseup', this.onMouse, true);
            }

            layer.addEventListener('click', this.onClick, true);
            layer.addEventListener('touchstart', this.onTouchStart, false);
            layer.addEventListener('touchmove', this.onTouchMove, false);
            layer.addEventListener('touchend', this.onTouchEnd, false);
            layer.addEventListener('touchcancel', this.onTouchCancel, false);

            // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
            // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
            // layer when they are cancelled.
            if (!Event.prototype.stopImmediatePropagation) {
                layer.removeEventListener = function(type, callback, capture) {
                    var rmv = Node.prototype.removeEventListener;
                    if (type === 'click') {
                        rmv.call(layer, type, callback.hijacked || callback, capture);
                    } else {
                        rmv.call(layer, type, callback, capture);
                    }
                };

                layer.addEventListener = function(type, callback, capture) {
                    var adv = Node.prototype.addEventListener;
                    if (type === 'click') {
                        adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                            if (!event.propagationStopped) {
                                callback(event);
                            }
                        }), capture);
                    } else {
                        adv.call(layer, type, callback, capture);
                    }
                };
            }

            // If a handler is already declared in the element's onclick attribute, it will be fired before
            // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
            // adding it as listener.
            if (typeof layer.onclick === 'function') {

                // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
                // - the old one won't work if passed to addEventListener directly.
                oldOnClick = layer.onclick;
                layer.addEventListener('click', function(event) {
                    oldOnClick(event);
                }, false);
                layer.onclick = null;
            }
        }

        /**
         * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
         *
         * @type boolean
         */
        var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

        /**
         * Android requires exceptions.
         *
         * @type boolean
         */
        var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


        /**
         * iOS requires exceptions.
         *
         * @type boolean
         */
        var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


        /**
         * iOS 4 requires an exception for select elements.
         *
         * @type boolean
         */
        var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


        /**
         * iOS 6.0-7.* requires the target element to be manually derived
         *
         * @type boolean
         */
        var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

        /**
         * BlackBerry requires exceptions.
         *
         * @type boolean
         */
        var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

        /**
         * Determine whether a given element requires a native click.
         *
         * @param {EventTarget|Element} target Target DOM element
         * @returns {boolean} Returns true if the element needs a native click
         */
        FastClick.prototype.needsClick = function(target) {
            switch (target.nodeName.toLowerCase()) {

                // Don't send a synthetic click to disabled inputs (issue #62)
                case 'button':
                case 'select':
                case 'textarea':
                    if (target.disabled) {
                        return true;
                    }

                    break;
                case 'input':

                    // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
                    if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                        return true;
                    }

                    break;
                case 'label':
                case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
                case 'video':
                    return true;
            }

            return (/\bneedsclick\b/).test(target.className);
        };


        /**
         * Determine whether a given element requires a call to focus to simulate click into element.
         *
         * @param {EventTarget|Element} target Target DOM element
         * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
         */
        FastClick.prototype.needsFocus = function(target) {
            switch (target.nodeName.toLowerCase()) {
                case 'textarea':
                    return true;
                case 'select':
                    return !deviceIsAndroid;
                case 'input':
                    switch (target.type) {
                        case 'button':
                        case 'checkbox':
                        case 'file':
                        case 'image':
                        case 'radio':
                        case 'submit':
                            return false;
                    }

                    // No point in attempting to focus disabled inputs
                    return !target.disabled && !target.readOnly;
                default:
                    return (/\bneedsfocus\b/).test(target.className);
            }
        };


        /**
         * Send a click event to the specified element.
         *
         * @param {EventTarget|Element} targetElement
         * @param {Event} event
         */
        FastClick.prototype.sendClick = function(targetElement, event) {
            var clickEvent, touch;

            // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
            if (document.activeElement && document.activeElement !== targetElement) {
                document.activeElement.blur();
            }

            touch = event.changedTouches[0];

            // Synthesise a click event, with an extra attribute so it can be tracked
            clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
            clickEvent.forwardedTouchEvent = true;
            targetElement.dispatchEvent(clickEvent);
        };

        FastClick.prototype.determineEventType = function(targetElement) {

            //Issue #159: Android Chrome Select Box does not open with a synthetic click event
            if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
                return 'mousedown';
            }

            return 'click';
        };


        /**
         * @param {EventTarget|Element} targetElement
         */
        FastClick.prototype.focus = function(targetElement) {
            var length;

            // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
            if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
                length = targetElement.value.length;
                targetElement.setSelectionRange(length, length);
            } else {
                targetElement.focus();
            }
        };


        /**
         * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
         *
         * @param {EventTarget|Element} targetElement
         */
        FastClick.prototype.updateScrollParent = function(targetElement) {
            var scrollParent, parentElement;

            scrollParent = targetElement.fastClickScrollParent;

            // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
            // target element was moved to another parent.
            if (!scrollParent || !scrollParent.contains(targetElement)) {
                parentElement = targetElement;
                do {
                    if (parentElement.scrollHeight > parentElement.offsetHeight) {
                        scrollParent = parentElement;
                        targetElement.fastClickScrollParent = parentElement;
                        break;
                    }

                    parentElement = parentElement.parentElement;
                } while (parentElement);
            }

            // Always update the scroll top tracker if possible.
            if (scrollParent) {
                scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
            }
        };


        /**
         * @param {EventTarget} targetElement
         * @returns {Element|EventTarget}
         */
        FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

            // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
            if (eventTarget.nodeType === Node.TEXT_NODE) {
                return eventTarget.parentNode;
            }

            return eventTarget;
        };


        /**
         * On touch start, record the position and scroll offset.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.onTouchStart = function(event) {
            var targetElement, touch, selection;

            // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
            if (event.targetTouches.length > 1) {
                return true;
            }

            targetElement = this.getTargetElementFromEventTarget(event.target);
            touch = event.targetTouches[0];

            if (deviceIsIOS) {

                // Only trusted events will deselect text on iOS (issue #49)
                selection = window.getSelection();
                if (selection.rangeCount && !selection.isCollapsed) {
                    return true;
                }

                if (!deviceIsIOS4) {

                    // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                    // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                    // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                    // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                    // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                    // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                    // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                    // random integers, it's safe to to continue if the identifier is 0 here.
                    if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                        event.preventDefault();
                        return false;
                    }

                    this.lastTouchIdentifier = touch.identifier;

                    // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                    // 1) the user does a fling scroll on the scrollable layer
                    // 2) the user stops the fling scroll with another tap
                    // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                    // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                    // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                    this.updateScrollParent(targetElement);
                }
            }

            this.trackingClick = true;
            this.trackingClickStart = event.timeStamp;
            this.targetElement = targetElement;

            this.touchStartX = touch.pageX;
            this.touchStartY = touch.pageY;

            // Prevent phantom clicks on fast double-tap (issue #36)
            if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
                event.preventDefault();
            }

            return true;
        };


        /**
         * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.touchHasMoved = function(event) {
            var touch = event.changedTouches[0],
                boundary = this.touchBoundary;

            if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
                return true;
            }

            return false;
        };


        /**
         * Update the last position.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.onTouchMove = function(event) {
            if (!this.trackingClick) {
                return true;
            }

            // If the touch has moved, cancel the click tracking
            if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
                this.trackingClick = false;
                this.targetElement = null;
            }

            return true;
        };


        /**
         * Attempt to find the labelled control for the given label element.
         *
         * @param {EventTarget|HTMLLabelElement} labelElement
         * @returns {Element|null}
         */
        FastClick.prototype.findControl = function(labelElement) {

            // Fast path for newer browsers supporting the HTML5 control attribute
            if (labelElement.control !== undefined) {
                return labelElement.control;
            }

            // All browsers under test that support touch events also support the HTML5 htmlFor attribute
            if (labelElement.htmlFor) {
                return document.getElementById(labelElement.htmlFor);
            }

            // If no for attribute exists, attempt to retrieve the first labellable descendant element
            // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
            return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
        };


        /**
         * On touch end, determine whether to send a click event at once.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.onTouchEnd = function(event) {
            var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

            if (!this.trackingClick) {
                return true;
            }

            // Prevent phantom clicks on fast double-tap (issue #36)
            if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
                this.cancelNextClick = true;
                return true;
            }

            if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
                return true;
            }

            // Reset to prevent wrong click cancel on input (issue #156).
            this.cancelNextClick = false;

            this.lastClickTime = event.timeStamp;

            trackingClickStart = this.trackingClickStart;
            this.trackingClick = false;
            this.trackingClickStart = 0;

            // On some iOS devices, the targetElement supplied with the event is invalid if the layer
            // is performing a transition or scroll, and has to be re-detected manually. Note that
            // for this to function correctly, it must be called *after* the event target is checked!
            // See issue #57; also filed as rdar://13048589 .
            if (deviceIsIOSWithBadTarget) {
                touch = event.changedTouches[0];

                // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
                targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
                targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
            }

            targetTagName = targetElement.tagName.toLowerCase();
            if (targetTagName === 'label') {
                forElement = this.findControl(targetElement);
                if (forElement) {
                    this.focus(targetElement);
                    if (deviceIsAndroid) {
                        return false;
                    }

                    targetElement = forElement;
                }
            } else if (this.needsFocus(targetElement)) {

                // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
                // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
                if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                    this.targetElement = null;
                    return false;
                }

                this.focus(targetElement);
                this.sendClick(targetElement, event);

                // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
                // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
                if (!deviceIsIOS || targetTagName !== 'select') {
                    this.targetElement = null;
                    event.preventDefault();
                }

                return false;
            }

            if (deviceIsIOS && !deviceIsIOS4) {

                // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
                // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
                scrollParent = targetElement.fastClickScrollParent;
                if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                    return true;
                }
            }

            // Prevent the actual click from going though - unless the target node is marked as requiring
            // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
            if (!this.needsClick(targetElement)) {
                event.preventDefault();
                this.sendClick(targetElement, event);
            }

            return false;
        };


        /**
         * On touch cancel, stop tracking the click.
         *
         * @returns {void}
         */
        FastClick.prototype.onTouchCancel = function() {
            this.trackingClick = false;
            this.targetElement = null;
        };


        /**
         * Determine mouse events which should be permitted.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.onMouse = function(event) {

            // If a target element was never set (because a touch event was never fired) allow the event
            if (!this.targetElement) {
                return true;
            }

            if (event.forwardedTouchEvent) {
                return true;
            }

            // Programmatically generated events targeting a specific element should be permitted
            if (!event.cancelable) {
                return true;
            }

            // Derive and check the target element to see whether the mouse event needs to be permitted;
            // unless explicitly enabled, prevent non-touch click events from triggering actions,
            // to prevent ghost/doubleclicks.
            if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

                // Prevent any user-added listeners declared on FastClick element from being fired.
                if (event.stopImmediatePropagation) {
                    event.stopImmediatePropagation();
                } else {

                    // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                    event.propagationStopped = true;
                }

                // Cancel the event
                event.stopPropagation();
                event.preventDefault();

                return false;
            }

            // If the mouse event is permitted, return true for the action to go through.
            return true;
        };


        /**
         * On actual clicks, determine whether this is a touch-generated click, a click action occurring
         * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
         * an actual click which should be permitted.
         *
         * @param {Event} event
         * @returns {boolean}
         */
        FastClick.prototype.onClick = function(event) {
            var permitted;

            // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
            if (this.trackingClick) {
                this.targetElement = null;
                this.trackingClick = false;
                return true;
            }

            // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
            if (event.target.type === 'submit' && event.detail === 0) {
                return true;
            }

            permitted = this.onMouse(event);

            // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
            if (!permitted) {
                this.targetElement = null;
            }

            // If clicks are permitted, return true for the action to go through.
            return permitted;
        };


        /**
         * Remove all FastClick's event listeners.
         *
         * @returns {void}
         */
        FastClick.prototype.destroy = function() {
            var layer = this.layer;

            if (deviceIsAndroid) {
                layer.removeEventListener('mouseover', this.onMouse, true);
                layer.removeEventListener('mousedown', this.onMouse, true);
                layer.removeEventListener('mouseup', this.onMouse, true);
            }

            layer.removeEventListener('click', this.onClick, true);
            layer.removeEventListener('touchstart', this.onTouchStart, false);
            layer.removeEventListener('touchmove', this.onTouchMove, false);
            layer.removeEventListener('touchend', this.onTouchEnd, false);
            layer.removeEventListener('touchcancel', this.onTouchCancel, false);
        };


        /**
         * Check whether FastClick is needed.
         *
         * @param {Element} layer The layer to listen on
         */
        FastClick.notNeeded = function(layer) {
            var metaViewport;
            var chromeVersion;
            var blackberryVersion;
            var firefoxVersion;

            // Devices that don't support touch don't need FastClick
            if (typeof window.ontouchstart === 'undefined') {
                return true;
            }

            // Chrome version - zero for other browsers
            chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

            if (chromeVersion) {

                if (deviceIsAndroid) {
                    metaViewport = document.querySelector('meta[name=viewport]');

                    if (metaViewport) {
                        // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                        if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                            return true;
                        }
                        // Chrome 32 and above with width=device-width or less don't need FastClick
                        if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                            return true;
                        }
                    }

                    // Chrome desktop doesn't need FastClick (issue #15)
                } else {
                    return true;
                }
            }

            if (deviceIsBlackBerry10) {
                blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

                // BlackBerry 10.3+ does not require Fastclick library.
                // https://github.com/ftlabs/fastclick/issues/251
                if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                    metaViewport = document.querySelector('meta[name=viewport]');

                    if (metaViewport) {
                        // user-scalable=no eliminates click delay.
                        if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                            return true;
                        }
                        // width=device-width (or less than device-width) eliminates click delay.
                        if (document.documentElement.scrollWidth <= window.outerWidth) {
                            return true;
                        }
                    }
                }
            }

            // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
            if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
                return true;
            }

            // Firefox version - zero for other browsers
            firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

            if (firefoxVersion >= 27) {
                // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

                metaViewport = document.querySelector('meta[name=viewport]');
                if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                    return true;
                }
            }

            // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
            // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
            if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
                return true;
            }

            return false;
        };


        /**
         * Factory method for creating a FastClick object
         *
         * @param {Element} layer The layer to listen on
         * @param {Object} [options={}] The options to override the defaults
         */
        FastClick.attach = function(layer, options) {
            return new FastClick(layer, options);
        };


        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

            // AMD. Register as an anonymous module.
            define(function() {
                return FastClick;
            });
        } else if (typeof module !== 'undefined' && module.exports) {
            module.exports = FastClick.attach;
            module.exports.FastClick = FastClick;
        } else {
            window.FastClick = FastClick;
        }

        return FastClick;
    }());;
    /**
     * 注意，此文件稍微做了点修改，官网下载原版地址为：https://github.com/remy/min.js
     * @author helinjiang
     * @date   2015-11-30
     */
    var $ = function(t, n, e) {
        var i = Node.prototype,
            r = NodeList.prototype,
            o = "forEach",
            u = "trigger",
            c = [][o],
            s = t.createElement("i");
        return r[o] = c, n.on = i.on = function(t, n) {
            return this.addEventListener(t, n, !1), this
        }, r.on = function(t, n) {
            return this[o](function(e) {
                e.on(t, n)
            }), this
        }, n[u] = i[u] = function(n, e) {
            var i = t.createEvent("HTMLEvents");
            return i.initEvent(n, !0, !0), i.data = e || {}, i.eventName = n, i.target = this, this.dispatchEvent(i), this
        }, r[u] = function(t) {
            return this[o](function(n) {
                n[u](t)
            }), this
        }, e = function(n) {
            var e = t.querySelectorAll(n || "☺"),
                i = e.length;
            return 1 == i ? e[0] : e
        }, e.on = i.on.bind(s), e[u] = i[u].bind(s), e
    }(document, this);;
    /**
     * 工具库
     *
     * @author helinjiang
     * @date   2015-11-30
     */
    var UTIL = (function() {
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

            var data = function(curelem, curkey) {
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
    })();;
    /**
     * 这个JS定义了一个控件, 当已注册的页面元素显现时(出现在用户视窗内)触发动作，
     * 用以识别并触发data-inview中的事件，并处理data-src图片懒加载
     *
     * @author helinjiang
     * @date   2015-11-30
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
        function handle() {
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

    })(UTIL);;
    /**
     * TinySpa 类定义
     *
     * @author helinjiang
     * @date   2015-11-30
     */

    /**
     *
     * @constructor
     */
    function TinySpa() {

        /**
         * 默认的页面ID，如果没有#id这样的参数的话
         * @type {String}
         */
        this.pageDefaultId = 'index';

        /**
         * 出错的页面ID，如果有#id=xxx，但xxx在页面中又没定义的话
         * @type {String}
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
         * 当前的url从哪跳转过来的，取自location.hash值，如果是从外部而来，则值为document.referrer || "DIRECT";
         * @type {String}
         */
        this.urlFrom = undefined;

        /**
         * 当前的url hash值，取自location.hash值
         * @type {String}
         */
        this.urlCur = undefined;

        /**
         * 加载前调用的方法
         * @type {Function}
         */
        this.beforeLoad = function() {};

        /**
         * 加载后调用的方法
         * @type {Function}
         */
        this.afterLoad = function() {};
    }

    /**
     * 设置默认页面
     * @param  {String}   pageId 页面ID
     */
    TinySpa.prototype.setPageDefaultId = function(pageId) {
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
    TinySpa.prototype.setPage404Id = function(pageId) {
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
    TinySpa.prototype.addPage = function(pageId) {
        if (!isExist(this.pageList, pageId)) {
            this.pageList.push(pageId);
        }
    };

    /**
     * 获得检查过后的页面ID，如果该ID没有在pageList中定义，则默认值为page404Id
     * @param  {String} pageId 页面ID
     * @return {String}    检查过后的页面ID
     */
    TinySpa.prototype.getCheckedId = function(pageId) {
        //如果id没有值，则应该是默认页面
        if (typeof pageId === "undefined") {
            return this.pageDefaultId;
        }

        //如果id有值，但并不是页面ID，则返回404页面
        return isExist(this.pageList, pageId) ? pageId : this.page404Id;
    };

    /**
     * 设置默认页面
     * @param  {String}   pageId 默认页面ID
     */
    TinySpa.prototype.setPageDefaultId = function(pageId) {
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
    TinySpa.prototype.setPage404Id = function(pageId) {
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
    TinySpa.prototype.setBeforeLoad = function(fn) {
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
    TinySpa.prototype.setAfterLoad = function(fn) {
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
    TinySpa.prototype.triggerEvent = function(elem, event, data) {
        elem.trigger(event, data);
    };

    /**
     * 为某个DOM对象处理事件
     * @param  {Object}   target DOM
     * @param  {Object}   e 事件
     */
    TinySpa.prototype.addEventAction = function(target, e) {
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
    TinySpa.prototype.showLoading = function(target) {
        if (!target) {
            return;
        }

        if (typeof this.beforeLoad === "function") {
            this.beforeLoad(target);
        }
    };

    /**
     * 隐藏目标上的加载中图片显示
     * @param  {Object} target DOM
     */
    TinySpa.prototype.hideLoading = function(target) {
        if (!target) {
            return;
        }

        if (typeof this.afterLoad === "function") {
            this.afterLoad(target);
        }
    };

    /**
     * 加载并渲染某页面中的元素
     * @param  {String} id    page id
     * @param  {Object} data    附加的数据，包括urlFrom和urlCur等
     */
    TinySpa.prototype.loadDom = function(id, data) {
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
     * @param {Object} container     DOM元素
     * @param {String} html          html代码
     * @param {Boolean} append       是否为追加，如果为true，则container中的内容会先被销毁，默认为false，即覆盖
     * @param {Boolean} triggerActive 是否触发active事件，如果为ture，则若container元素上定义了data-active就会触发其中的方法，默认不触发
     */
    TinySpa.prototype.setHtml = function(container, html, append, triggerActive) {
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
            setTimeout(function() {
                // 每次设置了新的DOM,则需要为这个container重新绑定一次inview事件
                INVIEW.bindInview(container, function(e) {
                    TINYSPA.addEventAction(this, e);
                });

                // 每次设置了新的DOM,则需要触发domchange事件
                tinyspa.triggerEvent(container, "domchange");

                // 每次设置了新的DOM,则如果triggerActive为true,则需要触发active事件
                if (triggerActive) {
                    tinyspa.triggerEvent(container, "active");
                }
            }, 0);
        }
    };

    /**
     * 获得当前的页面ID，即page id
     * @return {String} 页面ID
     */
    TinySpa.prototype.getCurPageId = function() {
        // 合法的hash值格式为#index&x=1,因此只要获取#之后的那个值即可
        var hash = location.hash,
            pageId = hash.match(/#([^&]*)&?/)[1];

        return this.getCheckedId(pageId);
    };

    /**
     * 获得URL中参数对象
     * @return {Object} URL中参数对象
     */
    TinySpa.prototype.getHashKV = function() {
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
     * @param  {String} pageId    page id
     * @param  {Object} param 附加参数
     * @param  {Object} target 当前dom
     */
    TinySpa.prototype.goToPage = function(navTo, param, target) {
        //如果id为http或https请求，则直接跳转到指定页面
        if (/^http(s)?:/i.test(navTo)) {
            setTimeout(function() {
                location.href = pageId;
            }, 500);
            return;
        }

        // 如果param不是对象，则将其设置为空对象
        if (typeof param !== "object") {
            param = {};
        }

        var pattern = /(\w+)(\((\w[^,])+\))?/g,
            res = {},
            arr = navTo.match(pattern),
            pageId;

        // 处理类似这种带参数的跳转id：<a data-nav="search(key)" data-key="xxx"></a>
        if (!arr) {
            console.error("[jspa][tinyspa.js][goToPage] Can not find anything from " + navTo);
            return;
        }

        // 获得页面ID，例如：<a data-nav="search)"></a>中的search
        pageId = this.getCheckedId(arr.shift());

        // 如果arr还有元素，则此时处理的是类似这种带参数的跳转id：<a data-nav="search(key)" data-key="xxx"></a>
        if (arr.length > 0 && target) {
            for (var i = 0, length = arr.length; i < length; i++) {
                var val = UTIL.getDomData(target, arr[i]);
                if (val) {
                    res[arr[i]] = val;
                }
            }
        }

        // 合并res和param，其中param参数优先级高
        for (var k in param) {
            res[k] = param[k];
        }

        // 生成新的hash值
        var str = UTIL.serializeParam(res),
            hashTo = "#" + pageId;

        if (str) {
            hashTo = hashTo + "&" + str;
        }

        // 切换页面
        location.hash = hashTo;
    };

    /**
     * 激活某个页面
     * @param  {String} id    page id
     * @param  {Object} data    附加的数据，包括urlFrom和urlCur等
     */
    TinySpa.prototype.activePage = function(id, data) {
        UTIL.removeClass($("[data-defpageid].active"), 'active');

        id = this.getCheckedId(id);

        this.loadDom(id, data);

        //回到上次记录的高度
        //window.scrollTo(0, this.currScrollY);
    };

    /**
     * 触发hashchange事件，使之开始渲染页面
     */
    TinySpa.prototype.render = function() {
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
     * @param  {Object}   target DOM对象，不是jQuery对象
     * @param  {String}   event  事件名称
     * @return {Boolean}          true：处理成功，false：处理失败
     */
    TinySpa.prototype.invoke = function(fnName, target, event) {
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
     * @param {Object} target     DOM元素jQuery对象
     * @param {Boolean} activeTri 是否触发active事件，如果为ture，则若container元素上定义了data-active就会触发其中的方法
     * @param  {Object} data    附加的数据，包括urlFrom和urlCur等
     */
    TinySpa.prototype.showActive = function(target, activeTri, data) {
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
    };
    /**
     * TinySpa的一个对象，全局变量，在lib.js中被赋值。
     */
    var TINYSPA = new TinySpa();;
    /**
     * 页面处理类
     *
     * @author helinjiang
     * @date   2015-11-30
     */
    var Page = (function(TINYSPA) {

        /**
         * 定义一个Page类，用于处理页面
         * @param  {String}   pageName 页面名字，需要唯一
         */
        function Page(pageName) {
            this.pageName = pageName;

            /**
             * 页面初始化时执行的方法，它通过Page.prototype.initPage方法进行覆盖
             */
            this.init = function() {
                console.debug("[jspa][page.js][this.init] pageName=" + this.pageName); //@debug
            };
        }

        /**
         * 设置page的container，一般只需要执行一次即可
         */
        Page.prototype.getContainer = function() {
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
        Page.prototype.initPage = function(callback) {
            console.debug("[jspa][page.js][Page.prototype.initPage] ", this); //@debug

            if (_isFunction(callback)) {
                this.init = callback;
            }
        };

        /**
         * 页面的switch事件触发函数
         * @param  {Function}   callback 回调处理函数
         */
        Page.prototype.triggerSwitch = function(callback) {
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
                setTimeout(function() {
                    callback.call(that);
                }, 10);
            }
        };

        /**
         * 页面的active事件触发函数
         * @param  {Function}   callback 回调处理函数
         */
        Page.prototype.triggerActive = function(callback) {
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
        Page.prototype.getPageName = function() {
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
        Page.prototype.getParam = function(includeSearchParam) {
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

    })(TINYSPA);;
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
    window.on("click", function(e) {
        console.debug("[jspa][app.js] event happend : click", e.target); //@debug
        var target = e.target,
            clickFn,
            navTo,
            action = function() {
                // 处理click事件
                if (clickFn && clickFn.length) {
                    TINYSPA.addEventAction(target, e);
                }

                // 处理页面切换
                if (navTo && navTo.length) {
                    TINYSPA.goToPage(navTo, {}, target);
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
    window.on("switch", function(e) {
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
    window.on("active", function(e) {
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
    window.on("scriptload", function(e) {
        console.debug("[jspa][app.js] event happend : scriptload"); //@debug

        //加个等待时间, 等待js代码加载完毕.
        setTimeout(function() {
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
    (function() {
        var events = ["scroll", "resize", "onorientationchange", "domchange"],
            _t;

        var fn = function(e) {
            console.debug("[jspa][app.js] event happend : " + e.type); //@debug
            if (_t) {
                clearTimeout(_t);
            }

            _t = setTimeout(function(e) {
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
    window.on("viewchange", function(e) {
        console.debug("[jspa][app.js] event happend : viewchange"); //@debug
        INVIEW.handle(e);
    });

    /**
     * 绑定viewchange事件
     * @param  {String}   事件类型
     * @return {Function}      执行函数
     */
    window.on("load", function(e) {
        console.debug("[jspa][app.js] event happend : load"); //@debug
        // 引用FastClick以便解决点击穿透与延迟的问题
        // 只有引入了FastClick再处理
        if (FastClick) {
            FastClick.attach(document.body);
        }

        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 1000);

        TINYSPA.triggerEvent(window, "scriptload");
    });

    // 等同于jQuery的$(document).ready方法
    document.addEventListener("DOMContentLoaded", function() {
        TINYSPA.triggerEvent(window, "load");
    });

    // 全局绑定hashchange事件
    // TODO 这一块对history的模拟操作好像有问题
    window.on("hashchange", function(e) {
        console.log("[jspa][app.js] hashchange"); //@debug

        var curHash = location.hash;

        // 如果不存在旧的urlCur，则取值document.referrer || "DIRECT"
        if (!TINYSPA.urlCur) {
            TINYSPA.urlFrom = document.referrer || "DIRECT";
        } else {
            TINYSPA.urlFrom = TINYSPA.urlCur;
        }

        // 将当前的urlCur修改为新的
        TINYSPA.urlCur = curHash;

        console.log("[jspa][app.js] urlFrom=%s, urlCur=%s", TINYSPA.urlFrom, TINYSPA.urlCur); //@debug

        TINYSPA.activePage(TINYSPA.getCurPageId(), {
            "urlFrom": TINYSPA.urlFrom,
            "urlCur": TINYSPA.urlCur
        });
    });

    // 为body的元素处理inview事件
    INVIEW.bindInview($("body"), function(e) {
        TINYSPA.addEventAction(this, e);
    });

    // TODO 要处理?channel=77777#id=index情况
    /**
     * 自动将data-defpageid的加入page中，自动生存ID
     */
    $("[data-defpageid]").forEach(function(elem) {

        var pageId = UTIL.getDomData(elem, "defpageid");

        //增加ID以便后续操作
        elem.setAttribute("id", pageId);

        //将其增加到页面数组中
        TINYSPA.addPage(pageId); //页面ID
    });;
    /**
     * jSpa对外暴露的一些公用函数
     *
     * @author helinjiang
     * @date   2015-11-30
     */
    var LIB = (function(Page) {
        function render(options) {
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

            TINYSPA.render();
        }

        function setHtml(container, html, append, triggerActive) {
            TINYSPA.setHtml(container, html, append, triggerActive);
        }

        function goToPage(navTo, param) {
            TINYSPA.goToPage(navTo, param);
        }

        return {
            render: render,
            goToPage: goToPage,
            setHtml: setHtml,
            Page: Page
        };
    })(Page);;
    return LIB;
})(window);
