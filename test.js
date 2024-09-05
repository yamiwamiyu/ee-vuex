import { createStore, injectStore } from "./index.js";
import { defineComponent } from "vue";

async function testAsyncFunc() {
    /** @type {number} */
    const value = await new Promise(resolve => {
        resolve(5);
    });
    return value;
}

const comp = injectStore({
    data() {
        return {} 
    },
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
        click: (value, value2) => { },
        'update:modelValue': () => { },
    },
    props: {
        /** @type {import('vue').PropType<{test:string}>} */
        vueNull: null,
        /** 测试 vue 属性 */
        vueConsArr: [Number, String],
        vueCons: String,

        /** 测试 ee-vuex 属性 */
        vuexInit: {
            init: { account: 'a', password: 'b' },

            get(value) { },
        },
        vuexDefault: {
            default: testAsyncFunc,
            get(value) { },
        },
        vuexGet() {
            return '';
        },
        /** @param {unknown} value */
        vuexSet(value, set) {
            return ''
        },
        vuexGetOnly: { get() { return 5 } },
        vuexSetOnly: { 
            /** @param {string} value */
            set(value) { }
        },
        vuexNilObj: {}
    },
    mounted() {
        // this.$props.
        // this.$emit('', )
    },
    setup(props, ctx) {
        ctx.emit('')
    }
});

const store = createStore({
    nulGet: {
        get() { }
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
    dvalue: () => [0],
})

const store3 = createStore({
    vuexDefault: () => 'abc',
    vuexGet() { return 'abc' },
    vuexSet(value, set) { return ''; },
    /** @param {boolean} value */
    vuexSet2(value, set) {},
    vuexGetOnly: { get() { return 5 } },
    vuexSetOnly: { 
        /** @param {string} value */
        set(value) { }
    },
    vuexNilObj: {}
})