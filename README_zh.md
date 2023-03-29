# ee-vuex

更**简单**更**方便**的Vue3项目全局状态管理器。

## 介绍
ee代表了**封装(Encapsulated)** 和 **简单(Easy)**，让开发者的代码更简洁。

### 1. 使用场景
全局状态一般用于：
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
vue项目中一般使用vuex和pinia来管理全局状态，请先通过下面表格看一下vuex的核心概念和ee-vuex的对比。
- vuex可以参考其官方文档 https://vuex.vuejs.org/zh/
- pinia可以参考其官方文档 https://pinia.web3doc.top/core-concepts/

||vuex|ee-vuex(computed形式)|
|-|-|-|
state|- **定义**<br>state:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;value,<br>}<br>-&nbsp;**调用**<br>\\$store.state.key|- **定义**<br>key:&nbsp;value<br>-&nbsp;**调用**<br>\\$store.key|
getters|- **定义**<br>getters:&nbsp;{<br>&nbsp;&nbsp;key(state)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;state.key<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.getters.key|- **定义**<br>key()&nbsp;{}<br>-&nbsp;**调用**<br>\\$store.key|
mutations|- **定义**<br>mutations:&nbsp;{<br>&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value&nbsp;*&nbsp;2<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.commit("key",&nbsp;value)|- **定义**<br>key(value)&nbsp;{&nbsp;<br>&nbsp;&nbsp;return&nbsp;value&nbsp;*&nbsp;2&nbsp;<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
actions|- **定义**<br>actions:&nbsp;{<br>&nbsp;&nbsp;async&nbsp;key({commit},&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(),&nbsp;1000)<br>&nbsp;&nbsp;&nbsp;&nbsp;})<br>&nbsp;&nbsp;&nbsp;&nbsp;commit("key",&nbsp;value)<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**调用**<br>\\$store.dispatch("key",&nbsp;value)|- **定义**<br>async&nbsp;key(value)&nbsp;{<br>&nbsp;&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(value)<br>&nbsp;&nbsp;&nbsp;&nbsp;,&nbsp;1000)<br>&nbsp;&nbsp;})<br>}<br>-&nbsp;**调用**<br>\\$store.key&nbsp;=&nbsp;value|
module|- **定义**<br>const&nbsp;a&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'a'&nbsp;}<br>}<br>const&nbsp;b&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'b'&nbsp;}<br>}<br>createStore({<br>&nbsp;&nbsp;modules:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;a:&nbsp;moduleA,<br>&nbsp;&nbsp;&nbsp;&nbsp;b:&nbsp;moduleB<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br>\\$store.state.a.key<br>\\$store.state.b.key|- **定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'a'<br>},&nbsp;'\\$a')<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'b'<br>},&nbsp;'\\$b')<br>-&nbsp;**调用**<br>\\$a.key<br>\\$b.key|
v-model|- **定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;undefined&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="key"&nbsp;/><br></template><br>...<br>computed:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;get&nbsp;()&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;this.\\$store.state.key<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;set&nbsp;(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.\\$store.commit('key',&nbsp;value)<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}<br>|- **定义**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;undefined<br>},&nbsp;'\\$store')<br>-&nbsp;**调用**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="\\$store.key"&nbsp;/><br></template><br>...|
localStorage|- **定义**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;key:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key'))<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})|- **定义**<br>createStore({&nbsp;key:&nbsp;{&nbsp;p:&nbsp;1,&nbsp;}&nbsp;})|

