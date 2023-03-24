# ee-vuex

更**简单**更**方便**的全局状态管理器

## 介绍
ee-vuex是vue项目中的全局状态管理器。

#### 使用场景
全局数据一般用于：
1. 跨组件共享数据
  - 登录的用户信息
  - 用户设置
  - 语言偏好
2. 需要在组件之间传递数据
  - 搜索条件
  - 加载状态
3. 缓存枚举的数据
  - 省市级联
  - 支持的语言

#### 方案和对比
vue项目中一般使用vuex和pinia来管理全局状态，请先通过下面表格看一下vuex的核心概念和ee-vuex的对比。vuex可以参考其官方文档 https://vuex.vuejs.org/zh/

||vuex|ee-vuex(computed形式)|
|-|-|-|
state|**定义**<br>state:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;value,<br>}<br>-&nbsp;**调用**<br>\\$store.state.key|**定义**<br>key:&nbsp;value<br>-&nbsp;**调用**<br>\\$store.key|
getters|**定义**<br>getters:&nbsp;{<br>&nbsp;&nbsp;key(state)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;state.key<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.getters.key|**定义**<br>key()&nbsp;{}<br>-&nbsp;**调用**<br>\\$store.key|
mutations|**定义**<br>mutations:&nbsp;{<br>&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value&nbsp;*&nbsp;2<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.commit("key",&nbsp;value)|**定义**<br>key(value)&nbsp;{&nbsp;<br>&nbsp;&nbsp;return&nbsp;value&nbsp;*&nbsp;2&nbsp;<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
actions|**定义**<br>actions:&nbsp;{<br>&nbsp;&nbsp;async&nbsp;key({commit},&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(),&nbsp;1000)<br>&nbsp;&nbsp;&nbsp;&nbsp;})<br>&nbsp;&nbsp;&nbsp;&nbsp;commit("key",&nbsp;value)<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.dispatch("key",&nbsp;value)|**定义**<br>async&nbsp;key(value)&nbsp;{<br>&nbsp;&nbsp;return&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(value)<br>&nbsp;&nbsp;&nbsp;&nbsp;,&nbsp;1000)<br>&nbsp;&nbsp;})<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
module|**定义**<br>const&nbsp;a&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'a'&nbsp;}<br>}<br>const&nbsp;b&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'b'&nbsp;}<br>}<br>createStore({<br>&nbsp;&nbsp;modules:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;a:&nbsp;moduleA,<br>&nbsp;&nbsp;&nbsp;&nbsp;b:&nbsp;moduleB<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br>\\$store.state.a.key<br>\\$store.state.b.key|**定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'a'<br>},&nbsp;'\\$a')<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'b'<br>},&nbsp;'\\$b')<br>-&nbsp;**调用**<br>\\$a.key<br>\\$b.key|
v-model|**定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;undefined&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="key"&nbsp;/><br></template><br>...<br>computed:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;get&nbsp;()&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;this.\\$store.state.key<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;set&nbsp;(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.\\$store.commit('key',&nbsp;value)<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}<br>|**定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;undefined<br>},&nbsp;'\\$store')<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="\\$store.key"&nbsp;/><br></template><br>...|
localStorage|**定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;key:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key'))<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})|**定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;default:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key')),<br>&nbsp;&nbsp;&nbsp;&nbsp;set(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>或者简写成下面两种方式<br>createStore({&nbsp;key:&nbsp;localStorage&nbsp;})<br>createStore({&nbsp;key:&nbsp;{&nbsp;p:&nbsp;true,&nbsp;}&nbsp;})|

从对比可以看出，ee-vuex使用类似vue组件computed的定义和调用方式，代码更简洁，使用更方便。
更多对比，可参照ee-vuex实战

#### ee-vuex的优势
无论是vuex，pinia，定义和使用一个全局状态的核心无非是state，get，set。
对于vue3而言，一个全局状态相当于是一个ref + computed的组合。

试想用ref + computed来实现一个全局状态，代码大致如下
```
import { ref, computed } from 'vue';

const state = ref();

export const key = computed({
  get: () => state.value,
  set: (value) => state.value = value,
})
```
可以看出state被隐藏，你只需要关注computed属性即可。

这意味着这样两个优势：
1. 你可以将这个全局状态直接用于v-model
2. 属性值不变时可以利用computed的缓存提高效率

在这段简短的代码中，还包含如下可以操作的空间
1. ref()可以设定默认值
2. get和set方法可以按照我们的需要定制

**ee-vuex**的优势，就在于将默认值和get set做了扩展


vue项目的全局状态，可以使用以下几种方法，他们都有各自的特点
|                             | JS对象 | 持久化 | 默认值 | 响应式 | get                          | set                                                      |
|-----------------------------|------|-----|-----|-----|------------------------------|----------------------------------------------------------|
| localStorage                | -    | ✔   | -   | -   | localStorage.getItem('key')  | localStorage.setItem('key', value)                       |
| vue.config.globalProperties | ✔    | -   | ✔   | -   | this.key                     | -                          |
| import                      | ✔    | -   | ✔   | ✔   | import { key } from 'global' | -                          |
| vuex                        | ✔    | -   | ✔   | ✔   | this.$store.state.key        | this.$store.commit('key', value)                         |

不同的方式，具备不同的特点，各自都有优缺点，对此总结了以下优点应该是我们想要的
1. 声明，get，set都为JS对象，可以设定默认值
2. 需要的时候，我希望某些状态是可持久化的
3. 响应式，状态改变时，页面必须重新渲染
4. 可以import，组件内可以直接this调用不用重复import，调用更灵活简便

#### 来看下vuex的代码

我们提出以下需求

1. 用户登录之后拥有了token，token需要持久化
2. 用token可以从后台接口获取用户信息user
3. 用户登出后将清空token和user

```
import { createStore } from 'vuex'

const store = createStore({
  state: {
    // 还原持久化的token作为默认值
    token: localStorage.getItem('token'),
    user: undefined,
  },
  getters:{
    user(state) {
      if (!state.user && state.token) {
        // 通过后台api获取用户信息，这里使用setTimeout代替
        // 问题1. 如果模板有多处引用了getters.user，在异步请求结束获得user前，会多次触发异步请求
        setTimeout(() => {
          // 问题2. getters中this无法指向store当前实例，下面代码将报错
          this.commit('setUser')
        }, 5000)
      }
      // 让api获取到用户信息之前返回空对象以防止空引用
      return state.user || {};
    },
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      if (token) {
        // 将token持久化
        localStorage.setItem('token', token)
      } else {
        // 清除token，也把user信息一并清除
        localStorage.removeItem('token');
        // mutations中this可以指向store当前实例
        this.commit('setUser', undefined);
      }
    },
    setUser(state, user){
      state.user = user;
      // 问题3. 无论清空token或user，都应该将另一个状态一并清空，但是互相清空会导致死循环
      if (!user)
        this.commit('setToken', undefined);
    },
  },
})

export default store;

// 组件：引用用户数据
<div>{{ $store.getters.user.name }}</div>
// js：登录获取token
this.$store.commit("setToken", token)
// 问题4：user被定义了3遍(state, getters, mutations)，get和set调用代码不一致
```

也可以看到代码里标出了vuex存在的**3个问题**

1. get下异步获取数据并set，多次get时会多次异步获取数据造成性能损失
2. get下需要对其它状态进行set时，作用域没有this调用不方便
3. set相同的值也会执行set，来回set会造成死循环
4. 一个状态要定义3遍(state, getters, mutations)，代码不简洁

再来看看ee-vuex
```
import { createStore } from 'ee-vuex'

export default createStore({
  user: {
    default: [
      // 首个默认值从localStorage获取
      () => {
        const ls = localStorage.getItem('user');
        if (ls)
          return JSON.parse(ls);
        // 没有值则为空对象
        return {};
      }, 
      // 首次调用user时发送请求异步登录(请求返回Promise，resolve登录的用户信息)
      () => api.login()
    ],
    get() {
      console.log("get user", this.user)
    },
    set(value) {
      console.log("set user", value)
      if (value) {
        // 登录
        localStorage.setItem('user', JSON.stringify(value))
      } else {
        // 登出
        localStorage.removeItem('user')
        // 不让user为undefined而是空对象以防止空引用异常
        return {};
      }
    }
  },
  token() {
    return 'bearer ' + this.user.token;
  }
})

// 组件：引用用户数据
<div>{{ $store.user.name }}</div>
// js：登出用户
this.$store.user = undefined;
```


## 特技

1.  定义更**清晰简便**
2.  功能更**强大完善**
3.  调用更**简单方便**

一个状态完整定义如下
```
import { createStore } from 'ee-vuex'

export default createStore({
  // 完整定义对象
  state1: {
    p: true,
    default: undefined,
    get(value) {},
    set(value) {},
  },
  // 仅定义默认值
  state2: undefined,
  // 仅定义get
  state3() {},
  // 仅定义set
  state4(value) {},
  // 仅应用localStorage持久化(相当于{ p: true })
  state5: localStorage,
})
```

定义的内容主要包含4个核心内容
- 是否持久化
- 默认值
- get函数
- set函数
这4个核心内容都有默认的操作，你仅需要改写时1个内容时都有更简便的定义方式。

## 安装教程

```
npm install ee-vuex
```

## 使用说明

1. 创建全局仓库
```
import { createStore } from 'ee-vuex'

vue.use(createStore({
}))
```
2. 在组件或js中使用全局状态



