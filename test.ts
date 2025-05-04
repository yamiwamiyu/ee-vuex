import { Component, Prop, PropType, toRaw } from 'vue';
import { createStore, injectStore } from '.';

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

function create<Option extends IOption<any>, Multiple extends boolean | IMultiple, ModelValue = Multiple extends false ? Option['value'] : NonNullable<Option['value']>[]>() {
  const _default = injectStore({
    props: {
      /** 选中项的值 */
      modelValue: {
        init: undefined as any as ModelValue,
      },

      /** 选项，可以通过异步函数来动态搜索选项 */
      options: null as any as Prop<unknown, ((keyword: string) => Option[]) | Option[] | undefined>,
      /** 多选模式 */
      multiple: [Boolean, Object] as any as Prop<unknown, Multiple>,
      /** 搜索的关键词 */
      keyword: '',

      /** 点击选项 */
      onOptionClick: null as any as PropType<(option: Option) => void>,
    },
    data() {
      return {}
    },
    mounted() {
    },
  })
  return _default;
}