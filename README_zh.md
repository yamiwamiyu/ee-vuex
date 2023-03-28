# ee-vuex

更**简单**更**方便**的全局状态管理器

## 介绍
ee-vuex是vue项目中的全局状态管理器。

### 1. 使用场景
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

### 2. 方案和对比
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

### 3. ee-vuex的优势
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

### 1.1 定义仓库状态
定义一个状态主要包含4个核心内容
- 默认值
- 是否持久化
- get函数
- set函数

具体参考[定义核心](#定义核心)

### 1.2 仓库名
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
### 2.1 调用仓库
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

### 2.2 调用仓库状态
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

在ee-vuex的仓库定义中，一个状态就是一个对象，这个对象包含下面4个字段。

且当你仅想自定义其中一个字段，还会有相应的**简洁定义**方法。

后面的代码都卸载创建仓库里面，创建仓库参考[定义仓库状态](#1.1 定义仓库状态)
```
import { createStore } from 'ee-vuex'
createStore({
  // 后面的示例代码都应该是写在这个对象里的
})
```

### 1. 默认值
状态的默认值对于异步[缓存枚举的数据](#使用场景)是非常有用的。

例如我们的页面支持多种语言，语言的种类需要通过api异步从后端获取，数据是一个语言对象数组。

在异步获取到数据前我们希望状态的值是一个空数组，以便页面可以直接用于循环而不用繁琐的v-if判断。

上述的例子，对于默认值需要具备以下几个特点：
- 默认值为空数组，方便Vue模板**直接v-for**而不用总是使用v-if担心异步数据还没回来
- **读取状态时**，再通过api异步获取**一次**数据，以节省行能和内存

ee-vuex的默认值，就是在**首次get**某个状态时才触发**一次**默认值的操作。

默认值**支持数组**，数组元素**支持异步**，可以对多个仅需要触发一次的操作进行**队列操作**。

<hr>

- 普通定义：字段default
```
key: {
  default: undefined,
}
```

- 简洁定义：直接写值
```
key: undefined
```

默认值支持非常多的类型，下面示例代码一一进行举例
- 普通值：直接赋值即可
```
key: 1
key: true
key: "ee-vuex"
key: new Date()
```

- Function：可以用方法返回默认值，可以支持异步方法和Promise。注意请使用箭头函数，否则会被认为是[get](#get函数)或[set](#set函数)。
```
// 直接返回值：ee-vuex
key: () => "ee-vuex"
// 异步Promise返回值：2秒前undefined，2秒后ee-vuex
key: () => new Promise(resolve => {
  setTimeout(() => {
    resolve("ee-vuex")
  }, 2000)
})
// async方法异步返回值：2秒前undefined，2秒后10000
key: async () => {
  // 异步获取值
  const value = await new Promise(
    resolve => {
      setTimeout(() => {
        resolve(100)
      }, 2000)
    })
  // 可以对值进行自定义操作
  return value * value;
}
// NG：会被认为是get定义，默认值undefined
key: function() { return 5 }
```

- Object：使用简单定义时需要和状态定义的Object区分，不能包含p，default，get，set的任意一个
```
// OK：默认值为对象
key: {
  name: 'ee-vuex',
  isCool: true,
}
// NG：默认值为true
key: {
  name: 'ee-vuex',
  // 包含了default
  default: true,
}
// 非要包含p，default，get，set字段的对象时，可以使用Function，或者不使用简洁定义
// OK：使用Function返回值，默认值为对象
key: () => {
  name: 'ee-vuex',
  default: true,
}
// OK：使用普通定义，默认值为对象
key: {
  default: {
    name: 'ee-vuex',
    default: true,
  }
}
```

- 多默认值：使用数组，数组里的元素支持上面所有类型，有异步时从前往后队列赋值
```
// 2秒前[]，2秒后[1,2,3]，再2秒后[4,5,6]
key: [[], 
  () => new Promise(resolve => {
    setTimeout(() => {
      resolve([1, 2, 3])
    }, 2000)),
  () => new Promise(resolve => {
    setTimeout(() => {
      resolve([4, 5, 6])
    }, 2000)),
]
// 注意想要默认值是数组时，要嵌套数组或使用Function，不论是普通定义还是简洁定义
// NG：默认值为3
key: [1, 2, 3]
// OK：多默认值，采用第一个默认值，默认值[]
key: [[]]
// OK：Function返回值[]
key: () => []
```


### 2. 是否持久化
仓库状态的值是保存在内存里的，当我们刷新页面时，状态的值就会被清空了。

持久化就是当我们希望刷新页面，状态的值仍然保留原本的值。可用于例如登录的token。

一般我们会把仓库的状态保存到localStorage中，初始化时读出来，set时写进去。

持久化对于仓库来说是个很常用的功能，所以ee-vuex增加了简单的配置来协助实现而不用自己重复实现持久化。

使用持久化需要注意：
- 优先读取localStorage的值，有值则会忽略[默认值(default)](#默认值)
- 保存的key就是状态的名字，暂时不支持修改，注意和你项目其它localStorage的内容不要重名

<hr>

- 普通定义：字段p。p为Persistent的首字母缩写，用缩写是因为这个单词太难记了
```
token: { p: 1 }
```

- 简洁定义：直接赋值localStorage
```
token: localStorage
```

- 自定义实现：
```
token: {
  default: () => JSON.parse(localStorage.getItem('token')),
  set(value) {
    if (value)
      localStorage.setItem('token', JSON.stringify(value));
    else
      localStorage.removeItem(key);
  }
}
```
### 3. get函数
就像是Vue组件computed的get一样是一个函数，ee-vuex的get函数支持异步即返回Promise。

当返回Promise时，Promise完成并返回非空值时，会调用set设置这个返回值给状态。

这对于需要在get时可以自动异步获取值的情况很有用，例如实战中的[登录](#登录)例子。

跟默认值不同的在于默认值一旦set不会改变，而像登录例子允许登出的情况就适用于异步get。

- 普通定义：字段get。第一个参数可以获得当前状态值，使用this.key同样可以获得状态值
```
key: {
  get(value) {}
}
```

- 简洁定义：注意参数防止和[set函数](#set函数)混淆，注意不能用箭头函数防止和[默认值](#默认值)混淆
```
key() {}
// 需要参数请写多一个无用参数
key(value, x) {}
// 可以function定义
key: function() {}
// NG：不可以用箭头函数，会被认为是默认值
key: () => {}
```

- 异步：异步Promise的返回值是直接set给了状态，从而引发状态改变，computed缓存失效，会再次get一次状态，所以要注意加判断防止多次异步取值造成死循环
```
// 设置token后在获取key时，2秒前返回undefined，2秒后返回和token一样的值
token: undefined,
async key(value, x) {
  // 注意加判断在没有值时赋值，防止多次异步取值
  if (this.token && !value) {
    return new Promise(r => {
      setTimeout(() => {
        r(this.token)
      }, 2000)
    })
  }
}
```
### 4. set函数
就像是Vue组件computed的set一样是一个函数，同样的，ee-vuex的set函数也支持异步，就像vuex和pinia的Actions。

需要注意的是
- set相同的值时，将不会调用set
- 设置有[默认值](#默认值)时，默认值是get时赋值的，在get前你就手动先set了值，那么在get时将会忽略掉默认值以确保你设置的值不被覆盖
- 调用set函数时，值还没有真正设置给状态，所以在set函数内调用get无法获得最新值，在set中可能会get到状态自身的情况可以用setTimeout延时调用。例如[登录](#登录)例子，改为设置token后立刻获取user信息，获取user信息可能会需要立刻使用token的值

- 普通定义：字段set。第一个参数是当前设置的值
```
key: {
  set(value) {}
}
```

- 简洁定义：注意仅1个参数就会被视为set函数，即便是箭头函数
```
key(value) {}
// 可以function定义
key: function(value) {}
// 可以箭头函数定义
key: (value) => {}
```

- 返回值：调用set时，值还没有真正设置给状态，可以通过返回非空值来决定最终状态的值
```
// 例如value为2，最终key的值为4
key(value) {
  return value * value;
}
```

- 异步：异步和[get函数](#get函数)一样，set异步可用于例如需要同步设置到服务器的情况，通过catch可以阻止本次赋值
```
// 若Promise成功，本地和你的服务器的值将会保持一致，若Promise错误，本次赋值将失败
async lauguage(value) {
  const value = await api.setLanguage(value);
  return value;
},
user: {},
```

## 更多实战

### 登录

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