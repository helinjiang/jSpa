# jSpa
轻量级的单页应用框架SPA，适合移动端或现代浏览器


## 使用说明
### JS文件
jSpa框架不依赖任何其他的框架，它是属于轻量级的框架。但是为了在手机上的体验，我们推荐再引入 FastClick框架（[https://github.com/ftlabs/fastclick](https://github.com/ftlabs/fastclick)）。

为此我们提供两个版本，一个版本为jspa-fastclick.js，已经将其打包在一起了；另外一个版本为单独的jspa.js，此时可以自行引入 FastClick ，但要注意将 FastClick 在 jspa.js之前引入。当然，如果您不乐意引入 FastClick 或者引入了其他的框架， jspa.js 也不会报错。

### 额外的样式
请在 head 部分增加以下样式，或者将其加入到 css 文件中。模拟不同的“页面”的理论基础是显示和隐藏，必须在以下样式的基础上才能继续。

```html

<style type="text/css">
    *[data-defpageid] {
        display: none;
    }
    
    *[data-defpageid].active {
        display: block;
    }
</style>

```

### click 事件
在dom中增加 `data-click` 属性即可定义一个 click 点击事件，其中属性值就是执行的函数方法名，因此请确保其真实存在，且为全局方法，否则，该dom将不做任何处理。

click 函数中将传入一个参数 `e` ，该参数与调用 `onclick` 事件获得的 `e` 相同，可以使用 `e.target` 获得当前触发 click 事件的DOM对象

同一个 `data-click` 中可以定义多个函数名，多个直接使用空格分隔。

```html

<a href="javascript:void(0);" data-click="testClick">测试点击事件</a>

<a href="javascript:void(0);" data-click="testClick testClick2">测试点击事件（两个）</a>

```

```javascript

function testClick(e) {
    console.log('testClick: ', e.target);
}

```

### nav 事件
在dom中增加 `data-nav` 属性即可定义一个 nav 页面跳转事件，其中属性值就是要跳转的页面ID，或者一个完整的 `URL`。

如果是定义类似 `data-nav="search(key1,key2)"` ，则意味这 `key1` 和 `key2` 为附加的请求参数，参数的值将从 `data-key1` 和 `data-key2` 中获取，如果无法获得值，则忽略该参数。

同一个 `data-nav` 只支持一个值。

```html
<!-- 最终生成URL类似：xxx.html#index -->
<a href="javascript:void(0);" data-nav="index">测试点击事件</a>

<!-- 最终生成URL类似：xxx.html#search&key1=1key1&key2=2key2 -->
<a href="javascript:void(0);" data-nav="search(key1,key2)" data-key1="1key1" data-key2="2key2">测试点击事件（两个）</a>

```



### inview和active事件

switch意味着切换，只有在切换页面时才触发。e.data中已经附带了urlFrom(上一个页面hash值)和urlCur（当前页面hash值）

active意味着激活，除了切换页面时触发之外，在设置html时也可以使其触发，比如瀑布流加载场景，一般用于统计用途

### 懒加载
增加data-inview属性，并设置函数名，则在该元素进入到视野时，将会触发执行该函数。注意，由于每次滚动时都会判断是否在视野中（延时30ms），因此如果非必要，强烈建议不要在该函数内重复执行dom操作，只需进行一次，后续的如果判断已经操作了dom，就不要再操作了。否则大量的dom操作会有损性能。

为图片增加data-src属性，当出现在视野时，此属性会被设置为img的src属性，用以实现懒加载。

### 加载中
如果在jWap.lib.renderPage传递参数中，定义了beforeLoad和afterLode两个函数，则模拟页面在渲染前会执行beforeLoad，而在模拟页面渲染完毕之后会执行afterLoad。我们强烈建议使用这两个方法来控制显示“加载中”的效果，比如beforeLoad中开始展现“加载中”信息，而afterLoad中就取消该状态。

## 功能

1. 路由功能，模拟生成不同的页面
2. 基础事件功能，模拟不同页面间的切换、dom事件支持（click\nav等）

## 接口
懒调用的好处是节约性能，所以每次使用时都请用get方法
### jWap.Page
“模拟页面”的对象

#### initPage(callback) 
“模拟页面”初始化时执行，只执行一次，并执行回调。

#### triggerSwitch(callback) 
触发“模拟页面”的switch事件，并执行回调。

#### activeSwitch(callback) 
触发“模拟页面”的active事件，并执行回调。

#### getPageName() 
获得“模拟页面”的名字

#### getPageContainer() 
获得“模拟页面”的最外层DOM元素

#### getPageParam() 
获得“模拟页面”的URL上的请求参数，注意请每次都重新获取该参数值，因为同一个页面可能请求参数不一样，比如详情页，还会传递不同id等参数。



## 测试用例

### 路由切换
使用`new jWap.Page(pageId)`命令创建一个页面：

1. 设置pageObj.initPage方法，也可以不设置，但推荐设置，可以在此函数中处理初始化的事情，比如获取首次加载之后的dom元素、url中的参数等
2. 增加对外使用的switchDo函数，在其中调用pageObj.triggerSwitch方法，并在为该方法传递回调函数
3. 增加对外使用的activeDo函数，在其中调用pageObj.triggerActive方法，并在为该方法传递回调函数


## 备注



注意传值不能为id，待修改

hashchange事件发生之后，应该要实时刷新缓存的pageParam，可以使用map[pageId] = pageObj，来更新


有时候切换页面时，可能导致误返回，跳出了系统，需要确认

append

## 更新历史
2015.12.1 v0.1.0 初始化工程。