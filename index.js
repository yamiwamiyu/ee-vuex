/* eslint-disable */
import { ref, reactive, computed, toRaw, isReactive } from 'vue';

const types = [
  String,
  Number,
  Boolean,
  Array,
  Object,
  Date,
  Function,
  Symbol,
]

/** 判断两个值是否相同，相同时不重复赋值 */
function isEquals(v1, v2) {
  if (isReactive(v1))
    v1 = toRaw(v1);
  if (isReactive(v2))
    v2 = toRaw(v2);
  return v1 === v2;
}

/** 最后创建的ee-vuex实例 */
export const eeVuex = {
  /** @param {import('vue').App} vue */
  install(vue) {
    for (const key in eeVuex)
      eeVuex[key].install?.(vue);
  }
};

export function maybeAsync(_async, sync) {
  if (!_async)
    return sync();
  const maybePromise = _async();
  if (maybePromise && maybePromise.constructor === Promise) {
    return (async () => {
      const result = await maybePromise;
      return sync(result);
    })()
  } else {
    return sync();
  }
}

export function createStore(store, option) {
  if (option) {
    if (option.constructor === String)
      option = { name: option };
  } else
    option = {};

  // 持久化数据
  const pdatas = [];
  // 每个属性的异步状态
  /** @type {Record<string, { promises: Promise[], async: { promise: Promise, async: boolean, status: ('pending' | 'fulfilled' | 'rejected') | undefined } }>} */
  const asyncs = reactive({});
  function pushAsync(key, promise) {
    const a = asyncs[key];
    a.async.status = 'pending';
    let arr = a.promises;
    let withFinally = promise.finally(() => {
      arr.splice(arr.findIndex(i => i === withFinally), 1);
    }).then(ret => {
      if (!arr.length)
        a.async.status = 'fulfilled'
      return ret;
    }).catch(ret => {
      if (!arr.length)
        a.async.status = 'rejected'
      throw ret;
    });
    arr.push(withFinally);
  }
  // 仓库对象
  const x = reactive({});
  x.getAsync = function (key) {
    return asyncs[key]?.async;
  }
  // this 指针对象
  const _this = option.this ?? x;
  for (const key in store) {
    const value = store[key];
    let get, set;
    // 默认值的数组
    const __default = [];
    // 是否持久化
    let p;

    if (value != null) {
      if (value.constructor === Function || value.constructor?.name === 'AsyncFunction') {
        if (value.length === 1 || value.length === 2) {
          // set方法
          set = value;
        } else {
          // key: () => {} 缺少value.prototype ，视为设置默认值
          // 仅有箭头函数视为默认值，但是 this 默认会被编译成 undefined 导致无法使用 this，此时应该使用对象定义中的 default 并不使用箭头函数
          // [async] key() {} 缺少value.prototype ，视为get
          // key: function [name]() {} 有value.prototype ，视为get
          if (value.prototype || value.toString().startsWith(key) || value.toString().startsWith('async ' + key)) {
            // get方法
            get = value;
          } else {
            // 默认值
            __default.push(value);
          }
        }
      } else if (value === localStorage) {
        // 直接key: localStorage代表要持久化这个状态，其它默认
        p = true;
      } else if (value.constructor === Object) {
        if (value.hasOwnProperty('p')
          || value.hasOwnProperty('get')
          || value.hasOwnProperty('set')
          || value.hasOwnProperty('init')
          || value.hasOwnProperty('default')) {
          // ee-vuex结构
          if (value.p)
            p = true;
          if (value.get)
            get = value.get;
          if (value.set)
            set = value.set;
          if (value.hasOwnProperty('init'))
            __default.push(value.init);
          if (value.hasOwnProperty('default'))
            __default.push(value.default);
          // if (value.default) {
          //   if (value.default.constructor == Array) {
          //     // 多默认值
          //     __default.push(...value.default);
          //   } else {
          //     // 单默认值
          //     __default.push(value.default);
          //   }
          // }
          // if (value.async)
          //   _async = value.async;
        } else {
          // 对象默认值
          __default.push(value);
        }
      }
      // else if (value.constructor == Array) {
      //   // 多默认值
      //   __default.push(...value);
      // }
      else {
        // 单默认值
        __default.push(value);
      }
    }

    // get设置默认值时，set不清空默认值
    let setDefaultValue = false;
    // 异步 get 获取值时，防止死循环
    let asyncGetValue = false;
    // 默认值为undefined
    const v = ref();
    // 因为set允许异步，所以同步和异步最后都是调用这个set来赋值
    const __set = (value) => {
      // 相同的值不重新赋值
      if (isEquals(v.value, value)) {
        if (option.set)
          option.set.call(_this, key, value, x);
        return;
      }
      // 持久化
      if (p) {
        if (value != null)
          localStorage.setItem(key, JSON.stringify(value));
        else
          localStorage.removeItem(key);
      }
      v.value = value;
      if (option.set)
        option.set.call(_this, key, value, x);
    }
    x[key] = computed({
      get: function () {
        // 设置默认值
        while (__default.length) {
          setDefaultValue = true;
          const d = __default.shift();
          if (d) {
            if (d.constructor === Function || d.constructor?.name === 'AsyncFunction' || d.constructor === Promise) {
              // promise则等待异步结束
              let dret = d;
              if (d.constructor !== Promise)
                dret = d.call(_this, _this);
              if (dret && dret.constructor === Promise) {
                pushAsync(key, dret.then(i => {
                  // 有异步时，默认值将形成队列，set时防止清空后面的默认值
                  setDefaultValue = true;
                  x[key] = i;
                  setDefaultValue = false;
                  return i;
                }));
                // 有异步时，暂时停止赋值默认值，后面的默认值进行队列赋值
                break;
              } else {
                x[key] = dret;
              }
            } else {
              x[key] = d;
            }
          } else {
            // 默认空值
            x[key] = d;
          }
        }
        setDefaultValue = false;

        let ret = v.value;
        // 允许get的返回值覆盖原本应该设置的值
        if (get) {
          const temp = get.call(_this, ret, asyncGetValue);
          // get 异步设置的值，本次忽略 get 直接返回
          // 但仍要执行 get.call，主要是搜集其中的响应式变量，否则将失去响应式
          if (!asyncGetValue && temp !== undefined) {
            // 异步get时(例如首次访问需要请求api获取数据)，暂时先返回原来的值
            if (temp?.constructor === Promise)
              pushAsync(key, temp.then(i => {
                // ? 异步操作结束后，使用set赋值从而再次触发get以获取最新值，这可能导致死循环
                // ✔ 增加 asyncGetValue 来解除死循环危险
                if (i !== undefined) {
                  x[key] = i;
                  // console.log('get', key, '返回', i, '设置异步值')
                  asyncGetValue = true;
                  return i;
                }
                // else {
                //   console.log('get', key, '返回 undefined 不设置异步值')
                // }
              }));
            else
              ret = temp;
          }
        }
        // if (asyncGetValue)
        //   console.log('异步 get 后直接返回值', ret)
        asyncGetValue = false;
        return ret;
      },
      set: function (value) {
        // 相同的值不重新赋值
        // reactive.set 时会调用一次 get，因为需要获取 oldValue。如果 get 返回的是 computed 对象，则不会触发到 get
        // createStore 已经没问题，injectStore 通过 toRaw 也正确返回 computed 解决了问题
        if (isEquals(v.value, value))
          return;
        // 外部调用set比调用get还要先的话，忽略掉get的默认值
        if (!setDefaultValue && __default.length)
          __default.length = 0;
        // 允许set的返回值覆盖原本应该设置的值
        let setted = false;
        const __tempSet = (value) => {
          if (setted)
            return;
          setted = true;
          __set(value);
        }
        if (set) {
          // 将__set传入，允许set内部提前赋值
          // 这里传入的 __set 在函数内部调用了，且返回 undefined，会走最下面的 __set(value)，导致 option.set 重复回调了一遍，所以改用 __tempSet
          const temp = set.call(_this, value, __tempSet);
          if (temp !== undefined) {
            if (temp?.constructor === Promise) {
              // 异步set时(例如api确认后再赋值)
              pushAsync(key, temp.then(i => {
                // 操作成功时才赋值，如果操作成功返回空，则赋值原来set的值
                // 不过原本的值就是 promise 的情况下，还是要赋值
                if (i !== undefined || temp === value) {
                  // console.log('异步 set', key, i)
                  __tempSet(i);
                  return i;
                } else {
                  __tempSet(value);
                  return value;
                }
              }));
              // 暂时不赋值
              return;
            }
            else
              value = temp;
          }
        }
        __tempSet(value);
      }
    })

    asyncs[key] = {
      promises: [],
      async: {
        promise: computed(() => {
          // 首次触发 get
          if (__default.length)
            x[key];
          const a = asyncs[key];
          if (!a.promises.length)
            return Promise.resolve(x[key]);
          return new Promise(async resolve => {
            let result;
            while (a.promises.length) {
              try {
                result = await Promise.race(a.promises);
              } catch (err) {
                if (!a.promises.length)
                  throw err;
              }
            }
            resolve(result);
          });
        }),
        async: computed(() => {
          // 首次触发 get
          if (__default.length)
            x[key];
          return !!asyncs[key].promises.length;
        }),
      }
    }

    // 还原持久化的值
    if (p) {
      // 先放入数组，等整个store声明完成后再赋值，防止赋值时触发set会引起store中其它状态变化
      pdatas.push(() => {
        const pdata = JSON.parse(localStorage.getItem(key));
        if (pdata != null) {
          // 有值就赋值并且清空__default
          __default.length = 0;
          x[key] = pdata;
        }
      })
    }
  }

  // 此时store已经声明完毕，还原持久化的值触发set引起其它state变化也没有问题
  for (const p of pdatas)
    p();

  if (option.name) {
    if (eeVuex[option.name]) {
      console.error("The vuex object already contains a store named", option.name)
    } else {
      x.install = (vue) => { vue.config.globalProperties[option.name] = x; }
      eeVuex[option.name] = x;
    }
  }

  return x;
}

