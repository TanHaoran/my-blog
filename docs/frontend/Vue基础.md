# Vue基础

<Counter :path="'frontend'" :name="'Vue基础'"></Counter>

## 一、第一个Vue应用

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    {{message}}
</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            message: "hello vue"
        }
    });
</script>
</body>
</html>
```

直接在浏览器运行就可以看效果，并且开启控制台，使用命令：`vm.message = 'hi vue'` 还可以修改正在显示的文字。

## 二、vue实例的生命周期

## 三、基础语法

### 1、if else 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <h1 v-if="ok">YES</h1>
    <h1 v-else="no">NO</h1>


    <h1 v-if="type == 'A'">A</h1>
    <h1 v-else-if="type == 'B'">B</h1>
    <h1 v-else>其它</h1>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            ok: true,
            type: 'C'
        }
    });
</script>

</body>
</html>
```

### 2、for

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <ul>
        <li v-for="item in items">
            {{item.message}}
        </li>
    </ul>

</div>


<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            items: [
                {message: '元素1'},
                {message: '元素2'},
                {message: '元素3'},
            ]
        }
    })
</script>

</body>
</html>
```

### 3、事件处理
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <button v-on:click="sayHi()">提交</button>
</div>


<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            message: 'hello vue'
        },
        methods: {
            sayHi() {
                alert(this.message);
            }
        }
    })
</script>

</body>
</html>
```

## 四、Javascript 中的面向对象

写这样子一个工具类：
```javascript
var Util = function () {

    var username;

    var setUsername = function (username) {
        this.username = username;
    };

    var getUsername = function () {
        return this.username;
    };

    return {
        setUsername: function (username) {
            setUsername(username);
        },

        getUsername: function () {
            return getUsername();
        }
    }

}();
```
其中使用 `var` 定义的实际上可以看成是这个工具里的私有成员变量，通过 `return` 暴露出去，外部引用后才可以访问。使用如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <button v-on:click="sayHi()">测试</button>
</div>


<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="util.js"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        methods: {
            sayHi() {
                Util.setUsername("jerry");
                alert(Util.getUsername());
            }
        }
    });
</script>

</body>
</html>
```

## 五、axios

为了测试发送请求，这里使用的是本地 `json` ，所以需要在当前目录创建一个 `data.json` 文件：

```json
{
  "name": "jerry",
  "age": 31,
  "gender": "M",
  "url": "https://tanhaoran.github.io/my-blog"
}
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <ul>
        <li>姓名：{{info.name}}</li>
        <li>年龄：{{info.age}}</li>
        <li>性别：{{info.gender}}</li>
        <li><a v-bind:href="info.url">{{info.url}}</a></li>
    </ul>

</div>


<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data() {
            return {
                info: {
                    name: '',
                    age: 0,
                    gender: '',
                    url: ''
                }
            }
        },
        mounted() {
            axios.get('data.json').then(response => this.info = response.data);
        }
    });
</script>

</body>
</html>
```

实际使用当中只需要将 `axios.get()` 里面的参数换成实际的接口地址就可以了，例如：
```javascript
            axios.get('http://localhost:8080/getInfo').then(response => this.info = response.data);
```

## 六、表单和双向绑定

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <input type="text" v-model="message"/> 单行文本：{{message}}
</div>


<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
            el: '#app',
            data: {
                message: 'hello vue'
            }
        }
    )
</script>

</body>
</html>
```

修改文本框的内容，文本显示区域也会跟着改变，因为使用了 `v-model` 进行了双向数据绑定。

## 七、组件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <ul>
        <my-li v-for="name in names" v-bind:name="name"></my-li>
    </ul>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    Vue.component('my-li', {
        props: ['name'],
        template: '<li style="color: red;">{{name}}</li>'
    });

    var vm = new Vue({
        el: '#app',
        data: {
            names: ['元素1', '元素2', '元素3']
        }
    });
</script>

</body>
</html>
```

## 八、计算属性

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <div>获取当前的时间的方法：{{getCurrentTime1()}}</div>
    <div>获取当前的时间的属性：{{getCurrentTime2}}</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        methods: {
            getCurrentTime1() {
                return Date.now();
            }
        },
        computed: {
            getCurrentTime2() {
                return Date.now();
            }
        }
    });
</script>

</body>
</html>
```

定义在 `methods` 里面的是普通方法，在这里例子中每次调用都会重新计算，比较浪费性能；定义在 `computed` 中的是计算属性，这里的值计算一次后会存在内存中，所以每次计算的都是同一个值，节省性能。

通过控制台输入 `vm.getCurrentTime1()` 可以看出每次计算的时间都是不同的值，而 `vm.getCurrentTime2` 计算的结果总是第一次计算的结果。

## 九、内容分发与自定义事件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<div id="app">
    <todo>
        <todo-title slot="todo-title" v-bind:title="title"></todo-title>
        <todo-item slot="todo-items" v-for="(item, index) in items" v-bind:item="item" v-bind:index="index"
                   @remove="removeItem(index)"></todo-item>
    </todo>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>

<script type="text/javascript">
    Vue.component('todo', {
        template: '<div>\
                       <slot name="todo-title"></slot>\
                       <ul>\
                           <slot name="todo-items"></slot>\
                       </ul>\
                   </div>\
        '
    });

    Vue.component('todo-title', {
        props: ['title'],
        template: '<h1>{{title}}</h1>'
    });

    Vue.component('todo-item', {
        props: ['item', 'index'],
        template: '<li>{{index}}. {{item}}<button @click="remove(index)">删除</button></li>',
        methods: {
            remove(index) {
                this.$emit('remove', index);
            }
        }
    });

    var vm = new Vue({
        el: '#app',
        data: {
            title: '标题1',
            items: ['条目1', '条目2', '条目3', '条目4', '条目5']
        },
        methods: {
            removeItem(index) {
                // 从数组的第 index 开始，删除1个
                this.items.splice(index, 1);
            }
        }
    });
</script>

</body>
</html>
```

* 外部组件向内部组件传递值的方法

假设有全局 `data` 的值 `name: 'jerry'`，首先在内部组件中定义 `props` 属性 `title`，然后在使用内部组件的 `html` 代码中使用 `v-bind:title="name"` 就实现了外传内。

* 内部组件向外部组件传递值的方法

首先在使用内部组件的 `html` 处定义自定义事件 `@remove="removeItem(index)"` ，其中 `remove` 是我们自定义的方法名称，`removeItem(index)` 这个是定义在外部组件的方法，也就是说通过自定义事件 `remove` 调用了外部组件的 `removeItem(index)` 方法实现了通信，那么如何出发内部组件呢？在内部组件中的一个点击事件中执行了这样子的代码 `this.$emit('remove', index);` 其中`remove` 就是我们自定义的事件，`index` 是传给自定义事件的值，也是是最终传递给外部组件方法 `removeItem(index)` 中的 `index`，从而实现了内传外。

删除事件的 `@click="remove(index)` 等同于 `v-on:click="remove(index)`

在 `<todo-item>` 中的自定义事件的 `@remove="removeItem(index)` 等同于 `v-on:remove="removeItem(index)`

<Valine></Valine>