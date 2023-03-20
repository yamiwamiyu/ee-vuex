# ee-vuex

#### 介绍
使用更方便的vuex


#### 和vuex的区别
还在使用vuex？来看看下面管理用户状态的代码
```
import { createStore } from 'vuex'

export default createStore({
  state: { 
    user: undefined,
  },
  getters:{
    user(state) {
      if (!state.user) {
        const ls = localStorage.getItem('user');
        if (ls)
          store.commit('login', JSON.parse(ls))
      }
    },
    token: state => 'bearer ' + state.user.token,
  },
  mutations: {
    login(state, user){
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout(state) {
      state.user = undefined;
      localStorage.removeItem('user')
    }
  },
})

// 组件：引用用户数据
<div>{{ $store.state.getters?.name }}</div>
// js：登录用户
this.$store.commit("logout", user)
```

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


#### 特技
看到这里，你应该发现了ee-vuex比vuex

1.  定义更**清晰简便**
2.  功能更**强大完善**
3.  调用更**简单方便**


#### 安装教程

```
npm i ee-vuex
```

#### 使用说明

1.  像vuex一样声明你的全局状态，下面示例根据项目常见的场景举例了ee-vuex的声明方式
```
import { createStore } from 'ee-vuex'

vue.use(createStore({
  // 通过localStorage缓存的数据
  example1: 
  // 需要从后端接口获取数据并缓存为全局状态(接口返回Promise)

}))
```
2.  在组件或js中获取或修改全局状态



