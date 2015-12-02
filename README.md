# jSpa
轻量级的单页应用框架SPA，适合移动端或现代浏览器


## 功能
1. 路由功能，单页应用开发模拟生成不同的“页面”
2. 基础事件功能，模拟不同页面间的切换、dom事件支持（click\nav等）
3. 懒加载

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

### DOM
在要模拟的DOM元素上，增加属性 `data-defpageid` ，则相对于定义了一个虚拟页面，该属性的值就是这个页面的页面ID，用于在hash中进行定位。

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

### switch 事件
在dom中增加 `data-switch` 属性即可定义一个 switch 切换事件，其中属性值就是执行的函数方法名，因此请确保其真实存在，且为全局方法，否则，该dom将不做任何处理。

switch意味着切换，只有在切换页面时才触发。

switch 函数中将传入一个参数 `e` ，该参数与调用 `onclick` 事件获得的 `e` 相同，可以使用 `e.target` 获得当前触发 switch 事件的DOM对象

同一个 `data-switch` 中可以定义多个函数名，多个直接使用空格分隔。


```html

<a href="javascript:void(0);" data-switch="testSwitch">测试switch</a>

<a href="javascript:void(0);" data-switch="testSwitch testSwitch2">switch（两个）</a>

```

```javascript

function testSwitch(e) {
    console.log('testSwitch: ', e.target);
}

```

### active 事件
在dom中增加 `data-active` 属性即可定义一个 active 激活事件，其中属性值就是执行的函数方法名，因此请确保其真实存在，且为全局方法，否则，该dom将不做任何处理。

active意味着激活，除了切换页面时触发之外，在设置html时也可以使其触发，比如瀑布流加载场景，一般用于统计用途。

active 函数中将传入一个参数 `e` ，该参数与调用 `onclick` 事件获得的 `e` 相同，可以使用 `e.target` 获得当前触发 active 事件的DOM对象

同一个 `data-active` 中可以定义多个函数名，多个直接使用空格分隔。


```html

<a href="javascript:void(0);" data-active="testActive">测试active</a>

<a href="javascript:void(0);" data-active="testActive testActive2">active（两个）</a>

```

```javascript

function testActive(e) {
    console.log('testActive: ', e.target);
}

```

### inview 事件
在dom中增加 `data-inview` 属性即可定义一个 inview 懒加载事件（即只要该DOM出现在视野中，则执行该方法），其中属性值就是执行的函数方法名，因此请确保其真实存在，且为全局方法，否则，该dom将不做任何处理。

注意，由于每次滚动时都会判断是否在视野中（延时30ms），因此如果非必要，强烈建议不要在该函数内重复执行dom操作，只需进行一次，后续的如果判断已经操作了dom，就不要再操作了。否则大量的dom操作会有损性能。

### 图片懒加载
为图片 `img` 增加 `data-src` 属性，当出现在视野时，此属性会被设置为 `img` 的 `src` 属性，用以实现懒加载。

### Loading 加载中
如果在 `jSpa.render` 方法中传递参数中，定义了 `beforeLoad` 和 `afterLode` 两个函数，则模拟页面在渲染前会执行 `beforeLoad`，而在模拟页面渲染完毕之后会执行 `afterLoad` 。我们强烈建议使用这两个方法来控制显示“加载中”的效果，比如 `beforeLoad` 中开始展现“加载中”信息，而 `afterLoad中` 就取消该状态。


## 接口
### jSpa.render
Type: `Function(options)`

jSpa框架的初始化函数，其中 `options` 为对象，支持：

- `pageDefaultId`：虚拟的首页页面ID，默认值为 `index`
- `page404Id`：虚拟的404页面ID，默认值和 `pageDefaultId` 保持一致。
- `beforeLoad`：在加载虚拟页面( `switch` 事件)之前执行的函数，可为空
- `afterLoad`：在加载虚拟页面( `switch` 事件)之后执行的函数，可为空

### jSpa.goToPage
Type: `Function(pageId, param)`

跳转到哪个虚拟页面的函数。

- `pageId`：字符串，要跳转的虚拟页面ID，最终会生成 `xxx.html#xxx`
- `param`：对象，附加的数据对象，例如 `param={a:1,b:1}` ，则最终会生成 `xxx.html#xxx&a=1&b=1`

### jSpa.setHtml
Type: `Function(container, html, append, triggerActive)`

为 DOM 元素设置 html 代码。

- `container`： DOM 元素
- `html`：字符串，要设置的html代码
- `append`：boolean值，如果 `true` 则为追加模式，否则为覆盖模式
- `triggerActive`：boolean值，如果 `true` 则触发 `active` 事件，如果其定义了 `data-active` 属性，则将触发其中的方法。

### jSpa.Page
“模拟页面”的对象，所有“模拟页面”都继承这个来操作。

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
使用`new jSpa.Page(pageId)`命令创建一个页面：

1. 设置pageObj.initPage方法，也可以不设置，但推荐设置，可以在此函数中处理初始化的事情，比如获取首次加载之后的dom元素、url中的参数等
2. 增加对外使用的switchDo函数，在其中调用pageObj.triggerSwitch方法，并在为该方法传递回调函数
3. 增加对外使用的activeDo函数，在其中调用pageObj.triggerActive方法，并在为该方法传递回调函数


## 备注
switch意味着切换，只有在切换页面时才触发。e.data中已经附带了urlFrom(上一个页面hash值)和urlCur（当前页面hash值）

注意传值不能为id，待修改

hashchange事件发生之后，应该要实时刷新缓存的pageParam，可以使用map[pageId] = pageObj，来更新


有时候切换页面时，可能导致误返回，跳出了系统，需要确认

append
## 更新历史
2015.12.1 v0.1.0 初始化工程。