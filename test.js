import { injectStore, createStore } from "."

injectStore({
    data() {
        return {
            /** 注释a */
            a: 'a',
            b: 0,
        }
    },
    props: {
        /** 测试 ee-vuex 属性 */
        test: {
            init: 5,
        },
        /** 测试 vue 属性 */
        test2: String,
    },
    mounted() {
        this.test2
    }
})

createStore({
    nulGet: {
        get() {}
    },
    hasGet: {
        init: '',
        set(value) {
        },
    },
    unknown() { return '' },
    test1() { return Date.now() },
    /**
     * @param {string} a 
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