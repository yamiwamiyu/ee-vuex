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

function isEmpty(obj) {
  for (const key in obj)
    return false;
  return true;
}

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
  install(vue) {
    for (const key in eeVuex)
      eeVuex[key].install?.(vue);
  }
};

export function createStore(store, option) {
  if (option) {
    if (option.constructor == String)
      option = { name: option };
  } else
    option = {};

  // 持久化数据
  const pdatas = [];
  const x = reactive({});
  const _this = option.this ?? x;
  for (const key in store) {
    const value = store[key];
    let get, set;
    // 默认值的数组
    const __default = [];
    // 是否持久化
    let p;
    // todo: 是否支持异步值
    // let _async;

    if (value != undefined) {
      if (value.constructor == Function || value.constructor?.name == 'AsyncFunction') {
        if (value.length == 1 || value.length == 2) {
          // set方法
          set = value;
        } else {
          // key: () => {} 缺少value.prototype ，视为设置默认值
          // todo: 仅有箭头函数视为默认值，但是 this 默认会被编译成 undefined 导致无法使用 this
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
      } else if (value == localStorage) {
        // 直接key: localStorage代表要持久化这个状态，其它默认
        p = true;
      } else if (value.constructor == Object) {
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
    // 默认值为undefined
    const v = ref();
    // 因为set允许异步，所以同步和异步最后都是调用这个set来赋值
    const __set = (value) => {
      // 相同的值不重新赋值
      if (isEquals(v.value, value))
        return;
      // 持久化
      if (p) {
        if (value != null)
          localStorage.setItem(key, JSON.stringify(value));
        else
          localStorage.removeItem(key);
      }
      v.value = value;
      if (option.set)
        option.set.call(_this, key, v.value, x);
    }
    x[key] = computed({
      get: function () {
        // 设置默认值
        while (__default.length) {
          setDefaultValue = true;
          const d = __default.shift();
          if (d) {
            if (d.constructor == Function || d.constructor?.name == 'AsyncFunction' || d.constructor == Promise) {
              // promise则等待异步结束
              let dret = d;
              if (d.constructor == Function || d.constructor?.name == 'AsyncFunction')
                dret = d.call(_this, _this);
              if (dret && dret.constructor == Promise) {
                dret.then(i => {
                  // 有异步时，默认值将形成队列，set时防止清空后面的默认值
                  setDefaultValue = true;
                  x[key] = i;
                  setDefaultValue = false;
                });
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
          const temp = get.call(_this, ret);
          if (temp !== undefined) {
            // 异步get时(例如首次访问需要请求api获取数据)，暂时先返回原来的值
            if (temp?.constructor == Promise)
              temp.then(i => {
                // 异步操作结束后，使用set赋值从而再次触发get使get能获得异步返回的最新值
                // 使用时注意异步操作应该有条件判断，否则set后再次触发get可能导致死循环
                if (i !== undefined)
                  x[key] = i;
              });
            else
              ret = temp;
          }
        }
        return ret;
      },
      set: function (value) {
        // 相同的值不重新赋值
        if (isEquals(v.value, value))
          return;
        // 外部调用set比调用get还要先的话，忽略掉get的默认值
        if (!setDefaultValue && __default.length)
          __default.length = 0;
        // 允许set的返回值覆盖原本应该设置的值
        if (set) {
          // 将__set传入，允许set内部提前赋值
          const temp = set.call(_this, value, __set);
          if (temp !== undefined) {
            if (temp?.constructor == Promise) {
              // 异步set时(例如api确认后再赋值)
              // 注意：这里使用了Promise，只要Promise完成，computed一定会首先触发一次get，且获得的是旧值
              // 如果异步又成功set了值，那么随后还会触发一次get获得新值
              // todo: 考虑修复上面这个回调 2 次的问题
              temp.then(i => {
                // 操作成功时才赋值，如果操作成功返回空，则赋值原来set的值
                if (i !== undefined)
                  __set(i);
              }).catch(() => { })
              // 暂时不赋值
              return;
            }
            else
              value = temp;
          }
        }
        __set(value);
      }
    })

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
      console.error("The vuex object already contains a warehouse named", option.name)
    } else {
      x.install = (vue) => { vue.config.globalProperties[option.name] = x; }
      eeVuex[option.name] = x;
    }
  }
  return x;
}

export function injectStore(o) {
  // 没有定义props的或者props是数组字符串的形式
  if (!o.props || o.props.length != undefined)
    return o;

  // ee-vuex的简易写法(例如async)很多不符合vue组件定义props的语法
  let vuexFlag = false;     // 是否包含ee-vuex方式定义的prop
  const props = o.props;
  const oprops = {};  // vue的props
  for (const key in props) {
    const v = props[key];
    if (v != undefined) {
      const isType = v instanceof Array ?
        v.every(i => types.indexOf(i) != -1) :
        types.indexOf(v) != -1;
      // 非对象：prop: Number 或者 prop: [Number, String]
      if (isType) {
        oprops[key] = v;
        delete props[key];
      } else {
        // vue对象：不包含 get, set, p 并且包含 type, required, validator, default 任意一个或者为空对象
        if (v.constructor == Object) {
          const isProp = isEmpty(v) || ((v.type || v.required || v.validator || v.default) && !v.get && !v.set && v.p == undefined);
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
  且没有办法只获得computed引用而步触发get值
  则只能自己创建属性(也就是方法，只有在调用时才触发)来封装一次computed
  // vue中 computed 原本也会执行这样的操作
  const c = computed({
      get,
      set
  });
  Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: true,
      get: () => c.value,
      set: v => (c.value = v)
  });
  在赋值时，setup > data > props > ctx
  所以 Object.defineProperty 定义到 ctx 上会被 props 的赋值给拦截
  还是得赋值到 setup 或 data 上
  这里赋值到 data 上来解决

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
          this.$emit("update:" + key, value);
        }
      });
    for (const key in content) {
      Object.defineProperty(this.$data, key, {
        get: () => content[key],
        set: v => content[key] = v
      });
    }
  }
  mixin.emits = [];
  mixin.watch = {};
  for (const key in props) {
    // 注入watch侦听props在子组件被改变以同步给仓库的值
    mixin.watch["$props." + key] = function (value) {
      this[key] = value;
      // 例如值只能是0-1，当前值为1，外部修改props为1.2
      // 内部限定成了1，1和原本的值不变，不重新赋值
      // 不赋值导致option.set不执行
      // 进而导致外部值和内部值不一致
      // 所以这里强制回传值
      this.$emit("update:" + key, this[key]);
    }
    // 注入emits
    mixin.emits.push("update:" + key);
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