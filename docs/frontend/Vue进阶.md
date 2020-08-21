# Vue进阶

<Counter :path="'frontend'" :name="'Vue进阶'"></Counter>

## 一、VueCli

### 1、安装

首先安装 `nodejs`。

然后安装 `vue-cli`：`npm install vue-cli -g --registry=https://registry.npm.taobao.org`

检测是否安装成功：`vue list` ，如果能看到一列小星星就说明安装成功了。

### 2、初始化项目

初始化：`vue init webpack hello-vue-cli` ，然后根据自己的需要进行选择完成初始化，最后记得选择不使用 `npm install` 进行初始化，因为我们要自己来通过淘宝镜像进行安装初始化。

然后进入目录通过 `npm run dev` 进行启动。

## 二、VueRouter

在需要使用到 `vue-router` 的工程内进行安装 `vue-router` ：`npm install vue-router --save-dev --registry=https://registry.npm.taobao.org` ，这个命令表示安装在 `dev` 环境。

假设目前有2个 `vue` 页面，一个 `HelloWorld.vue` 一个 `Content.vue`，那么路由要怎么写呢？

首先在 `src` 目录下创建 `router` 目录，然后在里面创建 `index.js` 文件，内容如下：

```javascript
import Vue from 'vue'
import Router from 'vue-router'
import Content from "../components/Content";

Vue.use(Router);

export default new Router({
    routes: [
        {
            name: 'content',
            path: '/content',
            component: Content
        }
    ]
});
```
这里配置了当页面路由为 `/content` 时，路由到 `Content.vue` 组件。

然后编辑 `src` 目录下的 `main.js`：

```javascript
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
```
 
 添加了刚才写的路由信息 `router` 是 `router: router` 的简写，因为键值名一样。
 
 最后在主入口如下使用：
 
 ```vue
<template>
    <div id="app">
        <router-link to="/">首页</router-link>
        <router-link to="/content">内容页</router-link>
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App'
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>

```

`<router-link>` 放置的是路由地址，`<router-view>` 是将对应的组件实现到的区域。

<Valine></Valine>