### 3. ee-vuex的优势
无论是vuex，pinia，定义一个全局状态的核心都包括
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
使用ee-vuex请先了解以下4点
1. [创建仓库](#1-创建仓库)
2. [定义状态](#11-仓库对象)
3. [引入仓库](#21-调用仓库)
4. [调用状态](#22-调用仓库状态)

### 1. 创建仓库
创建仓库使用createStore方法，方法接收2个参数

1.1 [仓库对象](#11-仓库对象)：可以定义多个状态

1.2 [仓库名](#12-仓库名)：指定仓库名字方便全局引用

- 全局仓库：整个项目可调用，这是使用ee-vuex的一般用法
```
import { createApp } from 'vue'
import { createStore } from 'ee-vuex'

const vue = createApp({ /* 组件 */ });

vue.use(createStore({
  // 这里定义状态
},
// 仓库的名字
"$store"))

// 多个仓库
vue.use(createStore({}, "$store2"))
vue.use(createStore({}, "$store3"))

// 非命名仓库，需要自己保存store实例，调用vue.use(store)无任何效果
const store = createStore({});
```

- 局部仓库：单个组件可调用，局部仓库可以用来代替组件的data，computed，watch使用
```
// file test.vue
<template></template>

<script type="text/javascript">
import { createStore } from 'ee-vuex'
export default {
  name: "test",
  data() {
    return {
      // 此时store就像仓库名，通过this.store就可以调用仓库
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
仓库对象可以定义多个状态，定义一个状态主要包含下面4个核心内容
- [默认值](#1-默认值)
- [是否持久化](#2-是否持久化)
- [get函数](#3-get函数)
- [set函数](#4-set函数)

定义状态具体请参考[定义核心](#定义核心)

#### 1.2 仓库名
创建仓库**默认没有仓库名**，全局仓库你应该给它起个名字。

createStore可以创建**多个不同命名**的仓库，对于命名的仓库可以全局获得其实例，获取方式请查看[调用仓库](#21-调用仓库)，同名仓库只有最先创建的那个可以全局获得其实例。

创建多个命名仓库时，也可以通过下面方式**一次性全局导入**这些仓库
```
import { createApp } from 'vue'
import stores, { createStore } from 'ee-vuex'

// 创建多个仓库
createStore({}, "a")
createStore({}, "b")
createStore({}, "c")
createStore({}, "d")

// 直接导入ee-vuex默认返回的对象就可以在Vue组件中使用a b c d仓库了
createApp({}).use(stores);
```


### 2. 使用仓库
#### 2.1 调用仓库
对于非命名仓库，需要自己保存仓库实例，可参考[创建仓库的局部仓库](#1-创建仓库)。

对于命名仓库，可以通过仓库名获取其实例

- JS引入全局仓库实例(不需要vue.use)
```
import x from 'ee-vuex'
// $store1, $store2, $store3为createStore时传入的仓库名
const { $store1, $store2, $store3 } = x;
```

- 组件内获得仓库实例(需要vue.use，参考[创建仓库](#1-创建仓库)和[仓库名](#12-仓库名))
```
// file test.vue
// $store1, $store2, $store3为createStore时传入的仓库名
<template>
  <!-- 模板中直接使用[仓库名]获得仓库实例 -->
  <div>{{ $store1 }}</div>
  <div>{{ $store2 }}</div>
  <div>{{ $store3 }}</div>
</template>

<script type="text/javascript">
export default {
  name: "test",
  mounted() {
    // JS中使用this.[仓库名]获得仓库实例
    this.$store1 || this.$store2 || this.$store3
  }
}
</script>
```

#### 2.2 调用仓库状态
有了仓库实例后，调用仓库的状态非常简单，就像调用一个computed的属性一样。

可以看到下面示例代码非常简单，ee-vuex的更多优势请参考[ee-vuex的优势](#3-ee-vuex的优势)

(假设下面代码存在全局仓库$store，仓库包含状态state1)
- 模板 get
```
<div>{{ $store.state1 }}</div>
```
- JS get
```
mounted() {
  const state1 = this.$store.state1;
}
```
- 模板 set
```
<input type="text" v-model="$store.state1" />
```
- JS set
```
mounted() {
  this.$store.state1 = "text value";
}
```


## 定义核心

在ee-vuex的仓库定义中，一个状态就是一个对象，这个对象包含下面4个字段
- default: 状态的[(默认值)](#1-默认值)
- p: 利用localStorage自动设置和还原状态值[(是否持久化)](#2-是否持久化)
- get: 获取状态时触发的[(get函数)](#3-get函数)
- set: 赋值状态时触发的[(set函数)](#4-set函数)

且当你仅想自定义其中一个字段时，还会有相应的**简洁定义**方法。

这样定义状态的好处请参考[ee-vuex的优势](#3-ee-vuex的优势)

后面的示例代码都写在创建仓库里面，创建仓库参考[仓库对象](#1-创建仓库)
```
import { createStore } from 'ee-vuex'
createStore({
  // 后面的示例代码都应该是写在这个对象里的
})
```

### 1. 默认值
普通的默认值很好理解，看后面的代码示例即可。

ee-vuex的默认值对于异步[缓存枚举的数据](#1-使用场景)是非常有用的。

例如我们的页面支持多种语言，语言的种类需要通过api异步从后端获取，数据是一个数组。

在异步获取到数据前我们希望状态的值是一个空数组，以便页面可以直接用于v-for循环而不用繁琐的v-if判断。

上述的例子中，状态默认值应该具备以下几个特点：
- 默认值有2个
- 一开始默认值为空数组
- api异步获取数据后替换默认值

ee-vuex的默认值具备以下特点可以实现上述需求
- **支持数组**：即可设置多个默认值
- **支持异步**：数组元素可以是异步的Promise，即可访问api获取值。多个异步元素会进行**队列操作**
- **支持懒加载**：**首次get**状态时才仅**触发一次**赋值默认值的操作，即可节约性能和内存

具体实现请看下面**多默认值**的示例

作者的话：一般来说，应该只有上面例子中使用2个默认值的情况，至少我暂时没有想到需要使用超过2个默认值的场景。虽然用数组实现了允许多个默认值的队列，但我希望仅用一个更简便的定义来配置这2个默认值。期待有想法的你能帮作者提供更好的方案，或者给出确实需要2个以上默认值的实战场景

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

- Function：可以用方法返回默认值，可以支持异步方法和Promise。注意简洁定义时请使用箭头函数，否则会被认为是[get函数](#3-get函数)或[set函数](#4-set函数)。
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
// NG：会被认为是get函数，默认值undefined
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
  return {
    name: 'ee-vuex',
    default: true,
  }
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
  () => new Promise(r => {
    setTimeout(() => {
      r([1, 2, 3])
    }, 2000)
  }),
  () => new Promise(r => {
    setTimeout(() => {
      r([4, 5, 6])
    }, 2000)
  }),
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

持久化就是当我们希望刷新页面，状态的值仍然保留上次运行的值。可用于例如登录的token，用户选择的语言等场景。

一般我们会把仓库的状态保存到localStorage中，初始化时读出来，set时写进去。

持久化对于仓库来说是个很常用的功能，所以ee-vuex增加了简单的配置来协助实现而不用自己重复实现持久化。

使用持久化需要注意：
- 优先读取localStorage的值，有值则会忽略[默认值(default)](#1-默认值)
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

- 自定义实现：利用[默认值](#1-默认值)和[set函数](#4-set函数)也可以轻松实现
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

跟默认值的不同在于默认值仅set一次不会改变，而像登录例子允许登出的情况，下次可能登录其它账号就需要重新异步获取值，此时应该使用异步get会更方便。

<hr>

- 普通定义：字段get。第一个参数可以获得当前状态值。注意在值有更新时computed会刷新get的缓存，在get函数中使用this.key获得的还是缓存的值
```
key: {
  get(value) {
    // this.key只能获得缓存的值
    console.log("value", value, "oldvalue", this.key)
  }
}
```

- 简洁定义：注意参数个数防止和[set函数](#4-set函数)混淆，注意不能用箭头函数防止和[默认值](#1-默认值)混淆
```
key() {}
// OK：需要参数请写多一个无用参数
key(value, x) {}
// OK：可以function定义
key: function() {}
// NG：不可以用箭头函数，会被认为是默认值
key: () => {}
```

- 异步：异步Promise的返回值是直接set给了状态，从而引发状态改变，computed缓存失效，如果是模板引用状态则会再次get一次状态，所以要注意加判断防止多次异步取值造成死循环
```
// 设置token后再获取key时，2秒前返回undefined，2秒后返回和token一样的值
token: undefined,
async key(value, x) {
  // 注意加判断在没有值时赋值，防止多次异步取值
  if (this.token && !value) {
    return await new Promise(r => {
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
```
// 定义状态
key: {
  default: 1,
  set(value) {
    console.log("new value", value)
  }
}

// Vue组件
mounted() {
  // 将不会在控制台输出new value 1
  this.$store.key = 1;
}
```
- 状态有[默认值](#1-默认值)时，默认值是get时赋值的，在get前你就手动先set了值，那么在get时将会忽略掉默认值以确保你设置的值不被默认值覆盖。但是如果你的默认值包含异步且已经在执行，那么set也无法停止正在执行的异步操作，可能会导致异步默认值覆盖你set的值的情况，请尽量不要这样设计状态
```
// 定义状态
key: [1, () => new Promise(r => {
    setTimeout(() => {
      r(3)
    }, 2000)
  })]

// Vue组件
// 示例1：先set再get
mounted() {
  // 先set，key的值为2，默认值将不再生效
  this.$store.key = 2;
  console.log(this.$store.key); // 输出2
  // 默认值已经不再生效，后面key的值一致是2
  setTimeout(() => {
    console.log(this.$store.key); // 输出2
  }, 3000)
}
// 示例2：先get再set
mounted() {
  // 先get，已经设置了默认值1，Promise也已经在执行
  console.log(this.$store.key); // 输出1
  // set，key为2
  this.$store.key = 2;
  console.log(this.$store.key); // 输出2
  // Promise已经在执行，set无法中断，2秒后key将变为异步的默认值3
  setTimeout(() => {
    console.log(this.$store.key); // 输出3
  }, 3000)
}
```
- 调用set函数时，值还没有真正赋值给状态，所以在set函数内调用get无法获得最新值，在set中需要get到状态自身的值的情况可以用setTimeout延时调用
```
key(value) {
  // 假如value为1，将输出value 1 oldvalue undefined
  console.log("value", value, "oldvalue", this.key)
  // 输出$store.key: undefined
  api();
  setTimeout(() => {
    // 输出$store.key: 1
    api();
  })
}

// api方法打印仓库状态key的值
const api = () => {
  console.log("$store.key:", $store.key)
}
```

<hr>

- 普通定义：字段set。参数是当前设置的值
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

- 异步：异步和[get函数](#3-get函数)一样，set异步可用于例如需要同步设置到服务器的情况，通过catch可以阻止本次赋值
```
// 若Promise成功，本地和服务器的值将会保持一致，若Promise错误，本次赋值将失败
async lauguage(value) {
  await api.setLanguage(value);
  console.log("跟后台成功同步了value")
},
```
### 完整示例
```
import { createStore } from 'ee-vuex'
import { api } from './your-api-js'

createStore({
  // (完整示例)登录用户的token
  token: {
    p: 1,
    default: "",
    get(value) { return 'bearer ' + value; },
    set(value) {
      if (!value)
        this.user = undefined;
    }
  },
  // (get示例)登录的用户信息：没有数据时从后台获取，获取前返回空对象
  user(value, x) {
    if (!value && this.token)
      return api.getUser();
    return value || {};
  },
  // (默认值示例)所有语言：从后台获取所有语言
  languages: [[], () => api.getLanguages()],
  // (set示例)用户设置语言：默认cn，且能持久化
  language: {
    default: "cn",
    p: 1,
    async set(value) {
      // 通知服务端用户选择使用的语言
      await api.setLanguage(value);
      console.log("跟服务端成功同步了value")
    }
  },
})
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