import { createStore, injectStore } from "./index.js";
import { defineComponent } from "vue";

const comp = injectStore({
    /**
     * @type {import('vue').SlotsType<{
     *  default: { value: string }
     * }>}
     */
    slots: {},
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
            get(value) {},
        },
        testValue: '',
        /** 测试 vue 属性 */
        test2: [Number, String],
        /** default value */
        test3: {
            default: () => [0],
        }
    },
    mounted() {
        // this.$props.
        // this.$emit('update:testValue', )
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