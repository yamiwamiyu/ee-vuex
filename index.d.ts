import { DefineComponent } from 'vue';

export declare type Func<T> = () => T;
/** 获得仓库属性赋值
 * @param value - 属性当前的值
 */
export declare function OnGet<T>(value: T): Promise<T> | T | void;
/** 给一个仓库属性赋值
 * @param value - 要赋的值
 * @param set - 给属性赋值的函数，在赋值过程中如果会触发 get 并希望获得最新的值时，可以先用 set(value) 赋值
 */
export declare function OnSet<T>(value: T, set: function(T)): Promise<T> | T | void;
/** 给一个仓库属性赋值后的回调
 * @param key - 赋值的属性
 * @param value - 赋值的值
 * @param store - 赋值的仓库实例
 */
export declare function OnStoreSet<T>(key: String, value: any, store: StoreInstance<T>): void;
export declare type DefaultValue<T> = Array<Func<Promise<T> | T> | T> | Func<Promise<T> | T> | T;
export declare type Store<T> = {
  [P in keyof T]: StoreProperty<T[P]> | DefaultValue<T[P]>;
}
export declare type StoreInstance<T> = {
  [P in keyof T]: T[P];
}
export declare interface StoreProperty<T> {
  /** 是否持久化到localStorage，持久化的key默认为当前属性名 */
  p?: Boolean | Number;
  /** 获取属性值 */
  get?: typeof OnGet<T>;
  /** 设置属性值 */
  set?: typeof OnSet<T>;
  /** 默认值，可以使用数组配置多个默认值，可以使用异步方法或返回Promise异步获取默认值 */
  default?: DefaultValue<T>;
  /** get/set/default 是否允许异步
   * 
   * 默认返回 Promise 类型会视为 Promise.resolve 的值作为返回值
   * 
   * 允许异步后返回 Promise 也被认为是值，同时也支持 Promise 完成后 resolve 的值作为返回值
   * 
   * undefined 或者 0: 默认，Promise 不返回，仅返回 Promise.resolve 的值
   * 
   * 1: get 异步
   * 
   * 2: set 异步
   * 
   * 4: default 异步
   * 
   * 8: Promise.resolve 之后的值作为返回值，单独使用无效即为默认值
   * 
   * 可以使用按位 | 来指定多个值，例如 `async: '1' | '2' | '8'` 代表 get/set 异步，赋值异步结果
   */
  async: (undefined | '0' | '1' | '2' | '4' | '8');
}

/** 创建一个ee-vuex仓库 */
export declare function createStore<T>(store: Store<T>, option: {
  /** 仓库名，设置仓库名可以全局通过 const { 仓库名 } = require('ee-vuex').default 获得仓库实例 */
  name?: String;
  /** 仓库定义的 get/set/默认值 方法调用时的this实例，默认为仓库实例 */
  this?: StoreInstance<T> | any;
  /** 仓库中所有属性赋值后的回调方法，可用于记录日志等调试业务 */
  set?: typeof OnStoreSet<T>;
} | String): StoreInstance<T>;

export declare interface StoreComponent<T extends Pick<T, 'props'>> extends DefineComponent {
  props: Store<T>;
};
/**
 * 创建一个针对vue组件props的ee-vuex仓库
 * 
 * injectStore的特别之处
 * 1. createStore的get/set方法this指向仓库；injectStore指向vue组件实例
 * 2. createStore独立存在；injectStore依赖vue组件实例
 * 3. 通过set监听值变化，首次set在mounted而不是created，且任然会触发set
 * 4. props变为双向数据流，即可读可写
 * 
 * @param o - 选项式定义的Vue组件
 * @example
 * export default injectStore({ props: { modelValue: 0, } })
 */
export declare function injectStore<T>(o: StoreComponent<T>): T;