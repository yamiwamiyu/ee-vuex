import { ref, reactive, computed } from 'vue';

/** 最后创建的ee-vuex实例 */
export const eeVuex = {
  install(vue) {
    for (const key in eeVuex)
      eeVuex[key].install?.(vue);
  }
};

/**创建一个ee-vuex仓库
 * @param {Object} store 仓库的定义
 * @param {String | Object} option 仓库名或详细仓库设置
 * @class option
 * name: 仓库名
 * this: 调用仓库状态get/set方法的this对象，默认为仓库实例
 * set(key, value, store): 在set方法设置值给ref变量后回调
 */
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

    if (value != undefined) {
      if (value.constructor == Function || value.constructor?.name == 'AsyncFunction') {
        if (value.length == 1) {
          // set方法
          set = value;
        } else {
          // key: () => {} 缺少value.prototype ，视为设置默认值
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
        if (value.p || value.get || value.set || value.default) {
          // ee-vuex结构
          if (value.p)
            p = true;
          if (value.get)
            get = value.get;
          if (value.set)
            set = value.set;
          if (value.default) {
            if (value.default.constructor == Array) {
              // 多默认值
              __default.push(...value.default);
            } else {
              // 单默认值
              __default.push(value.default);
            }
          }
        } else {
          // 对象默认值
          __default.push(value);
        }
      } else if (value.constructor == Array) {
        // 多默认值
        __default.push(...value);
      } else {
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
      if (v.value === value)
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
        option.set.call(_this, key, value, x);
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
          if (temp) {
            // 异步get时(例如首次访问需要请求api获取数据)，暂时先返回原来的值
            if (temp.constructor == Promise)
              temp.then(i => {
                // 异步操作结束后，使用set赋值从而再次触发get使get能获得异步返回的最新值
                // 使用时注意异步操作应该有条件判断，否则set后再次触发get可能导致死循环
                if (i != null)
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
        if (v.value === value)
          return;
        // 外部调用set比调用get还要先的话，忽略掉get的默认值
        if (!setDefaultValue && __default.length)
          __default.length = 0;
        // 允许set的返回值覆盖原本应该设置的值
        if (set) {
          const temp = set.call(_this, value);
          if (temp != null) {
            if (temp.constructor == Promise) {
              // 异步set时(例如api确认后再赋值)
              // 注意：这里使用了Promise，只要Promise完成，computed一定会首先触发一次get，且获得的是旧值
              // 如果异步又成功set了值，那么随后还会触发一次get获得新值
              temp.then(i => {
                // 操作成功时才赋值，如果操作成功返回空，则赋值原来set的值
                if (i != null)
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
        if (pdata) {
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

/** 创建一个针对vue组件props的ee-vuex仓库
 * 与createStore有什么不同
 * 1. createStore的get/set方法this指向仓库；injectStore指向vue组件实例，需要this.仓库名指向仓库
 * 2. createStore独立存在；injectStore依赖vue组件实例
 * 
 * injectStore有什么优势
 * 1. 流程更合理：通过set监听值变化，首次set在mounted而不是created，且任然会触发set
 * 2. 流程更统一：属性不再分data/props/computed/watch，都相当于computed属性
 * 3. 流程更简单：因为流程的统一性，组件结构更清晰，就只有 数据(props) / 方法(methods)
 */
export function injectStore(o/*, name*/) {
  // 没有定义props的组件跳过
  if (!o.props)
    return o;

  if (!o.mixins)
    o.mixins = [];

  const props = o.props;

  const mixin = {};
  // Vue3能在data和props中定义重名字段，既能接收props的值，优先级还是data中的高
  mixin.data = function () {
    const store = createStore(props,
      {
        this: this,
        set(key, value) {
          this.$emit("update:" + key, value);
        }
      });
    if (!name)
      return store;
    const ret = {};
    ret[name] = store;
    return ret;
  }
  mixin.emits = [];
  mixin.watch = {};
  for (const key in props) {
    // 注入watch侦听props在子组件被改变以同步给仓库的值
    mixin.watch["$props." + key] = function (value) {
      // if (name)
      //   this[name][key] = value;
      // else
      this[key] = value;
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
    for (const key in props) {
      if (this.$props[key] != undefined) {
        // if (name)
        //   this[name][key] = this.$props[key];
        // else
        this[key] = this.$props[key];
      }
    }
  }

  o.mixins.push(mixin);
  return o;
}

export default eeVuex;