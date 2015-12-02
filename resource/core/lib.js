/**
 * jSpa对外暴露的一些公用函数
 *
 * @author helinjiang
 * @date   2015-11-30
 */
var LIB = (function (Page) {
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

    return {
        render: render,
        goToPage: TINYSPA.goToPage,
        setHtml: TINYSPA.setHtml,
        Page: Page
    };
})(Page);
