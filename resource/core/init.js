/**
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