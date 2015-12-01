/**
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
