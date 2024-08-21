import { EmitsOptions, ComponentOptionsMixin, ComputedOptions, MethodOptions, Prop, ExtractPropTypes, SlotsType, ComponentInjectOptions, ObjectEmitsOptions, ExtractDefaultPropTypes, ComponentObjectPropsOptions, CreateComponentPublicInstance, ComponentOptionsBase, DefineComponent, PublicProps } from 'vue';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {}

/** Vue 定义的类型，但是没有加 export，只能复制出来 */
type EmitsToProps<T extends EmitsOptions> = T extends string[] ? {
  [K in `on${Capitalize<T[number]>}`]?: (...args: any[]) => any;
} : T extends ObjectEmitsOptions ? {
  [K in `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}` ? (...args: T[Uncapitalize<C>] extends (...args: infer P) => any ? P : T[Uncapitalize<C>] extends null ? any[] : never) => any : never;
} : {};

/** 从 props 和 ee-vuex 的状态定义中，筛选出 ee-vuex 的状态 */
type FilterStoreProperty<T> = {
  [K in keyof T as
  // ee-vuex
  T[K] extends StoreObject ? K :
  // vue
  T[K] extends Prop<infer _> ? never :
  // ee-vuex 的 get/set/默认值
  K]?: T[K];
}
/** 将 FilterStoreProperty 筛选后的状态生成对应事件 */
type StorePropertyToEmits<T> = {
  [K in keyof T as `update:${string & K}`]: (value: T[K]) => any;
}
/** 从 vue 和 ee-vuex 的状态定义中，筛选出 vue 的状态 */
type FilterVueProps<T> = {
  [K in keyof T as K extends keyof FilterStoreProperty<T> ? never : K]: T[K];
};

type ExtractStore<T> = T extends Store<infer P> ? P : never;

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
  PropsOptions = ComponentObjectPropsOptions | { [x: string]: StorePropertyBase },
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends ObjectEmitsOptions = {},
  EE extends string = string,
  S extends SlotsType = {},
  I extends ComponentInjectOptions = {},
  II extends string = string,

  VueProps = ExtractPropTypes<FilterVueProps<PropsOptions>>,
  StoreProps = ExtractStore<FilterStoreProperty<PropsOptions>>,
  PrivateProps = VueProps & StoreProps,
  Emits = E & StorePropertyToEmits<StoreProps>,
  Props = Prettify<VueProps & StoreProps & EmitsToProps<Extract<Emits, ObjectEmitsOptions>>>,
  Defaults = ExtractDefaultPropTypes<FilterVueProps<PropsOptions>>,
  This = CreateComponentPublicInstance<Props, RawBindings, D & PrivateProps, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, Props, Defaults, false, I, S>
>
  (
    options: ComponentOptionsWithStoreProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II, S>
  ): Prettify<StoreProps>
  // : DefineComponent<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, PublicProps, ResolveProps<Props, E>, ExtractDefaultPropTypes<Props>, S>

type ComponentOptionsWithStoreProps<
  PropsOptions = ComponentObjectPropsOptions | { [x: string]: StorePropertyBase },
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends ObjectEmitsOptions = {},
  EE extends string = string,
  I extends ComponentInjectOptions = {},
  II extends string = string,
  S extends SlotsType = {},

  VueProps = ExtractPropTypes<FilterVueProps<PropsOptions>>,
  StoreProps = ExtractStore<FilterStoreProperty<PropsOptions>>,
  PrivateProps = VueProps & StoreProps,
  Emits = E & StorePropertyToEmits<StoreProps>,
  Props = Prettify<VueProps & StoreProps & EmitsToProps<Extract<Emits, ObjectEmitsOptions>>>,
  Defaults = ExtractDefaultPropTypes<FilterVueProps<PropsOptions>>,
  This = CreateComponentPublicInstance<Props, RawBindings, D & PrivateProps, C, M, Mixin, Extends, Required<Extract<Emits, ObjectEmitsOptions>>, Props, Defaults, false, I, S>
>
  = ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, Extract<Emits, ObjectEmitsOptions>, EE, Defaults, I, II, S> & {
    props: PropsOptions | ThisType<This>
  } | ThisType<This>;


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
type Store<T> = {
  [K in keyof T]: StoreProperty<T[K]>;
}

type StorePropertyBase<T = any> = StoreComputed<StoreObject<T>>
  // 0 个参数代表 get / 1 或 2 参函数代表 set
  | ((value: T, set: (value: any) => any) => Promise<T> | T | void);

/** 仓库中的一个状态 */
type StoreProperty<T = any> = StorePropertyBase<T> | T;

// bug: get 或 set 中的 value 推断出了 T 类型，可是实际写调用 value 却又被识别为 any
// ThisType<T> 导致的，使用 ThisType 使用 | 而不是使用 &
interface StoreObject<T = any> {
  /** 是否持久化到localStorage，持久化的key默认为当前属性名 */
  p?: boolean | number;
  /** 简单默认值，不支持异步，当 default 异步时作为返回前的值使用 */
  init?: T,
  /** 默认值，可以使用异步方法或返回 Promise 异步获取默认值 */
  default?: (() => Promise<T> | T) | Promise<T> | T;
}

type Computed<T> = {
  /** 获取属性值 */
  get?: ((value: T) => Promise<T> | T | void),
  /** 设置属性值 */
  set?: ((value: T, set: (value: T) => void) => Promise<T> | T | void);
}

type StoreComputed<SO> = 
  SO extends StoreObject<infer T> ?
  // nil: {} 也会认为是 extends StoreObject<infer T> 此时 T = SO = {}
  // SO 约束为 StoreObject
  T extends SO ? SO & Computed<T> :
  SO & Computed<T> : never;

/** 创建一个ee-vuex仓库
 * @param store - 仓库状态
 * @param option - 仓库详细配置或全局仓库名
 */
export function createStore<T, R = StoreExt<T>, This = R>(store: ThisType<This> | Store<T>, option?: {
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