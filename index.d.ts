import { EmitsOptions, ComponentOptionsMixin, ComputedOptions, MethodOptions, DefineComponent, ComponentOptionsWithObjectProps, Prop, ExtractPropTypes } from 'vue';

/** 给一个仓库属性赋值后的回调
 * @param key - 赋值的属性
 * @param value - 赋值的值
 * @param store - 赋值的仓库实例
 */
declare type OnStoreSet<T> = (key: keyof T, value: any, store: StoreInstance<T>) => void;
declare type Store<T = Record<string, unknown>> = {
  [P in keyof T]: StoreProperty<T[P]>;
}
declare type StoreInstance<T> = {
  [P in keyof T]: T[P];
}

declare type StoreProperty<T = any> =
  StoreObject<T>
  // 注意：0 个参数和 void 返回值将导致这个属性显示为 () => void 函数，其实类型为 any
  // 1 或 2 参函数代表 set
  | ((value: T, set: (value: any) => any) => void)
  // 0 或 3 参以上代表 get
  | ((...args: any[]) => Promise<T> | T | void)
  // 0 参函数或任意类型
  | T;

// todo: get 或 set 中的 value 推断出了 T 类型，可是实际写调用 value 却又被识别为 any
export declare interface StoreObject<T> {
  /** 是否持久化到localStorage，持久化的key默认为当前属性名 */
  p?: Boolean | Number;
  /** 获取属性值 */
  get?: ((value: T) => Promise<T> | T | void),
  /** 设置属性值 */
  set?: (value: T, set: (value: T) => void) => Promise<T> | T | void;
  /** 简单默认值，不支持异步，当 default 异步时作为返回前的值使用 */
  init?: T,
  /** 默认值，可以使用异步方法或返回 Promise 异步获取默认值 */
  default?: (() => Promise<T> | T) | Promise<T> | T;

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
  async?: (undefined | '0' | '1' | '2' | '4' | '8');
}

declare type StoreProps<P = Data> = {
  [K in keyof P]: Prop<P[K]> | StoreProperty<P[K]> | null;
};
declare type ExtractStoreObject<T> = T extends { init: infer U } ? U
  : T extends { default: infer U } ? (U extends Promise<infer V> ? V : U)
  : T extends { get: (value: infer U) => any | void } ? U | any
  : T extends { get: (...args: any[]) => R } ? R
  : T extends { set: (value: infer U, ...args: any[]) => infer R } ? U | R | unknown
  : T;
declare type ExtractStoreProperty<T> = T extends object ? ExtractStoreObject<T>
  : T extends (value: infer U, ...args: any[]) => any ? U
  : T extends () => infer U ? U
  : T;
declare type ExtractStore<T> = T extends object ? {
  [K in keyof T]: ExtractStoreProperty<T[K]>
} : never;

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
 * @example injectStore({ props: { modelValue: 0, } })
 */
export declare function injectStore<PropsOptions extends Readonly<StoreProps>, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(options: ComponentOptionsWithObjectProps<StoreProps<PropsOptions>, RawBindings, D, C, M, Mixin, Extends, E, EE, ExtractPropTypes<PropsOptions> | ExtractStoreProperty<PropsOptions>>): DefineComponent<Array<keyof PropsOptions>, RawBindings, D, C, M, Mixin, Extends, E, EE>;

/** 创建一个ee-vuex仓库 */
export declare function createStore<T, R = Readonly<ExtractStore<T>>, This = R>(store: ThisType<This> & Store<T>, option?: {
  /** 仓库名，设置仓库名可以全局通过 const { 仓库名 } = require('ee-vuex').default 获得仓库实例 */
  name?: String;
  /** 仓库定义的 get/set/默认值 方法调用时的this实例，默认为仓库实例 */
  this?: This;
  /** 仓库中所有属性赋值后的回调方法，可用于记录日志等调试业务 */
  set?: OnStoreSet<T>;
} | String) : R;
//: ExtractStore<T>;