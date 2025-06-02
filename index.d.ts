import { defineComponent, EmitsOptions, ComponentOptionsMixin, ComputedOptions, MethodOptions, SlotsType, ComponentInjectOptions, ObjectEmitsOptions, ComponentObjectPropsOptions, CreateComponentPublicInstance, ComponentOptionsBase, Prop, PropType, ExtractPropTypes, PublicProps, DefineComponent, ExtractDefaultPropTypes, App } from 'vue';

/** Vue 定义的类型，但是没有加 export，只能复制出来 */
type EmitsToProps<T extends EmitsOptions> = T extends string[] ? {
  [K in `on${Capitalize<T[number]>}`]?: (...args: any[]) => any;
} : T extends ObjectEmitsOptions ? {
  [K in `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}` ? (...args: Parameters<Extract<T[Uncapitalize<C>], (...args: any) => any>>) => any : never;
} : {};

/** 将状态生成对应事件 */
type StorePropertyToEmits<T> = {
  [K in keyof T as `update:${string & K}`]-?: (value: T[K]) => any;
}

type PropConstructor<T = any> = {
  new(...args: any[]): T;
}

type FilterStoreProperty<T> = {
  [K in keyof T as
  // ee-vuex: 包含 ee-vuex 对象字段
  T[K] extends { init: any } | { get: any } | { set: any } | { p: any } ? K :
  // vue: 包含 vue 任意字段或 null
  T[K] extends null | { type: any } | { required: any } | { validator: any } | { default: any } ? never :
  // 值为类型构造函数，例如 Number，或 [Number, String]。但同时 () => string 也符合
  T[K] extends PropType<any> ?
  (
    // vue: 值为 PropType<*>
    PropConstructor extends T[K] ? never :
    // vue: 值为构造函数写法
    T[K] extends PropConstructor | PropConstructor[] ? never :
    // 值为 get/set 的简便写法
    K
  ) :
  // 在 ts 中类型为 Prop<unknown, T>，主要用于泛型组件
  Prop<any, any> extends T[K] ? never :
  // ee-vuex: 任意类型的值
  K
  ]?
  : T[K] extends StorePropertyBase<infer R> ? R & {}
  : T[K] extends Computed<infer R> ? R
  : T[K];
}

// ExtractPropTypes 中必有的属性为 required: true, boolean, default
// 在生成文档时，其实只有 required: true 才是要求必填，自带默认值不应该必填
type FilterVueProps<T> = ExtractPropTypes<{
  [K in keyof T as K extends keyof FilterStoreProperty<T> ? never : K]: T[K];
}> extends infer Props ? Props : never;

/** 创建一个选项式 vue 组件，{@link https://cn.vuejs.org/api/options-state.html#props|props} 使用 {@link createStore} 来构建，此外和 {@link defineComponent} 相比有以下特点
 * 1. defineComponent 通过 watch 监听 props 值变化，首次赋值在 created 阶段，且不触发 watch；injectStore 通过 set 函数监听值变化，首次赋值在 mounted 而不是 created，且任然会触发 set
 * 2. props 变为双向数据流，变为可读可写，可使用 v-model
 * @param o - 选项式定义的 Vue 组件
 * @example injectStore({ props: { modelValue: 0, } })
 */
export function injectStore<
  EEVuexT = {},
  EEVuexC = {},
  VueT = {},
  PropOptions = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends ObjectEmitsOptions = {},
  S extends SlotsType = {},
  I extends ComponentInjectOptions = {},

  VueProps = FilterVueProps<PropOptions>,
  StoreProps = FilterStoreProperty<PropOptions>,
  Emits = E & StorePropertyToEmits<StoreProps>,
  Props = VueProps & StoreProps & EmitsToProps<Extract<Emits, ObjectEmitsOptions>>,
  // Defaults = ExtractDefaultPropTypes<Pick<PropOptions, keyof VueProps & keyof PropOptions>>,
  This = CreateComponentPublicInstance<Props, RawBindings, D & StoreExt<StoreProps>, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, Props, {}, false, I, S>,
>
  (
    // Props 使用 Props 无法获得 props 属性，但仅作用在 setup 的第一个参数，其实无所谓
    // E 使用 Emits 无法获得 ee-vuex 的事件，但仅作用在 setup 的第二个参数，其实无所谓
    options: ComponentOptionsBase<VueProps & StoreProps, RawBindings, D, C, M, Mixin, Extends, Extract<E & StorePropertyToEmits<StoreProps>, ObjectEmitsOptions>, string, {}, I, string, S> & {
      props: PropOptions | ComponentObjectPropsOptions<VueT> | Store<EEVuexT, EEVuexC, {}> | ThisType<This>
    } | ThisType<This>
  )//: Prettify<AnotherProps>
  : EasyDefineComponent<PropOptions, RawBindings, D, C, M, Mixin, Extends, E, S>
// : DefineComponent<{}, RawBindings, D & StoreExt<StoreProps>, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, string, PublicProps, Partial<Pick<Props, keyof Defaults & keyof Props>> & Omit<Props, keyof Defaults & keyof Props>, {}, S>

/** 用于简化 DefineComponent 的类型，便于 ts 编译成 .d.ts 时简化重复使用的泛型类型，还能保留 jsdoc 注释不被抛弃
 * 
 * 注意：由于比起 DefineComponent 多包了两层类型，组件再被用于继承时容易引发 ts 的编译报错
 * 
 * `Type instantiation is excessively deep and possibly infinite.`
 * 
 * 为了防止这个问题，导出组件时可以使用具名接口来优化
 * 
 * bug: 并且不知道为什么，出来的组件使用 T extends DefineComponent<infer PropOptions, ... infer PP> 两个类型会有问题
 * @example
 * // component.vue
 * import { injectStore } from 'ee-vuex'
 * const component = injectStore({
 *   props: { modelValue: 0 }
 * })
 * type componentTypeOf = typeof component;
 * // 这里使用具名接口防止死循环
 * export interface IComponent extends componentTypeOf {}
 * // 组件的 jsdoc 注释写在这里
 * export default component as IComponent;
 * 
 * // component2.vue 继承组件
 * const component2 = injectStore({
 *   // 编译 .d.ts 后 extends 会生成 EasyDefineComponent<{ modelValue: number }, ...>，容易引发编译错误
 *   // extends: component
 *   // 编译 .d.ts 后 extends 会生成 IComponent，简化类型解决编译错误
 *   extends: component
 * })
 */
export type EasyDefineComponent<PropOptions, RawBindings, D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin,
  E extends ObjectEmitsOptions,
  S extends SlotsType> = EeVuexDefineComponent<PropOptions, RawBindings, D, C, M, Mixin, Extends, E, S>

type EeVuexDefineComponent<PropOptions, RawBindings, D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin,
  E extends ObjectEmitsOptions,
  S extends SlotsType,

  VueProps = FilterVueProps<PropOptions>,
  StoreProps = FilterStoreProperty<PropOptions>,
  Emits = E & StorePropertyToEmits<StoreProps>,
  Props = VueProps & StoreProps & EmitsToProps<Extract<Emits, ObjectEmitsOptions>>,
  Defaults = ExtractDefaultPropTypes<Pick<PropOptions, keyof VueProps & keyof PropOptions>>> =
  DefineComponent<{}, RawBindings, D & StoreExt<StoreProps>, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, string, PublicProps, Partial<Pick<Props, keyof Defaults & keyof Props>> & Omit<Props, keyof Defaults & keyof Props>, {}, S>

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {}


// 上面是 injectStore 的内容
// 以下是 createStore 的内容


/** 仓库中的异步状态 */
type AsyncState<T> = Readonly<{
  /** 当前的 Promise，若没有异步会返回当前值
   * 
   * 若 default, get, set 同时执行产生多个 Promise，将返回最后完成的 Promise 的结果
   */
  promise: Promise<T>;
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
  /** 当前或最后一次异步的状态
   * - undefined: 没有异步
   * - pending: 正在异步
   * - fulfilled: 成功
   * - rejected: 失败
   */
  status: ('pending' | 'fulfilled' | 'rejected') | undefined;
  /** 当状态为 rejected 时的错误对象 */
  error?: any;
}>

/** 仓库的额外函数 */
export type StoreExt<T> = T & ([keyof T] extends [never] ? {} : IAsyncState<T>);
// export type StoreExt<T> = T & IAsyncState<T>;

/** 获取仓库的异步状态 */
export interface IAsyncState<T> {
  /** 获取属性的 default, get, set 产生的未执行完的异步状态，可用于状态未加载完成前显示加载动画
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

/** 仓库 */
type Store<T, C, D> = {
  [K in keyof T]: StorePropertyBase<T[K]>;
} | {
  [K in keyof C]: StoreComputed<T[K & keyof T], C[K]>;
} | D;

type StorePropertyBase<T> = StoreObject<T>
  // 0 个参数代表 get / 1 或 2 参函数代表 set
  // | ((...args: any[]) => Promise<T> | T)
  | ((value: T, set: (value: any) => void, ...args: any[]) => Promise<T> | T | Promise<void> | void | undefined)
  // | undefined 是因为例如 set 中可能有个异步拦截函数，有拦截函数就返回异步，没拦截函数就同步。如果简单使用 async set 就算是没有拦截器也会有 1 帧的异步，新解决方案参见 maybeAsync

// bug: get 或 set 中的 value 推断出了 T 类型，可是实际写调用 value 却又被识别为 any
// ThisType<T> 导致的，使用 ThisType 使用 | 而不是使用 &
type StoreObject<T = any> = {
  /** 是否持久化到localStorage，持久化的key默认为当前属性名 */
  p?: boolean | number;
  /** 简单默认值，不支持异步，当 default 异步时作为返回前的值使用 */
  init?: T,
  /** 默认值，可以使用异步方法或返回 Promise 异步获取默认值 */
  default?: (() => Promise<T> | T) | Promise<T> | T;
}

type Computed<T> = {
  /** 获取属性值
   * 
   * 注意：使用异步函数获取值时，按照流程会有以下问题
   * - 异步函数最终的 then 会将返回值调用 set 赋值给属性
   * - 赋值后属性值因为发生变化，从而再次触发 get 以获取最新值
   * - 若 get 中的异步没有对值进行条件判断而再次异步获取值，将造成死循环
   * 
   * 例如 async get() { return await 异步搜索函数(搜索关键字) }
   * 
   * 本意是希望异步搜索函数变化或搜索关键字变化时，能去搜索返回最新的内容，可是却会造成了死循环
   * 
   * 在 v2.5.0 版本时修复了这个问题，修复后流程如下
   * - 异步函数最终的 then 会将返回值调用 set 赋值给属性(不变)
   * - 赋值后属性值因为发生变化，从而再次触发 get 以获取最新值(不变)
   * - 再次调用异步 get，此次调用是为了搜集响应式数据以在依赖变量变化时响应值变化
   * - 直接返回上一次的异步结果，忽略本次的异步结果
   * - 下次依赖的响应式数据发生变化时，会自动再次触发 get 函数以获取最新值
   * @param value - 当前属性的值
   * @param postback - 是否为异步 get 完成后引起的再次进入 get，可用于在搜集完所有响应式数据后 return value 来跳过异步处理
   * @example
   * get(value, postback) {
   *   const reactive1 = this.a;
   *   const reactive2 = this.b;
   *   // 上面定义变量来搜集响应式依赖
   *   if (postback) return value;
   *   return new Promise(resolve => {
   *     // 异步操作
   *   })
   * }
   */
  get?(value: T, postback: boolean): Promise<T> | T | Promise<void> | void,
  /** 设置属性值 */
  set?(value: T, set: (value: T) => void): Promise<T> | T | Promise<void> | void;
}

type StoreComputed<SO, T> = unknown extends SO ? Computed<T> : Computed<SO>;

/** 创建一个仓库
 * @param store - 仓库状态
 * @param option - 仓库详细配置或全局仓库名
 * @example
 * import { createStore } from 'ee-vuex'
 * createStore({
 *   vuexObj1: {
 *     p: true,
 *     init: 0,
 *     default: 1,
 *     get(value) { },
 *     set(value, set) { },
 *   },
 *   vuexObj2: {
 *     account: '',
 *     password: '',
 *     age: 18,
 *   },
 *   vuexDefault1: 0,
 *   vuexDefault2: () => 0,
 *   vuexDefault3: async () => await 0,
 *   vuexGet1() { return 0 },
 *   async vuexGet2() { return await 0 },
 *   vuexSet1(value: number, set) { },
 *   // ts bug: value 虽然被认定为 any，但是必须手写 :any
 *   vuexSet2(value: unknown, set) { return 0 },
 *   async vuexSet3(value: number, set) { return await value * value },
 * })
 */
export function createStore<T, C, D, O, RT = {
  [K in keyof C]: unknown extends T[K & keyof T] ?
  unknown extends C[K] ?
  D[K & keyof D] :
  C[K] :
  T[K & keyof T]
}, R = StoreExt<RT>, This = R>(store: ThisType<This> | Store<T, C, D>, option?: O | {
  /** 仓库名
   * 
   * (推荐：拥有类型推断) 不设置全局仓库名，使用时导入仓库
   * ```
   * // store.js
   * export const userStore = createStore({ name: '', password: '' });
   * // other.js
   * import { userStore } from './store.js'
   * userStore.name // 具有类型推断
   * ```
   * 
   * (不推荐：缺少类型推断) 设置仓库名可以全局通过 const { 仓库名 } = require('ee-vuex').default 获得仓库实例
   * 
   * 在 app.use() 仓库实例后，可以在 Vue 组件中通过仓库名全局获取仓库实例
   * 
   * @see 通过仓库名获取带有类型推导的仓库实例请参考[文档](#https://gitee.com/yamiwamiyu/ee-vuex#3-%E7%B1%BB%E5%9E%8B%E6%8E%A8%E5%AF%BC)
   */
  name?: string;
  /** 仓库定义的 get/set/默认值 方法调用时的this实例，默认为仓库实例 */
  this?: This;
  /** 仓库中所有属性赋值后的回调方法，可用于记录日志等调试业务
   * 
   * 回调有以下几种情况
   * - 原本值为 true，再次赋值为 true 则不回调
   * - 原本值为 true，赋值为 false，属性有 set 函数且返回了值，无论返回 true 还是 false，都会回调
   * @param key - 赋值的属性
   * @param value - 赋值的值，不是 get 的值
   * @param store - 赋值的仓库实例
   */
  set?: (key: keyof T, value: any, store: R) => void;
} | string): R & (unknown extends O ? {} : O extends string | { name: string } ? { install(app: App): void } : {});

/** 一个可能异步也可能不异步的操作，例如改变某个值之前有个可能异步的拦截器
 * 1. 没有设定拦截器应该是同步操作，防止 1 帧的加载状态
 * 2. 有拦截器时是异步操作，等待异步操作后再做同步操作
 * 3. 对于仓库的异步 set 如果拦截成功抛出异常即可
 * @param _async - 可能有的异步操作
 * @param sync - 必做的同步操作
 * @example
 * // const onChanging: (() => void | Promise<any>) | undefined
 * maybeAsync(onChanging, (result) => console.log('异步结果', result))
 * maybeAsync(() => {
 *   if (onChanging)
 *     return onChanging(参数)
 * }, (result) => {
 *   console.log('异步结果', result)
 *   if (result)
 *     throw '拦截赋值'
 *   // todo: 没有拦截，可执行同步操作
 * })
 */
export function maybeAsync<Async, Sync>(_async: (() => void | Async | Promise<Async>) | undefined, sync: (result?: Async) => Sync): Sync | Promise<Sync>;

// 不加这个所有的类型将都会被引用到
export { };

// todo: 当属性仅 get，且返回的是 Promise<string> 的时候，属性的类型应该是 string | undefined，而不仅仅是 string