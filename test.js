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
            get(value) {
                
            }
        },
        // withDefaultValue: ['1', '2'],
        /** 测试 vue 属性 */
        test2: String,
    },
    mounted() {
        this.$props.
        // todo: get/set 函数的参数类型推断不正确
        this.$emit('update:withDefaultValue', )
    }
});

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
        // aa: '这也行吗'
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

const store3 = createStore({
    b: {
        init: '',
        get(value) {
        },
        set(value, set) {
        },
    },
    get: {
        /** @param {string} value  */
        get(value) {
        },
    },
    getWithoutParam: {
        get() {
            return 5;
        }
    },
    set: {
        /** @param {string} value  */
        set(value) {
        },
    },
    dev: 0,
    getOnly() { return ' ' },
    /** @param {string} val  */
    setOnly(val) {},
    nul: {
    },
})