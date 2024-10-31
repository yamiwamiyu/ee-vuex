import { EmitsOptions, ComponentOptionsMixin, ComputedOptions, MethodOptions, SlotsType, ComponentInjectOptions, ObjectEmitsOptions, ComponentObjectPropsOptions, CreateComponentPublicInstance, ComponentOptionsBase, DefineComponent, PublicProps, Prop, PropType, ExtractPropTypes, ExtractDefaultPropTypes } from 'vue';

/** Vue 定义的类型，但是没有加 export，只能复制出来 */
type EmitsToProps<T extends EmitsOptions> = T extends string[] ? {
  [K in `on${Capitalize<T[number]>}`]?: (...args: any[]) => any;
} : T extends ObjectEmitsOptions ? {
  [K in `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}` ? (...args: T[Uncapitalize<C>] extends (...args: infer P) => any ? P : T[Uncapitalize<C>] extends null ? any[] : never) => any : never;
} : {};

/** 将状态生成对应事件 */
type StorePropertyToEmits<T> = {
  [K in keyof T as `update:${string & K}`]: (value: T[K]) => any;
}

type PropConstructor<T = any> = {
  new(...args: any[]): T;
}

type FilterStoreProperty<T> = {
  [K in keyof T as
  // 包含 ee-vuex 对象字段
  T[K] extends { init: any } | { get: any } | { set: any } | { p: any } ? K :
  // 包含 vue 任意字段或 null
  T[K] extends null | { type: any } | { required: any } | { validator: any } | { default: any } ? never :
  // 值为类型构造函数，例如 Number，或 [Number, String]。但同时 () => string 也符合
  T[K] extends PropType<any> ?
  (
    // 值为 PropType<*>
    PropConstructor extends T[K] ? never :
    // 值为构造函数写法
    T[K] extends PropConstructor | PropConstructor[] ? never :
    // 值为 get/set 的简便写法
    K
  ) :
  // 任意类型的值
  K
  ]?
  : T[K] extends StorePropertyBase<infer R> ? R & {}
  : T[K] extends Computed<infer R> ? R
  : T[K];
}

// ExtractPropTypes 中必有的属性为 required: true, boolean, default
// 在生成文档时，其实只有 required: true 才是要求必填，自带默认值不应该必填
type FilterVueProps<T> = { [K in keyof ExtractPropTypes<{
  [K in keyof T as K extends keyof FilterStoreProperty<T> ? never : K]: T[K];
}>]: T[K & keyof T] extends Prop<infer P> ? P : never; }

/** 用于 ComponentOptionsBase<T>，主要是 setup 传入的 props 和 data 的 this.$props，因为 setup 用得少，所以类型不保证完全正确
 * 在 data 和 setup 中，ee-vuex 的状态还未初始化，所以不能调用 ee-vuex 的 props
 */
type ComponentOptionsBaseProps<VueT> = {
  [K in keyof VueT as unknown extends VueT[K] ? never : K]: VueT[K]
}

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
  Defaults = ExtractDefaultPropTypes<Pick<PropOptions, keyof VueProps>>,
  This = CreateComponentPublicInstance<Props, RawBindings, D & StoreExt<StoreProps>, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, Props, Defaults, false, I, S>,

  AnotherProps = ComponentOptionsBaseProps<VueT>,
>
  (
    // Props 使用 Props 无法获得 props 属性，但仅作用在 setup 的第一个参数，其实无所谓
    // E 使用 Emits 无法获得 ee-vuex 的事件，但仅作用在 setup 的第二个参数，其实无所谓
    options: ComponentOptionsBase<AnotherProps, RawBindings, D, C, M, Mixin, Extends, Extract<E & StorePropertyToEmits<StoreProps>, ObjectEmitsOptions>, string, Defaults, I, string, S> & {
      props: PropOptions | ComponentObjectPropsOptions<VueT> | Store<EEVuexT, EEVuexC, {}> | ThisType<This>
    } | ThisType<This>
  )//: Prettify<AnotherProps>
  : DefineComponent<{}, RawBindings, D & StoreExt<StoreProps>, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, string, PublicProps, Props, Defaults, S>

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {}


// 上面是 injectStore 的内容
// 以下是 createStore 的内容


/** 仓库中的异步状态 */
type AsyncState<T> = Readonly<{
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
type StoreExt<T> = T & {
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

/** 仓库 */
type Store<T, C, D> = {
  [K in keyof T]: StorePropertyBase<T[K]>;
} | {
  [K in keyof C]: StoreComputed<T[K & keyof T], C[K]>;
} | D;

type StorePropertyBase<T> = StoreObject<T>
  // 0 个参数代表 get / 1 或 2 参函数代表 set
  // | ((...args: any[]) => Promise<T> | T)
  | ((value: T, set: (value: any) => void, ...args: any[]) => Promise<T> | T | void)

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
  /** 获取属性值 */
  get?(value: T): Promise<T> | T | void,
  /** 设置属性值 */
  set?(value: T, set: (value: T) => void): Promise<T> | T | void;
}

type StoreComputed<SO, T> = unknown extends SO ? Computed<T> : Computed<SO>;

/** 创建一个ee-vuex仓库
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
export function createStore<T, C, D, RT = {
  [K in keyof C]: unknown extends T[K & keyof T] ?
  unknown extends C[K] ?
  D[K & keyof D] :
  C[K] :
  T[K & keyof T]
}, R = StoreExt<RT>, This = R>(store: ThisType<This> | Store<T, C, D>, option?: {
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
   * @param key - 赋值的属性
   * @param value - 赋值的值
   * @param store - 赋值的仓库实例
   */
  set?: (key: keyof T, value: any, store: R) => void;
} | string): R;