export function injectStore(o) {
  // 没有定义props的或者props是数组字符串的形式
  if (!o.props || o.props.length !== undefined)
    return o;

  // ee-vuex的简易写法(例如async)很多不符合vue组件定义props的语法
  let vuexFlag = false;     // 是否包含ee-vuex方式定义的prop
  const props = o.props;
  const oprops = {};  // vue的props
  for (const key in props) {
    const v = props[key];
    if (v != null) {
      const isType = v instanceof Array ?
        v.every(i => types.indexOf(i) !== -1) :
        types.indexOf(v) !== -1;
      // 非对象：prop: Number 或者 prop: [Number, String]
      if (isType) {
        oprops[key] = v;
        delete props[key];
      } else {
        // vuex: 包含 get/set/p/init 任意一个字段或空对象
        // vue : 仅包含 type, required, validator, default 字段的对象
        if (v.constructor === Object) {
          const isProp = ((v.hasOwnProperty('type') || v.hasOwnProperty('required') || v.validator || v.hasOwnProperty('default'))
            && !v.get && !v.set && !v.hasOwnProperty('p') && !v.hasOwnProperty('init'));
          if (isProp) {
            oprops[key] = v;
            delete props[key];
          } else {
            // 可能是ee-vuex和prop混合定义方式
            const np = {};
            if (v.type) np.type = v.type;
            if (v.required) np.required = v.required;
            if (v.validator) np.validator = v.validator;
            // v.default 默认值将被视为ee-vuex的定义
            oprops[key] = np;
            vuexFlag = true;
          }
        } else {
          // ee-vuex的简易定义
          oprops[key] = null;
          vuexFlag = true;
        }
      }
    } else {
      // 空值代表任意类型，属于vue的定义方式
      oprops[key] = null;
      delete props[key];
    }
  }

  o.props = oprops;

  // 全都是普通Vue组件的props定义
  if (!vuexFlag)
    return o;

  if (!o.mixins)
    o.mixins = [];

  const mixin = {};
  /*
  Vue3能在data和props中定义重名字段，既能接收props的值，优先级还是data中的高
  bug: 如果mixins或extends包含组件自身有多个data
  data的function会走mergeFn的逻辑以合并所有data
  合并data时会取消掉computed引用而变成普通的值
  所以通过 beforeMount 手动将 computed 赋值进 $data 中

  在赋值时优先级如下，setup > data > props > ctx

  bug: 有 watch 时，观察了一个 computed 变量，get 读取了 ee-vuex 的 props 时
  希望 get 读取的变量不是 props 而是 $data 中的属性
  在 beforeMount 之前 watch 就调用了 computed 的 get 方法，进而读取到的是 props 而不是 $data
  在 beforeMount 之前，this.$data 又是不可扩展的不能进行 Object.defineProperty 操作
  暂时没找到解决方案，用 ee-vuex 的 props 或 data 来替代需要 watch 的 computed 吧
   */
  // 如果组件没有 data 这里也默认创建一个 data
  // 否则 Object.isExtensible(this.$data) 为 false 不能使用 Object.defineProperty
  mixin.data = function () { return {}; }
  mixin.beforeMount = function () {
    const content = createStore(props,
      {
        this: this,
        set(key, value) {
          // props 全部作为双向数据流使用
          this.$emit("update:" + key, value);
        }
      });
    const raw = toRaw(content);
    const data = this.$data;
    for (const key in raw) {
      const value = raw[key];
      // 多个 getAsync 合并
      if (key === 'getAsync') {
        // data 返回的 createStore 实例就会有 getAsync，但是 __ee_vuex_asyncs 还是空的
        const has = data.hasOwnProperty(key);
        if (has && data.__ee_vuex_asyncs) {
          data.__ee_vuex_asyncs.push(value);
        } else {
          data.__ee_vuex_asyncs = [value];
          if (has)
            data.__ee_vuex_asyncs.push(data[key]);
          data[key] = (key) => {
            for (const getAsync of this.$data.__ee_vuex_asyncs) {
              const ret = getAsync(key);
              if (ret)
                return ret;
            }
          }
        }
        continue;
      }
      // 解决 reactive.set 会先 get 的问题，直接返回 computed 就不会触发 get
      data[key] = raw[key];
    }
  }
  mixin.emits = [];
  mixin.watch = {};
  for (const key in props) {
    // 注入watch侦听props在子组件被改变以同步给仓库的值
    mixin.watch["$props." + key] = function (value) {
      // 内外 set 有限定值范围的情况下可能会造成不同步的现象
      // 这算是数据流的 bug 但是很少有情况这么使用数据，所以忽略掉这个实现
      this[key] = value;
    }
    // 注入emits
    // 显示定义了 emits，传递事件时就不会将事件函数显示在 $attrs 中，导致要透传给子组件时无法简单使用 v-bind="$attrs" 透传函数
    // 所以这里干脆不注入 emits，类型上有提示就好
    // mixin.emits.push("update:" + key);
  }
  // mounted的时候再给props赋值默认值
  // 现在属性有绑定到template时，created就已经读取了props的值，ee-vuex的默认值就已经生效了
  // 实际开发中，我们希望侦听到属性的任何一次赋值，且赋值可能会伴随着操作DOM元素
  // 所以首次赋值默认值在mounted最为合适
  mixin.mounted = function () {
    // 对所有属性赋值上prop传的值，此时赋值一般可以覆盖掉props设置的默认值
    for (const key in props)
      if (this.$props[key] != undefined)
        this[key] = this.$props[key];
  }

  o.mixins.push(mixin);
  return o;
}

export default eeVuex;