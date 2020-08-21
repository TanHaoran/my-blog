# element-ui基础使用

<Counter :path="'frontend'" :name="'element-ui基础使用'"></Counter>

## 一、初始化

还是是用 `webpack` 进行初始化项目：`vue init webpack hello-vue-element`

安装 `vue-router` 路由：`npm install vue-router --save-dev --registry=https://registry.npm.taobao.org`

进入项目目录，安装 `element-ui` 依赖：`npm i element-ui -S --registry=https://registry.npm.taobao.org`

安装 `SASS` 加载器：`npm install sass-loader node-sass --save-dev --registry=https://registry.npm.taobao.org`

安装项目依赖：`npm install --registry=https://registry.npm.taobao.org`

启动项目：`npm run dev`

## 二、实现登录跳转

在根目录的 `main.js` 中引入 `element-ui`：

```javascript
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false;

Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {App},
  template: '<App/>',
  router,
  render: h => h(App)
});
```

创建 `router` 目录，初始化 `index.js`：

```javascript
import Vue from 'vue'
import Router from 'vue-router'

import Main from '../views/Main'
import Login from '../views/Login'

Vue.use(Router);

export default new Router({
    routes: [
        {
            name: 'Login',
            path: '/login',
            component: Login
        },
        {
            name: 'Main',
            path: '/main',
            component: Main
        },
    ]
});
```

在 `src` 下创建 `router` 和 `views` ，首先在 `views` 中创建首页 `Loign.vue` 和 `Main.vue`。

`Login.vue`

```vue
<template>
    <div>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="login-box">
            <h1 class="login-title">欢迎登录</h1>
            <el-form-item label="账号" prop="username">
                <el-input v-model="form.username">l</el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="form.password">l</el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="login('form')">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data() {
            return {
                form: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            login(form) {
                this.$refs[form].validate((valid) => {
                    if (valid) {
                        this.$router.push("/main");
                    } else {
                        this.$message.error('请输入正确的账号密码');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-title {
        text-align: center;
    }

    .login-box {
        width: 400px;
        border: 1px solid #DCDFE6;
        margin: 150px auto 0;
        padding: 20px 50px 20px 20px;
        text-align: left;
        border-radius: 5px;
        box-shadow: 0 0 20px;
    }
</style>
```

这里的 `:model="form'` 其实就是 `v-model="form"` ，做双向数据绑定的。

`:rules="rules"` 是绑定校验规则，对于需要做校验的 `<el-form-item` 需要添加 `prop="username` 属性，一个控件的校验规则可以有多个，所以在 `rules` 的 `username` 包含的是一个数组，`required: true, message: '请输入账号', trigger: 'blur'` 表示必填项，并且在失去光标焦点的时候进行验证，验证不通过则会显示 `message` 中的信息。

使用 `this.$router.push("/main");` 做路由跳转。

使用 `this.$message.error('请输入正确的账号密码');` 做一个错误的消息提示。

## 三、实现主界面布局

`Main.vue'
```vue
<template>
    <div>
        <el-container style="height: 500px; border: 1px solid #eee">
            <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
                <el-menu :default-openeds="['1']">
                    <el-submenu index="1">
                        <template slot="title"><i class="el-icon-message"></i>用户管理</template>
                        <el-menu-item-group>
                            <template slot="title">操作</template>
                            <el-menu-item index="1-1">
                                <router-link to="/user/add">新增用户</router-link>
                            </el-menu-item>
                            <el-menu-item index="1-2">
                                <router-link to="/user/list">用户列表</router-link>
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title"><i class="el-icon-menu"></i>商品管理</template>
                        <el-menu-item-group>
                            <el-menu-item index="2-1">新增商品</el-menu-item>
                            <el-menu-item index="2-2">商品列表</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-container>
                <el-header style="text-align: right; font-size: 12px">
                    <el-dropdown>
                        <i class="el-icon-setting" style="margin-right: 15px"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>查看</el-dropdown-item>
                            <el-dropdown-item>新增</el-dropdown-item>
                            <el-dropdown-item>删除</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <span>王小虎</span>
                </el-header>

                <el-main>
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    export default {
        name: "Main",
        data() {
            const item = {
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄'
            };
            return {
                tableData: Array(20).fill(item)
            }
        }
    }
</script>

<style scoped>
    .el-header {
        background-color: #B3C0D1;
        color: #333;
        line-height: 60px;
    }

    .el-aside {
        color: #333;
    }
