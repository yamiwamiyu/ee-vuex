import { injectStore, createStore } from "."

injectStore({
    data() {
        return {
            a: 'a',
            b: 0,
        }
    },
    props: {
        test: {
            init: 5,
        },
        test2: String,
    },
    mounted() {
        this.test
    }
})

createStore({
    hasGet: {
        init: 0,
        get(value) {
        }
    },
    unknown() { return '' }
})