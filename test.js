import { createStore, injectStore } from "./index.js";
import { defineComponent } from "vue";

const comp = injectStore({
    data() {
        return {
            /** data 的注释 */
            dataField: 0,
        }
    },
    emits: {
        /** 
         * @param {number} value
         * @param {string} value2 
         */
        click: (value, value2) => {},
        'update:modelValue': () => {},
    },
    props: {
        /** 测试 ee-vuex 属性 */
        test: {
            init: 5,
            /** @param {string} v */
            get(v) {
                return v | 0;
            }
        },
        /** 测试 vue 属性 */
        test2: String,
    },
    mounted() {
        // todo: Vue 的 Props 没有注释
        this.$props.test2
        this.$props.test
        // todo: $emit 事件函数不正确
        // todo: get/set 函数的参数类型推断不正确
        this.$emit('')
    }
});

defineComponent({
    data() { return {} },
    props: {
        /** 注释 */
        test: String,
        /** 测试 vue 属性 */
        test2: {
            type: Number,
        },
    },
    mounted() {
        this.$props.test2
    }
})

const store = createStore({
    nulGet: {
        get() {}
    },
    hasGet: {
        init: '',
        get(value) {
        },
        set(value, set) {
        },
    },
    unknown() { return '' },
    test1() { return Date.now() },
    /**
     * @param {number} a
     */
    test2(a, b) {
    },
    obj: {
        a: 0,
        b: '',
        c: [],
        d: {},
        e() { return Date.now(); },
        f: () => Date.now().toFixed(2),
    },
    actions: {
        /** @param {number} a  */
        power(a) { return a * a; },
    },
})