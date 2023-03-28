import { ref, reactive, computed } from 'vue';

/** 最后创建的vuex实例 */
const vuex = {
  install(vue) {
    for (const key in vuex)
      vuex[key].install?.(vue);
  }
};

/** 创建一个vuex实例 */
export function createStore(option, name) {
  // 持久化数据
  const pdatas = [];
  const x = reactive({});
  for (const key in option) {
    const value = option[key];
    let get, set;
    // 默认值的数组
    const __default = [];
    // 是否持久化
    let p;

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
                dret = d.call(x);
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
        setDefaultValue = false;

        let ret = v.value;
        // 允许get的返回值覆盖原本应该设置的值
        if (get) {
          const temp = get.call(x, ret);
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
        if (!setDefaultValue)
          __default.length = 0;
        // 允许set的返回值覆盖原本应该设置的值
        if (set) {
          const temp = set.call(x, value);
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
          x[key] = pdata;
          __default.length = 0;
        }
      })
    }
  }

  // 此时store已经声明完毕，还原持久化的值触发set引起其它state变化也没有问题
  for (const p of pdatas)
    p();

  if (name) {
    if (vuex[name]) {
      console.error("The vuex object already contains a warehouse named", name)
    } else {
      x.install = (vue) => { vue.config.globalProperties[name] = x; }
      vuex[name] = x;
    }
  }
  return x;
}

export default vuex;