</style>
```

在需要做路由替换的部分使用 `<router-view/>` 进行替换。

使用 `<router-link to="/user/add">新增用户</router-link>` 进行路由的跳转链接设置。

因为这里添加了子路由，所以需要修改路由的配置文件：

```javascript
import Vue from 'vue'
import Router from 'vue-router'

import Main from '../views/Main'
import Login from '../views/Login'
import UserAdd from '../views/user/Add'
import UserList from '../views/user/List'

Vue.use(Router);

export default new Router({
    routes: [
        {
            name: 'Login',
            path: '/login',
            component: Login
        },
        {
            name: 'Main',
            path: '/main',
            component: Main,
            children: [
                {name: 'UserAdd', path: '/user/add', component: UserAdd},
                {name: 'UserList', path: '/user/list', component: UserList},
            ]
        },
    ]
});
```
所以需要在 `views` 目录下创建 `user` 子目录，里面创建 `Add.vue` 和 `List.vue`，这里导入的时候起了别名。

## 四、其它设置

### 1、参数传递

#### (1)使用路径匹配方式传参

```javascript
                {name: 'UserAdd', path: '/user/add/:id', component: UserAdd},
```

其中使用 `path: '/user/add/:id'` 进行参数传递，参数名为 `id`

在页面中使用 `<router-link to="/user/add/1">新增用户</router-link>` 进行赋值。

接受参数的页面：

```vue
<template>
    <div>
        新增用户
        {{$route.params.id}}
    </div>
</template>

<script>
    export default {
        name: "Add"
    }
</script>

<style scoped>

</style>
```

使用 `{{$route.params.id}}` 接受参数

#### (2) 使用 props 传参

在接收参数的页面定义参数：

```vue
<template>
    <div>
        用户列表
        {{id}}
    </div>
</template>

<script>
    export default {
        name: "List",
        props: ['id']
    }
</script>

<style scoped>

</style>
```

使用 `props: ['id']` 定义，可以定义多个。

在路由配置文件配置：

```javascript
                {name: 'UserList', path: '/user/list/:id', component: UserList, props: true},
```

在页面上还是使用 `<router-link to="/user/list/2">用户列表</router-link>` 就可以参数传递了

### 1、重定向

在路由配置文件中添加如下：

```javascript
        {
            path: '/home',
            redirect: '/main'
        }
```

当路径为 `/home` 时，会重定向到 `main`

### 2、路由模式

默认的路由模式是“哈希模式”，即在浏览器地址中带有 `#`。

在路由配置文件新增配置：

```javascript
    mode: 'history',
```

就可以修改路由模式为 `history` 模式，去掉了 `#`。但是不建议使用 `history` 模式。

### 3、404页面

在 `views` 目录中新创建一个 `404.vue` 页面：

```vue
<template>
    <div>
        页面不存在
    </div>
</template>

<script>
    export default {
        name: "404"
    }
</script>

<style scoped>

</style>
```

然后在路由配置中进行配置：

```javascript
        {
            path: '*',
            component: NotFound
        }
```

注意这个配置要写在 `routes` 数组的最后一位，因为当所有的匹配都不符合时，才会进到这个路由。

## 五、路有钩子与异步请求

安装 `axios`：`npm install axios -s -registry=https://registry.npm.taobao.org`

在 `main.js` 中引入：
```javascript
import axios from 'axios'

Vue.prototype.axios = axios;
```

在 `static` 目录下创建 `json` 文件：

```json
 {
    "name": "jerry",
    "age": 31,
    "gender": "M"
}
```

然后在需要调用接口的页面这样子写：

```vue
    export default {
        name: "List",
        props: ['id'],
        c(to, from, next) {
            next(vm => {
                vm.getData();
            });
        },
        beforeRouteLeave(to, from, next) {
            next();
        },
        methods: {
            getData() {
                this.axios({
                    type: 'get',
                    url: 'http://localhost:8080/static/data.json'
                }).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    }
```
`beforeRouteEnter()` 这个方法是页面路由进入前执行的方法，这里调用了 `next()` ，将方法传递下去，然后调用了 `vm` 实例的 `getData()` 方法，也就是下面定义的方法，进行了异步请求。

## 六、vuex状态管理

安装依赖：`cnpm install vuex --save`

`main.js` 中引入：
```javascript
import Vuex from 'vuex'
Vue.use(Vuex);
```

