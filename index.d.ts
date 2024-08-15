import { EmitsOptions, ComponentOptionsMixin, ComputedOptions, MethodOptions, DefineComponent, ComponentOptionsWithObjectProps, Prop, ExtractPropTypes } from 'vue';

/** 仓库的输入属性 */
declare type Store<T = Record<string, unknown>> = {
  [P in keyof T]: StoreProperty<T[P]>;
}

/** 仓库中的异步状态 */
declare type AsyncState<T> = Readonly<{
  /** 当前的异步进程，若没有异步会返回当前值
   * 
   * 若 default, get, set 同时执行产生多个 Promise，完成时将返回最后的状态
   */
  promise: Promise<T> | T;
  /** 当前是否存在异步
   * @example 
   * <template>
   *   <div v-if="store.getAsync('languages').async">正在加载...</div>
   *   <ul v-else>
   *     <li v-for="item in store.languages">{{ item }}</li>
   *   </ul>
   * </template>
   */
  async: boolean;
}>

/** 仓库的额外函数 */
declare type StoreExt<T> = T & {
  /** 获取属性的 default, get, set 产生的未执行完的异步状态，旨在用于状态未加载完成前显示加载动画
   * @param key - 仓库的字段名
   * @example 
   * // 模板显示异步数据，数据返回前显示加载状态，下面是伪代码示例
   * <list v-loading="store.getAsync('test')" :list="store.test" />
   * // 详细流程参看以下代码
   * const store = createStore({
   *   test: {
   *     // 3s 后默认值 1
   *     default: () => new Promise(resolve => setTimeout(() => resolve(1), 3000)),
   *     // 延迟 1s 后值翻倍
   *     set(value) { return new Promise(resolve => setTimeout(() => resolve(value * 2), 1000)) },
   *   }
   * });
   * 
   * (async () => {
   *   console.log(store.test); // 读取触发默认值异步，当前值为 undefined
   *   store.test = 4; // 赋值触发异步，当前值为 undefined
   *   const promise = store.getPromise('test'); // 获取当前异步状态
   *   // console.log(await promise); // 若在此等待最终结果，流程：0s 赋值 4 -> 1s 结果 8 -> 3s 赋值 1 -> 4s 结果 2
   *   await new Promise(resolve => setTimeout(resolve, 3500));
   *   console.log(store.test); // 8，默认值已赋值，触发 set 异步，距离结果 2 剩余 0.5s
   *   store.test = 16; // 异步尚未结束，中途再次赋值更新异步，promise 将返回最终异步的结果
   *   await new Promise(resolve => setTimeout(resolve, 500));
   *   console.log(store.test); // 2，默认值已赋值成功
   *   console.log(await promise); // 32，赋值 16 已赋值成功
   * })()
   */
  getAsync: <K extends keyof T>(key: K) => AsyncState<T[K]>;
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
declare interface StoreObject<T> {
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

  // 对于 Promise 作为状态返回的情况忽略不解决，仓库里就不应该存放函数
}

declare type StoreProps<P = Data> = {
  [K in keyof P]: Prop<P[K]> | StoreProperty<P[K]> | null;
};
/** 确定 StoreObject<T> 的 T 类型 */
// declare type ExtractStoreObject<T> = T extends { init: infer U } ? U
//   : T extends { default: infer U } ? (U extends Promise<infer V> ? V : U)
//   : T extends { get: (value: infer U, ...args: any[]) => any } ? U
//   : T extends { get: () => infer R } ? R
//   : T extends { set: (value: infer U, ...args: any[]) => infer R } ? U | R | unknown
//   : T;
/** 确定 StoreProperty<T> 的 T 类型 */
declare type ExtractStoreProperty<T> = 
  // T extends object ? ExtractStoreObject<T>
  T extends StoreObject<infer R> ? R  // 和上面几乎是一样的效果，交由 TS 自动推断泛型
  : T extends (value: infer U, ...args: any[]) => any ? U
  : T extends () => infer U ? U
  : T;
/** 确定仓库每个字段的 T 类型 */
declare type ExtractStore<T> = T extends object ? {
  [K in keyof T]: ExtractStoreProperty<T[K]>
} : never;

/**
 * 创建一个针对vue组件props的ee-vuex仓库
 * 
 * injectStore的特别之处
 * 1. createStore的get/set方法this指向仓库；injectStore指向vue组件实例
 * 2. createStore独立存在；injectStore依赖vue选项式组件实例
 * 3. 通过set监听值变化，首次set在mounted而不是created，且任然会触发set
 * 4. props变为双向数据流，即可读可写
 * 
 * @param o - 选项式定义的Vue组件
 * @example injectStore({ props: { modelValue: 0, } })
 */
export declare function injectStore<PropsOptions extends Readonly<StoreProps>, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = Record<string, any>, EE extends string = string>(options: ComponentOptionsWithObjectProps<StoreProps<PropsOptions>, RawBindings, D, C, M, Mixin, Extends, E, EE, ExtractPropTypes<PropsOptions> | ExtractStoreProperty<PropsOptions>>): DefineComponent<Array<keyof PropsOptions>, RawBindings, D, C, M, Mixin, Extends, E, EE>;

/** 创建一个ee-vuex仓库 */
export declare function createStore<T, R = StoreExt<ExtractStore<T>>, This = R>(store: ThisType<This> & Store<T>, option?: {
  /** 仓库名，设置仓库名可以全局通过 const { 仓库名 } = require('ee-vuex').default 获得仓库实例 */
  name?: string;
  /** 仓库定义的 get/set/默认值 方法调用时的this实例，默认为仓库实例 */
  this?: This;
  /** 仓库中所有属性赋值后的回调方法，可用于记录日志等调试业务
   * @param key - 赋值的属性
   * @param value - 赋值的值
   * @param store - 赋值的仓库实例
   */
  set?: (key: keyof T, value: any, store: R) => void;
} | string) : R;