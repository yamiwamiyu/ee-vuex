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
        bool: Boolean,
        required: {
            type: String,
            required: true,
        },

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
        vuexNilObj: {},
        /** 直接赋值 */
        vuexKeyword: '',
    },
    data() {
        // this.$props.
        return {}
    },
    mounted() {
        // this.$props.
        // this.$emit('', )
    },
    setup(props, ctx) {
        // props.
        ctx.emit('')
    }
});

/** @type {InstanceType<typeof comp>['$props']} */
const a = {
}

const store = createStore({
    nulGet: {
        get() { }
    },
    asyncGetOnly: {
        /** @param {string} value  */
        async get(value) { return 5 }
    },
    asyncSetOnly: {
        /** @param {string} value  */
        async set(value) {  }
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
    /**
     * @param {string} value 
     */
    async asyncGet(value, set) {
        await new Promise(r => resolve(''))

    }
})

const store3 = createStore({
    vuexInit: 1,
    vuexNilObj: {},
    // vuexDefault: () => 'abc',
    // vuexGet() { return 'abc' },
    // // 下面注释掉，就会触发 TS 的 bug 导致函数相关类型推导不正确
    // /** @param {} value  */
    // vuexSet(value, set) { return ''; },
    // /** @param {boolean} value */
    // vuexSet2(value, set) { },
    vuexGetOnly: { get() { return 5 } },
    vuexSetOnly: {
        /** @param {string} value */
        set(value) { }
    },
    vuexObj: { init: '' },
    vuexFull: {
        init: { a: '', b: 0 },
        set(value, set) {}
    },
})