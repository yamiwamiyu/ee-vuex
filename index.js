import { ref, reactive, computed } from 'vue';

/** 最后创建的vuex实例 */
export let vuex;

/** 创建一个vuex实例 */
export function createStore(option) {
  const x = reactive({});
  for (const key in option) {
    const value = option[key];
    let get, set;
    // 默认值的数组
    const __default = [];

    if (value) {
      if (value.constructor == Function) {
        if (value.length == 1) {
          // set方法
          set = value;
        } else {
          // key: () => {} 缺少value.prototype ，视为设置默认值
          // key() {} 缺少value.prototype ，视为get
          // key: function [name]() {} 有value.prototype ，视为get
          if (value.prototype || value.toString().startsWith(key)) {
            // get方法
            get = value;
          } else {
            // 默认值
            __default.push(value);
          }
        }
      } else if (value.constructor == Object) {
        if (value.get || value.set || value.default) {
          // vuex结构
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

    // 默认值为undefined
    const v = ref(undefined);
    x[key] = computed({
      get: function () {
        // 设置默认值
        while (__default.length) {
          const d = __default.shift();
          if (d) {
            if (d.constructor == Function) {
              // promise则等待异步结束
              const dret = d.call(x);
              if (dret && dret.constructor == Promise) {
                dret.then(i => x[key] = i);
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

        let ret = v.value;
        // 允许get的返回值覆盖原本应该设置的值
        if (get) {
          const temp = get.call(x, ret);
          if (temp)
            ret = temp;
        }
        return ret;
      },
      set: function (value) {
        // 调用set比调用get还要先的话，忽略掉get的默认值
        // __default.length = 0;
        v.value = value;
        // 允许set的返回值覆盖原本应该设置的值
        if (set) {
          const temp = set.call(x, value);
          if (temp)
            v.value = temp;
        }
      }
    })
  }

  x.install = (vue) => { vue.config.globalProperties.$vuex = x; }

  vuex = x;
  return x;
}

export default vuex;