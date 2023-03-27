# ee-vuex

更**简单**更**方便**的全局状态管理器

## 介绍
ee-vuex是vue项目中的全局状态管理器。

#### 1. 使用场景
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

#### 2. 方案和对比
vue项目中一般使用vuex和pinia来管理全局状态，请先通过下面表格看一下vuex的核心概念和ee-vuex的对比。vuex可以参考其官方文档 https://vuex.vuejs.org/zh/

||vuex|ee-vuex(computed形式)|
|-|-|-|
state|- **定义**<br>state:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;value,<br>}<br>-&nbsp;**调用**<br>\\$store.state.key|- **定义**<br>key:&nbsp;value<br>-&nbsp;**调用**<br>\\$store.key|
getters|- **定义**<br>getters:&nbsp;{<br>&nbsp;&nbsp;key(state)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;state.key<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.getters.key|- **定义**<br>key()&nbsp;{}<br>-&nbsp;**调用**<br>\\$store.key|
mutations|- **定义**<br>mutations:&nbsp;{<br>&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value&nbsp;*&nbsp;2<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.commit("key",&nbsp;value)|- **定义**<br>key(value)&nbsp;{&nbsp;<br>&nbsp;&nbsp;return&nbsp;value&nbsp;*&nbsp;2&nbsp;<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
actions|- **定义**<br>actions:&nbsp;{<br>&nbsp;&nbsp;async&nbsp;key({commit},&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(),&nbsp;1000)<br>&nbsp;&nbsp;&nbsp;&nbsp;})<br>&nbsp;&nbsp;&nbsp;&nbsp;commit("key",&nbsp;value)<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.dispatch("key",&nbsp;value)|- **定义**<br>async&nbsp;key(value)&nbsp;{<br>&nbsp;&nbsp;return&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(value)<br>&nbsp;&nbsp;&nbsp;&nbsp;,&nbsp;1000)<br>&nbsp;&nbsp;})<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
module|- **定义**<br>const&nbsp;a&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'a'&nbsp;}<br>}<br>const&nbsp;b&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'b'&nbsp;}<br>}<br>createStore({<br>&nbsp;&nbsp;modules:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;a:&nbsp;moduleA,<br>&nbsp;&nbsp;&nbsp;&nbsp;b:&nbsp;moduleB<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br>\\$store.state.a.key<br>\\$store.state.b.key|- **定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'a'<br>},&nbsp;'\\$a')<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'b'<br>},&nbsp;'\\$b')<br>-&nbsp;**调用**<br>\\$a.key<br>\\$b.key|
v-model|- **定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;undefined&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="key"&nbsp;/><br></template><br>...<br>computed:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;get&nbsp;()&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;this.\\$store.state.key<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;set&nbsp;(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.\\$store.commit('key',&nbsp;value)<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}<br>|- **定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;undefined<br>},&nbsp;'\\$store')<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="\\$store.key"&nbsp;/><br></template><br>...|
localStorage|- **定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;key:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key'))<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})|- **定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;default:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key')),<br>&nbsp;&nbsp;&nbsp;&nbsp;set(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>或者简写成下面两种方式<br>createStore({&nbsp;key:&nbsp;localStorage&nbsp;})<br>createStore({&nbsp;key:&nbsp;{&nbsp;p:&nbsp;true,&nbsp;}&nbsp;})|

#### 3. ee-vuex的优势
无论是vuex，pinia，定义一个全局状态的核心都是
1. state：相当于Vue组件的data
2. getters：相当于Vue组件的computed的get
3. mutations(vuex) actions(pinia)：相当于Vue组件的computed的set或一个method，主要用于对state进行赋值

ee-vuex则没有区分这些，ee-vuex使用的Vue组件computed的形式来定义和调用状态

这意味着ee-vuex有以下的**优势**：
- 定义更**清晰简洁**：一个状态就是一个对象，而不用分别定义到state和getters等多个对象里
- 使用更**简单方便**：不需要commit，dispatch等多余的方法，直接调用和赋值状态即可
- **v-model**：可以将全局状态直接用于v-model
- **缓存**：属性值不变时可以利用computed的缓存提高get效率

不仅这样，ee-vuex还有更多方便和强大的地方，请详细看[定义核心](#定义核心)


## 安装教程

```
npm install ee-vuex
```

## 使用说明

### 1. 创建仓库
全局仓库：整个项目可调用
```
import { createApp } from 'vue'
import { createStore } from 'ee-vuex'

const vue = createApp({ /* 组件 */ });

vue.use(createStore({
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
},
// 仓库的名字
"$store"))

// 引用多个仓库
vue.use(createStore({}), "$store2")
vue.use(createStore({}), "$store3")
```

局部仓库：单个组件可调用，局部仓库可以用来代替组件的data和computed，不过不建议这么使用
```
// file test.vue
<template></template>

<script type="text/javascript">
import { createStore } from 'ee-vuex'
export default {
  name: "test",
  data() {
    return {
      // 此时store就像仓库名
      store: createStore({
        // 定义你的仓库
      })
    }
  },
}
</script>

<style></style>
```

#### 1.1 仓库对象
定义一个状态主要包含4个核心内容
- 是否持久化
- 默认值
- get函数
- set函数

这4个核心内容都有默认的操作，你仅需要改写时1个内容时都有更简便的定义方式。
具体参考[定义核心](#定义核心)

#### 1.2 仓库名
默认没有仓库名，全局仓库你应该给它起个名字。

对于命名的仓库可以用以下方式全局获得其实例
- JS引入仓库：import { \\$store1, \\$store2, \\$store3 } from 'ee-vuex'
- 组件内调用仓库：this.\\$store1 || this.\\$store2 || this.\\$store3

createStore可以创建多个不同命名的仓库，同名仓库只有最先创建的可以拥有上面第一种全局引用方式。

创建多个命名仓库时，也可以通过下面方式一次性导入这些仓库
```
import { createApp } from 'vue'
// 直接导入ee-vuex默认返回的对象
import stores from 'ee-vuex'
createApp({}).use(stores);
```


### 2. 在组件或js中使用全局状态
#### 2.1 调用仓库
对于非命名仓库，需要自己保存仓库实例。

对于命名仓库，可以通过以下方式获取其实例

2.1 JS引入仓库实例
```
import { $store1, $store2, $store3 } from 'ee-vuex'
```

2.2 组件内获得仓库实例(需要提前vue.use，参考[创建仓库](#1.1 创建仓库)和[仓库名](#1.2 仓库名))
```
// file test.vue
<template>
  <div>{{ $store1 }}</div>
  <div>{{ $store2 }}</div>
  <div>{{ $store3 }}</div>
</template>

<script type="text/javascript">
import { createStore } from 'ee-vuex'
export default {
  name: "test",
  mounted() {
    this.$store1 || this.$store2 || this.$store3
  }
}
</script>
```

#### 2.2 调用仓库状态
调用仓库的状态就像调用一个computed的属性
1. 模板 get
```
<div>{{ $store.state1 }}</div>
```
2. JS get
```
mounted() {
  const state1 = this.$store.state1;
}
```
3. 模板 set
```
<input type="text" v-model="$store.state1" />
```
4. JS set
```
mounted() {
  this.$store.state1 = "text value";
}
```


## 定义核心
#### 1. 是否持久化
#### 2. 默认值
#### 3. get函数
#### 4. set函数

## 更多实战

#### 登录

1. 用户登录之后拥有了token，token需要持久化，token的get需要增加'bearer '前缀
2. 首次调用user时用token从后台接口获取用户信息
3. 用户登出后将清空token和user

- vuex

```
import { createStore } from 'vuex'

const store = createStore({
  state: {
    // 还原持久化的token作为默认值
    token: localStorage.getItem('token'),
    user: undefined,
  },
  getters:{
    token(state) {
      return 'bearer ' + state.token;
    },
    user(state) {
      if (!state.user && state.token) {
        // 通过后台api获取用户信息，这里使用setTimeout代替
        // 问题1. 如果模板有多处引用了getters.user，在异步请求结束获得user前，会多次触发异步请求
        setTimeout(() => {
          // 问题2. getters中无法使用this指向仓库当前实例
          store.commit('setUser', { name: '登录的用户' })
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
```

代码里标出了**vuex的问题**

1. get下异步获取数据并set，多次get时会多次异步获取数据造成性能损失
2. get下需要对其它状态进行set时，作用域没有this调用不方便
3. set相同的值也会执行set，来回set会造成死循环
4. 一个状态要定义3遍(state, getters, mutations)，代码不简洁

- ee-vuex

```
import { createStore } from 'ee-vuex'

export default createStore({
  token: {
    p: true,
    get(value) {
      return 'bearer ' + value;
    },
    set(value) {
      // 清除token，也把user信息一并清除
      if (!value)
        this.user = undefined;
    }
  },
  user: {
    get(value) {
      if (!value) {
        // 通过后台api获取用户信息，这里使用setTimeout代替
        // 对比1. 如果模板有多处引用了user，也仅会触发一次异步请求
        // 因为user值并没有改变，computed的特性会返回user的缓存值
        setTimeout(() => {
          // 对比2. get中也可以使用this指向仓库当前实例
          this.user = { name: '登录的用户' };
        }, 5000)
      }
    },
    set(value) {
      if (!value) {
        // 对比3. 无论清空token或user，都应该将另一个状态一并清空，互相清空也不会导致死循环
        // 因为set一样的值，不会触发set方法，类似于Vue组件的watch
        if (!user)
          this.commit('setToken', undefined);
        // 让api获取到用户信息之前返回空对象以防止空引用
        return {};
      }
    }
  },
})
```

代码里标出了**ee-vuex的对比**

1. get下异步获取数据并set，多次get时会返回缓存提高行能
2. get下需要对其它状态进行set时，作用域可以用this指向自身
3. set相同的值不会执行set，来回set也不会造成死循环
4. 一个状态仅定义一个对象，代码简洁