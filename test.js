import { createStore, testT, testT2, injectStore, StoreObject } from ".";

createStore({
  a: 0,
  b: 'str',
  c: {
    init: 'aaaa',
    // get(value) { },
    //set(value, set) { },
    /** @param {string} a */
    // get(a) { },
    set(a, set) { return 5; },
  },
  d: {
    default: 5,

  },
  actions: {
    num: 0,
    str: '',
    obj: {},
    arr: [],
    /** @param {number} a */
    method: (a) => (a * a).toFixed(2),
    method2() { return Date.now() },
  },
  onGet() {
    return 'onGet';
  },
  /** @param {number} a */
  onGet2(a, _, _) {
  },
  onGet3() {
  },
  /**
   * type {number}
   * @param {number} value 
   */
  onSet(value) {
  },
  /**
   * @param {string} value 
   */
  onSet2(value, set) {
  },
}, {
  set(key, value, ins) {
  }
})


testT({
  num: 0,
  str: '',
  obj: {},
  arr: [],
  method: function () { },
})
testT({
  default: '',
  get(v) { }
})
testT(() => Date.now())
testT(
  /** @param {string} value  */
  (value) => { }
)
testT(
  /** @param {string} value  */
  (value, set) => {
    set(value);
    // return value;
  }
)


testT2({
  t2: {
    default: '',
    get(a) { }

  },
  t3: () => Date.now(),
  t4: /** @param {string} value  */
    (value) => value,
  /** 
   * @param {string} value
   * @param {number} set
    */
  t5: (value, set) => value,
  t6() { return Date.now() },
  onGet() {
    return 'onGet';
  },
  t7: function () { return Date.now() },
  t1: {
    num: 0,
    str: '',
    obj: {},
    arr: [],
    method: function () { },
  },
})

createStore({
  t1: {
    num: 0,
    str: '',
    obj: {},
    arr: [],
    method: function () { },
  },
  t2: {
    default: '',
    // get(value) {
    // }
  },
  t3: () => Date.now(),
  t4: /** @param {string} value  */
    (value) => { },
  /** @param {string} value  */
  t5: (value, set) => { },
  t6() { return Date.now() },
  onGet() {
    return 'onGet';
  },
})