在登录成功的地方使用 `sessionStorage` 保存会话信息

```vue
                        sessionStorage.setItem('isLogin', 'true');
```

在页面需要进行注销的地方使用 `<router-link to="/logout">注销</router-link>` 完成注销。

在 `main.js` 中添加钩子函数：

```javascript
router.beforeEach((to, from, next) => {
    let isLogin = sessionStorage.getItem('isLogin');
    if (to.path == '/logout') {
        sessionStorage.clear();
        next({path: '/login'});
        return;
    } else if (to.path == '/login') {
        if (isLogin == 'true') {
            next({path: '/main'});
            return;
        }
    } else if (isLogin == null) {
        next({path: '/login'});
        return;
    }
    next();
});
```

这里注意如果路由是哈希模式的情况下，需要在 `next({path: ''})` 之后写 `return` 才可以达到效果，`history` 模式则不需要写 `return`。

这个 `beforeEach()` 方法是在进入路由的时候都会执行的方法，全局有效。

通过获取 `sessionStorage` 中是否存储 `isLogin` 的 `key` 来判断是否登录，并且如果路由到的地址是 `/logout` 的时候清空 `sessionStorage` 并跳转到登录页。

接着在 `src` 目录下创建 `store` 目录，创建 `index.js`：

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

// 状态
const state = {
    user: {
        username: ''
    }
};

// 获取状态中的值，是计算属性
const getters = {
    getUser(state) {
        return state.user;
    }
};

// 更新 state 的状态（同步）
const mutations = {
    updateUser(state, user) {
        state.user = user;
    }
};

// 调用 mutations 更新 state（异步）
const actions = {
    updateUserAsync(context, user) {
        context.commit('updateUser', user);
    }
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
});
```

这里面有 `vuex` 非常重要的4个值：

* state

用来保存状态的对象

* getters

获取状态中的值，是计算属性

* mutations

更新 `state` 的状态（同步）

* actions

调用 `mutations` 更新 `state`（异步）

在 `main.js` 中引入 `store`

```javascript
import store from './store'

new Vue({
    el: '#app',
    components: {App},
    template: '<App/>',
    router,
    store,
    render: h => h(App)
});
```

此时需要在原来登录成功的地方加上：

```vue
                        this.$store.dispatch('updateUserAsync', this.form);
```

这里使用 `this.$store.dispatch` 调用的是 `store` 的 `actions`，异步调用 `updateUserAsync()` 方法来更新信息。

在页面上需要显示的地方，这样显示：
```html
                    <span>{{this.$store.getters.getUser.username}}</span>
```

这里调用的是 `store` 的 `getters` 里面的 `getUser()` 方法。

此时刷新页面仍然会导致 `vuex` 重置，信息就没了。

此时需要在刷新之前将 `vuex` 保存的内容存储到 `session` 中，在刷新完毕后，将信息取出来重新放回到 `vuex`。

在 `App.vue` 中添加钩子函数，捕获刷新事件：

```vue
    export default {
        name: 'App',
        mounted() {
            window.addEventListener('unload', this.saveState);
        },
        methods: {
            saveState() {
                sessionStorage.setItem('state', JSON.stringify(this.$store.state));
            }
        }
    }
```

修改 `store` 中的配置文件：

```javascript
const state = sessionStorage.getItem('state') ? JSON.parse(sessionStorage.getItem('state')) : {
    user: {
        username: ''
    }
};
```

此时先从 `session` 中读取信息，如果没有再初始化。

由于 `store` 中以后会存很多数据，所以这里创建 `user` 目录，里面新建 `index.js` 文件，将所有和用户相关的信息都放在这里：

```javascript
const User = {
    state: sessionStorage.getItem('state') ? JSON.parse(sessionStorage.getItem('state')) : {
        user: {
            username: ''
        }
    },

    getters: {
        getUser(state) {
            return state.user;
        }
    },

    mutations: {
        updateUser(state, user) {
            state.user = user;
        }
    },

    actions: {
        updateUserAsync(context, user) {
            context.commit('updateUser', user);
        }
    }
}

export default User;
```

总的 `store` 配置文件修改为：

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import User from './user'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        User
    }
});
```

`App.vue` 中的保存信息的需要调整为：

```javascript
                sessionStorage.setItem('state', JSON.stringify(this.$store.state.User));
```

<Valine></Valine>
