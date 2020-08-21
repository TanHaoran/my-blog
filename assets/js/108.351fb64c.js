(window.webpackJsonp=window.webpackJsonp||[]).push([[108],{317:function(s,t,n){"use strict";n.r(t);var a=n(0),v=Object(a.a)({},(function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("h1",{attrs:{id:"时间复杂度"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#时间复杂度"}},[s._v("#")]),s._v(" 时间复杂度")]),s._v(" "),n("Counter",{attrs:{path:"structure",name:"时间复杂度"}}),s._v(" "),n("h2",{attrs:{id:"一、什么是时间复杂度"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#一、什么是时间复杂度"}},[s._v("#")]),s._v(" 一、什么是时间复杂度")]),s._v(" "),n("p",[s._v("我们经常会在算法时间复杂度分析中听到说某个算法的时间复杂度是 "),n("code",[s._v("O(1)")]),s._v(" 、 "),n("code",[s._v("O(n)")]),s._v(" 、 "),n("code",[s._v("O(logn)")]),s._v(" 、 "),n("code",[s._v("O(nlogn)")]),s._v(" 、 "),n("code",[s._v("O(n^2)")]),s._v(" ，那么这里面的 "),n("code",[s._v("O")]),s._v(" 和 "),n("code",[s._v("n")]),s._v(" 到底是什么含义呢？")]),s._v(" "),n("p",[s._v("简单的来说：")]),s._v(" "),n("ul",[n("li",[n("code",[s._v("O")]),s._v(" ：描述的是算法的运行时间和输入数据之间的关系")])]),s._v(" "),n("p",[s._v("注意这里是简单的来说，严格上的定义并不是这样子，但是可以这样子理解。但其实还不理解对吧，我们看下面这个代码：")]),s._v(" "),n("div",{staticClass:"language-java line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-java"}},[n("code",[s._v("    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("static")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("int")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sum")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("int")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" nums"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("int")]),s._v(" sum "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("for")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("int")]),s._v(" num "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" nums"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n            sum "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+=")]),s._v(" num"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n        "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" sum"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br")])]),n("p",[s._v("非常简单的一个数组求和运算。那么这个算法的时间复杂度是 "),n("code",[s._v("O(n)")]),s._v(" ，怎么理解呢？其实在这个算法中， "),n("code",[s._v("n")]),s._v(" 就是指 "),n("code",[s._v("nums")]),s._v(" 中的元素个数， "),n("code",[s._v("O(n)")]),s._v(" 就表示这个算法的时间复杂度是和 "),n("code",[s._v("nums")]),s._v(" 中元素的个数成线性关系的，也就是说 "),n("code",[s._v("nums")]),s._v(" 中元素的个数越多，时间复杂度越大。")]),s._v(" "),n("p",[s._v("那么这个 "),n("code",[s._v("O")]),s._v(" 又是什么含义呢？其实 "),n("code",[s._v("O")]),s._v(" 代表了忽略常数。因为我们知道一个时间复杂度的线性表达式的实际是这样子的： "),n("code",[s._v("T = c1 * n + c2")]),s._v(" ，对于上面这个求和的算法，对于数组中的每一个数字我们都做了什么操作呢？从数组中取出数字、把 "),n("code",[s._v("sum")]),s._v(" 取值、对 "),n("code",[s._v("sum")]),s._v(" 和当前数字求和、将求和结果重新存入 "),n("code",[s._v("sum")]),s._v("，这4个操作所花费的总时间就是线性表达式中的 "),n("code",[s._v("c1")]),s._v("。在求和过程中，初始化 "),n("code",[s._v("sum")]),s._v(" 的值和最后将 "),n("code",[s._v("sum")]),s._v(" 的值返回出去，那么这些操作的过程花费的时间就是表达式中的 "),n("code",[s._v("c2")]),s._v("。由于在实际的各个算法中，这个 "),n("code",[s._v("c1")]),s._v(" 和 "),n("code",[s._v("c2")]),s._v(" 的实际情况并不能统一的来量化出来，所以在实际计算时间复杂度的时候是要忽略掉这些常数。")]),s._v(" "),n("h2",{attrs:{id:"二、举例说明"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#二、举例说明"}},[s._v("#")]),s._v(" 二、举例说明")]),s._v(" "),n("p",[s._v("来看下下面3个时间复杂度表达式：")]),s._v(" "),n("ol",[n("li",[s._v("T = 2 * n + 2，时间复杂度是 "),n("code",[s._v("O(n)")])]),s._v(" "),n("li",[s._v("T = 2000 * n + 10000，时间复杂度是 "),n("code",[s._v("O(n)")])]),s._v(" "),n("li",[s._v("T = 1 * n * n + 0，时间复杂度是 "),n("code",[s._v("O(n^2)")])])]),s._v(" "),n("p",[s._v("从算法时间复杂度来看，第3个的时间复杂度由于是 "),n("code",[s._v("O(n^2)")]),s._v(" ，所以它要比第1个和第2个性能要差。但是这样子看，假如 "),n("code",[s._v("n")]),s._v(" 等于10的话，算下来第2个表达式的时间复杂度是30000，而第3个时间复杂度才是100，明显第3个时间复杂度要小些，也就是性能要高一些。其实这也可以看出来：并不是说对于任意的输入 "),n("code",[s._v("O(n^2)")]),s._v(" 的时间复杂度要比 "),n("code",[s._v("O(n)")]),s._v(" 的时间复杂度要大。")]),s._v(" "),n("p",[s._v("其实这个 "),n("code",[s._v("O")]),s._v(" 代表的是 "),n("code",[s._v("渐进时间复杂度")]),s._v(" ，它描述的是当 "),n("code",[s._v("n")]),s._v(" 趋近于无穷大的情况下的时间复杂度。那么从这个层面来看，当 "),n("code",[s._v("n")]),s._v(" 越大，上面第3个表达式的时间复杂度就要比第2个要越大。")]),s._v(" "),n("Valine")],1)}),[],!1,null,null,null);t.default=v.exports}}]);