import { Component, Prop, PropType, toRaw } from 'vue';
import { createStore, injectStore, maybeAsync } from '.';

/** 选项选中状态变化时的回调 */
type OptionOnChange<T = string> = (o: IOption<T>, selected: boolean) => void;

/** 选项对象
 * @template T - 选中值的类型
 * @template Data - 自定义选项数据的类型
 */
export interface IOption<T = string> {
  /** 选项的分组展示标签。分组直到下一个选项 group 不为空且不一样为止 */
  group?: string;
  /** 展示的选项文本 */
  label: string;
  /** 选项对应的值，不设定值则取 label 作为值 */
  value?: T;
  /** 选项是否可用 */
  disabled?: boolean;
  /** 选项子集，会递归渲染组件。若要所有选项包括子选项仅能单选一个，使用组件时必须加上 v-model="model" */
  children?: IOption<T>[];

  /** 选项选中状态发生改变时触发 */
  onChanged?: OptionOnChange<T>;
  /** 选项选中时触发 */
  onChecked?: OptionOnChange<T>;
}

interface IMultiple {
  /** 至少要选中的项数，选项过少则选中的不能取消 */
  min?: number,
  /** 最多可选中的项数，选项过多则没选中的不能再选 */
  max?: number,
}

function create<T>() {
  const _default = injectStore({
    props: {
      onChanging: null as any as import('vue').PropType<(modelValue: T) => void | Async<any>>,
      /** modelValue 改变后的回调函数 */
      onChange: null as any as import('vue').PropType<(modelValue: T) => void>,
      /** model 的值 */
      modelValue(value: T, set) {
        // if (this.onChanging) {
        //   return (async () => {
        //     if (await this.onChanging?.(value))
        //       throw '取消 model 赋值';
        //     set(value);
        //     this._emitModelValueChange();
        //   })()
        // } else {
        //   // 同步过，不产生 loading 状态
        //   set(value);
        //   this._emitModelValueChange();
        // }
        return maybeAsync(() => {
          const changing = this.onChanging;
          if (changing)
            return changing(value);
        }, (value) => {
          if (value)
            throw '拦截成功'
          console.log('同步操作')
        })
      },
    },
    data() {
      return {}
    },
    mounted() {
    },
  })
  return _default;
}