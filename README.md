# ee-vuex

ee-vuex is the global state manager for Vue3, which allows for shared state across components/pages.

"ee" represents **Encapsulated** and **Easy**, making developers' code more concise.

### 1. Use Case
Global state is typically used for:
1. Sharing data across components
  - Logged in user information
  - User Settings
  - Language Preference
2. Data needs to be passed between components
  - Filter Condition
  - Load Status
3. Caching enumerated data
  - Fixed drop-down options
  - Supported Languages

A complete application that includes registration and login generally requires global state

ee-vuex also recommends defining a store in the Vue component with an Options API style to replace data, computed, watch, and even props. Please refer to the [data Store](#22-data-store) and [props Store](#23-props-store) for details

### 2. Why use ee-vuex
Vuex or Pinia are generally used in Vue projects to manage global states, which are the two most widely used global state management libraries recommended by Vue
- vuex: https://vuex.vuejs.org/
- pinia: https://pinia.web3doc.top/core-concepts/

Vuex was the first library to be launched, and after the emergence of Vue3, Pinia gradually replaced Vuex

For a comparison between Pinia and Vuex, please refer to Pinia's official documentation https://pinia.web3doc.top/introduction.html#%E4%B8%8E-vuex-%E7%9A%84%E6%AF%94%E8%BE%83

When defining stores, Vuex and Pinia both include three core concepts: State, Getter, and Action, which are equivalent to data, computed, and method in components

ee-vuex simplifies or unifies these core concepts, and the core of ee-vuex has and only has [properties](#definition-core)

Programmers who have used ORM or OOP languages such as C# and Java should be aware that when defining encapsulation types, we typically only
- Property: used to get/set data, equivalent to computed get and set, and a data variable that is only visible within the component
```
public partial class People
{
  private string name;
  private int age;

  public string Name
  {
    get { return name; }
    set { name = value; }
  }

  public int Age
  {
    get { return age; }
    set { age = value; }
  }
}
```

- Method: used to manipulate data, equivalent to methods
```
public partial class People
{
  public void Grow()
  {
    this.Age++;
  }
}
```

Vue defines components much like object-oriented definition types. ee-vuex adopts an object-oriented design approach, using Vue3's newly introduced ref, reactive, and computed methods to define stores and states. This is different from Vuex, Pinia, and even Vue's own design approach

ee-vuex has the following **advantages**:
- More **clear and concise definition**: A state is an object, rather than being defined in multiple objects such as state and getters
- More **simple and convenient to use**: No need for methods such as mapGetters and mapState, no need for methods such as commit and dispatch, just call and assign states directly
- **v-model**: You can use global state directly with the v-model
- **cache**: Computed cache can be used to improve get efficiency when attribute values remain unchanged

Not only that, but there are more convenient and powerful aspects of ee-vuex. Please see [Definition Core](#definition-core) in detail

You can first compare the core concepts of Vuex with ee-vuex through the table below, or directly refer to [Usage](#usage) to list the usage of ee-vuex

||vuex|ee-vuex(computed)|
|-|-|-|
state|- **Definition**<br>state:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;value,<br>}<br>-&nbsp;**Invoke**<br>\$store.state.key|- **Definition**<br>key:&nbsp;value<br>-&nbsp;**Invoke**<br>\$store.key|
getters|- **Definition**<br>getters:&nbsp;{<br>&nbsp;&nbsp;key(state)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;state.key<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**Invoke**<br>\$store.getters.key|- **Definition**<br>key()&nbsp;{}<br>-&nbsp;**Invoke**<br>\$store.key|
mutations|- **Definition**<br>mutations:&nbsp;{<br>&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value&nbsp;*&nbsp;2<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**Invoke**<br>\$store.commit("key",&nbsp;value)|- **Definition**<br>key(value)&nbsp;{&nbsp;<br>&nbsp;&nbsp;return&nbsp;value&nbsp;*&nbsp;2&nbsp;<br>}<br>-&nbsp;**Invoke**<br>\$store.key&nbsp;=&nbsp;value|
actions|- **Definition**<br>actions:&nbsp;{<br>&nbsp;&nbsp;async&nbsp;key({commit},&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(),&nbsp;1000)<br>&nbsp;&nbsp;&nbsp;&nbsp;})<br>&nbsp;&nbsp;&nbsp;&nbsp;commit("key",&nbsp;value)<br>&nbsp;&nbsp;}<br>}<br>-&nbsp;**Invoke**<br>\$store.dispatch("key",&nbsp;value)|- **Definition**<br>async&nbsp;key(value)&nbsp;{<br>&nbsp;&nbsp;return&nbsp;await&nbsp;new&nbsp;Promise(r&nbsp;=>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;setTimeout(()&nbsp;=>&nbsp;r(value)<br>&nbsp;&nbsp;&nbsp;&nbsp;,&nbsp;1000)<br>&nbsp;&nbsp;})<br>}<br>-&nbsp;**Invoke**<br>\$store.key&nbsp;=&nbsp;value|
module|- **Definition**<br>const&nbsp;moduleA&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'a'&nbsp;}<br>}<br>const&nbsp;moduleB&nbsp;=&nbsp;{<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;'b'&nbsp;}<br>}<br>createStore({<br>&nbsp;&nbsp;modules:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;a:&nbsp;moduleA,<br>&nbsp;&nbsp;&nbsp;&nbsp;b:&nbsp;moduleB<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**Invoke**<br>\$store.state.a.key<br>\$store.state.b.key|- **Definition**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'a'<br>},&nbsp;'\$a')<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;'b'<br>},&nbsp;'\$b')<br>-&nbsp;**Invoke**<br>\$a.key<br>\$b.key|
v-model|- **Definition**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;key:&nbsp;undefined&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})<br>-&nbsp;**Invoke**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="key"&nbsp;/><br></template><br>...<br>computed:&nbsp;{<br>&nbsp;&nbsp;key:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;get&nbsp;()&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return&nbsp;this.\$store.state.key<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;set&nbsp;(value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.\$store.commit('key',&nbsp;value)<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}<br>|- **Definition**<br>createStore({<br>&nbsp;&nbsp;key:&nbsp;undefined<br>},&nbsp;'\$store')<br>-&nbsp;**Invoke**<br><template><br>&nbsp;&nbsp;<input&nbsp;type="text"&nbsp;v-model="\$store.key"&nbsp;/><br></template><br>...|
localStorage|- **Definition**<br>createStore({<br>&nbsp;&nbsp;state:&nbsp;{&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;key:&nbsp;JSON.parse(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.getItem('key'))<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;mutations:&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;key(state,&nbsp;value)&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.key&nbsp;=&nbsp;value<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;localStorage.setItem('key',&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSON.stringify(value))<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>})|- **Definition**<br>createStore({&nbsp;key:&nbsp;{&nbsp;p:&nbsp;1,&nbsp;}&nbsp;})|


## Installation

```
npm install ee-vuex
```

## Usage

### 1. Basic Usage

Here is an example of using counters that are both available in Vuex and Pinia
```
// stores/counter.js
import { createStore } from 'ee-vuex'

export default createStore({
  count: 1,
}, "$ee")
```

Define the store and use it in a component
```
// Import Store
// import $ee from '@/stores/counter'
// or
// import eeVuex from 'ee-vuex'
// const { $ee } = eeVuex // or const $ee = eeVuex.$ee
// or(Recommended)
const { $ee } = require('ee-vuex').default

export default {
  setup() {
    console.log($ee.count) // -> 1
    $ee.count++
    console.log($ee.count) // -> 2
    // Return the store instance to use it in the template
    return { $ee }
  },
}
```

The Options API makes it easier to use the ee-vuex. You can globally register the store with the Vue instance at the entrance, so there is no need to repeatedly import the store for each component
```
// main.js
import { createApp } from 'vue'
import $ee from './stores/counter.js'

createApp({ /* Component */ })
  // Global Registration Store
  .use($ee)
  .mount('#app')
```

Using globally registered stores in components defined by Options APIs
```
export default {
  mounted() {
    console.log(this.$ee);
  }
}
```

Using global states in templates is also very simple
```
<template>
  <div @click="$ee.count++">{{ $ee.count }}</div>
  <input v-model="$ee.count" />
</template>
```

### 2. Advanced Usage

The second parameter of createStore can give the store created by ee-vuex more advanced usage
```
import { createStore } from 'ee-vuex'

// It can directly represent the store name as a string
export default createStore({}, "$ee")

// Or it can be an object that provides a more detailed definition
// of the special usage of the store
export default createStore({}, 
{
  name: "$ee",
  this: undefined,
  set(key, value, store) { },
})
```
- name: The name of the store
- this: When calling the get/set/default method, this points to the store instance by default
- set: Callback after assigning a property

Please refer to the following examples for the specific usage of these configurations

#### 2.1 Multiple Stores
- Store names can distinguish instances of stores
- All named stores can be registered at once using the default object returned by ee-vuex
```
import { createApp } from 'vue'
import ee, { createStore } from 'ee-vuex'

const vue = createApp({ /* Component */ });

// Create and register stores one by one
// vue.use(createStore({}, "$store1"))
// vue.use(createStore({}, "$store2"))
// vue.use(createStore({}, "$store3"))

// Create stores one by one
// Register all named stores at once (recommended)
createStore({}, "$store1")
createStore({}, "$store2")
createStore({}, "$store3")
vue.use(ee);

// Non named store, you need to save the store instance yourself
// Calling vue.use(store) has no effect
const store = createStore({});
```

In the Vue component, the instance of the store can be obtained through the name
```
<template>
  <div>{{ $store1 }}</div>
  <div>{{ $store2 }}</div>
  <div>{{ $store3 }}</div>
</template>
```

#### 2.2 data Store
It is recommended to skip this chapter first and read through [Define Core](#definition-core) to understand the convenience of defining states in ee-vuex before returning here

Please ensure that you have understood the following points before reading this chapter
- Understand the Options API
- Understand the [Basic Usage](#1-basic-usage) of ee-vuex
- ee-vuex can create [Multiple Stores](#21-multiple-stores) through createStore
- ee-vuex uses [Object-Oriented Design Approach](#2-why-use-ee-vuex) to [Define Store States](#definition-core)

Local stores are created in Vue components to replace data, computed, and watch
```
import { createStore } from 'ee-vuex'

export default {
  data() {
    // Same usage as global stores
    // example: this.$ee.count
    return { 
      $ee: createStore({ 
        count: {
          default: this.modelValue,
          set(value) {
            this.$emit("update:modelValue", value);
          }
        }
      },
      {
        // Local stores do not require setting a store name
        // Local stores this should point to the instance of Vue component
        this: this
      })
    }

    // No need for a store instance
    // the store instance is just the component instance
    // example: this.count, Compared to the above usage methods
    // the $ee store instance is no longer needed
    // return createStore({ ... }, { ... })
  },
  props: ['modelValue'],
  watch: {
    // The ee-vuex can only replace data and computed
    // and a watch is still required for changes in props
    modelValue(value) {
      this.$ee.count = value;
    }
  }
}
```

#### 2.3 props Store
Please ensure that you have read and understood the [data Store](#22-data-store)

In the example of a data store, props are still not encapsulated into the store. The props in Vue are unidirectional data streams, and when using the v-model, it can also be considered bidirectional. For object-oriented applications, there is no externally assignable and internally read-only data like props. Both external and internal values can be assigned, and the assignment effect should be consistent

This example uses injectStore to encapsulate the props together, making them conform to object-oriented design principles
```
// hello-ee-vuex.vue
import { injectStore } from 'ee-vuex'

// Export Component Call injectStore
export default injectStore({
  props: {
    count: {
      // There are two ways to define props: ee-vuex and original props
      // ee-vuex: get, set, p, default
      // props: type, required, validator, default
      type: Number,
      // Because there are both default methods
      // both default methods will take effect
      default: 0,
    },
  },
})
```
Props can be defined using either the original definition of props or the [Definition Method](#definition-core) in ee-vuex

At this point, the props are **read-write** **bidirectional**, and the usage method is as follows

- Component internal: props become writable and can be directly assigned values
```
<!-- The template can be directly assigned values --> 
<template>
  <p @click="count++">{{ count }}</p>
  <input v-model="count" />
</template>

...

// JavaScript can also directly assign values
mounted() {
  this.count = 5;
}
```

- Component external: used as before
```
<template>
  <hello-ee-vuex v-model="myCount" @click="myCount++" />
  <p>{{ myCount }}</p>
</template>

<script>
export default {
  data() {
    return {
      myCount: 5,
    }
  }
}
</script>
```

At this point, the internal component's p and input, and the external component's p will synchronously display the same data. And when both internal and external components click on the p tag, both components can see data increment

#### 2.4 set
Set can record the assignment operations of all store states in the log
```
import { createStore } from 'ee-vuex'

export default createStore({
  count: 0,
  name: 'Hello World',
}, {
  set(key, value, store) {
    // count -> 0
    // name -> Hello World
    console.log(key, " -> ", value);
  }
})
```

## Definition Core

In the store definition of ee vuex, a state is an object that contains the following 4 fields
- default: State's [(Default Value)](#1-default-value)
- p: Automatically set and restore state values using localStorage[(Persistence)](#2-persistence)
- get: Triggered when obtaining state[(Get Function)](#3-get-function)
- set: Triggered when assigning a status[(Set Function)](#4-set-function)

And when you only want to customize one of these fields, there will also be a corresponding **concise definition** method.

For the benefits of defining states in this way, please refer to [Advantages of ee-vuex](#2-why-use-ee-vuex)

The following example code is written in the Create Store reference [Basic Usage](#1-basic-usage)
```
import { createStore } from 'ee-vuex'
createStore({
  // The following example code should be written in this object
})
```

### 1. Default Value
The common default values are easy to understand, just look at the following code examples.

The default value of ee-vuex is very useful for asynchronous [caching enumerated data](#1-use-case).

For example, our page supports multiple languages, and the type of language needs to be asynchronously obtained from the backend through the API. The data is an array.

Before asynchronously obtaining data, we want the value of the state to be an empty array, so that the page can be directly used in a v-for loop without tedious v-if judgment.

In the above example, the status default value should have the following characteristics:
- There are 2 default values
- Initially, the default value is an empty array
- Replace default values after api asynchronously obtains data

The default value of ee-vuex has the following characteristics to meet the above requirements
- **Support Array**: Multiple default values can be set
- **Supports Asynchronous**: The array element can be an asynchronous Promise, which accesses the API to obtain values. Multiple asynchronous elements perform **queue operations**
- **Support Lazy Loading**: **First get** will **Trigger once** an assignment of the default value, which can save performance and memory

For specific implementation, please see the following example of **multiple default values**

<hr>

- General Definition: Field *default*
```
key: {
  default: undefined,
}
```

- Concise Definition: Write values directly
```
key: undefined
```

The default value supports a wide range of types. The following example codes provide examples one by one
- Normal value: directly assign a value
```
key: 1
key: true
key: "ee-vuex"
key: new Date()
```

- Function: You can use methods to return default values, and support asynchronous methods and Promises. Note: Please use arrow functions for concise definitions, otherwise they will be considered as [get function](#3-get-function) or [set function](#4-set-function).
```
// Direct return value: ee-vuex
key: () => "ee-vuex"
// Asynchronous Promise return value: 
// undefined 2 seconds ago, ee-vuex 2 seconds later
key: () => new Promise(resolve => {
  setTimeout(() => {
    resolve("ee-vuex")
  }, 2000)
})
// The async method return value:
// undefined 2 seconds ago, 10000 after 2 seconds
key: async () => {
  // Get values asynchronously
  const value = await new Promise(
    resolve => {
      setTimeout(() => {
        resolve(100)
      }, 2000)
    })
  // You can customize values
  return value * value;
}
// NG: Will be considered a get function, with the default value undefined
key: function() { return 5 }
```

- Object: When using a simple definition, it is necessary to distinguish it from the object defined by the state. It cannot contain any of p, default, get, or set
```
// OK: Default value is object
key: {
  name: 'ee-vuex',
  isCool: true,
}
// NG: The default value is true
key: {
  name: 'ee-vuex',
  // Contains default
  default: true,
}
// When you want to include objects with p, default, get, and set fields
// you can use Function or do not use concise definitions.
// OK: Use Function to return a value. The default value is the object
key: () => {
  return {
    name: 'ee-vuex',
    default: true,
  }
}
// OK: Use general definitions, with the default value being the object
key: {
  default: {
    name: 'ee-vuex',
    default: true,
  }
}
```

- Multiple default values: Use an array. The elements in the array support all of the above types. When asynchronous, assign values from the front to the back queue
```
// Two seconds ago [], two seconds later [1,2,3], and two seconds later [4,5,6]
key: [[],
  () => new Promise(r => {
    setTimeout(() => {
      r([1, 2, 3])
    }, 2000)
  }),
  () => new Promise(r => {
    setTimeout(() => {
      r([4, 5, 6])
    }, 2000)
  }),
]
// Note that when you want the default value to be an array
// you need to nest the array or use a Function
// whether it is a general definition or a concise definition
// NG: The default value is 3
key: [1, 2, 3]
// OK: Multiple default values, using the first default value, default value []
key: [[]]
// OK: Function return value []
key: () => []
```
### 2. Persistent
The value of the store state is stored in memory, and when we refresh the page, the value of the status will be cleared.

Persistence is when we want to refresh a page, the value of the state remains the value of the last run. It can be used in scenarios such as login tokens, user selected languages, and so on.

Generally, we will save the state of the store to localStorage, read it out during initialization, and write it in during set.

Persistence is a very common function for stores, so ee-vuex adds simple configurations to assist in implementation without having to implement persistence repeatedly.

Using persistence requires attention:
- Priority is given to reading the value of localStorage. If there is a value, [Default Value](#1-default-value) will be ignored
- The saved key is the name of the state, and modification is temporarily not supported. Please note that it does not have the same name as other localStorage content in your project

<hr>

- General Definition: Field *p*. 'p' is an acronym for Persistent, which is used because it is too difficult to remember
```
token: { p: 1 }
```

- Concise Definition: Directly assign a value to localStorage
```
token: localStorage
```

- Custom Implementation: It can also be easily implemented using [Default Value](#1-default-value) and [Set Function](#4-set-function)
```
token: {
  default: () => JSON.parse(localStorage.getItem('token')),
  set(value) {
    if (value)
      localStorage.setItem('token', JSON.stringify(value));
    else
      localStorage.removeItem(key);
  }
}
```
### 3. Get Function
Like the Vue component computed get, it is a function. The ee-vuex get function supports asynchronous return of Promise.

When Promise is returned, and Promise completes and returns a non null value, set will be called to set the return value to the status.

This is useful when it is necessary to automatically and asynchronously obtain values during get, such as the [Login](#login) example in actual combat.

The difference from the default value is that the default value is only set once and does not change. However, in the case where the login example allows logout, the next time you log in to another account, you may need to retrieve the value asynchronously. At this time, it should be more convenient to use asynchronous get.

<hr>

- General Definition: Field *get*. The first parameter obtains the current status value. Note that computed will refresh the cache of the get when the value is updated, and using this.key in the get function will still obtain the cached value
```
key: {
  get(value) {
    // this.key can only obtain cached values
    console.log("value", value, "oldvalue", this.key)
  }
}
```

- Concise Definition: Note that the number of parameters should not be confused with [Set Function](#4-set-function), and that arrow functions should not be used to prevent confusion with [Default Value](#1-default-value)
```
key() {}
// OK: Parameter required, please write one more useless parameter
key(value, x) {}
// OK: Can be defined by function
key: function() {}
// NG: The arrow function cannot be used and will be considered the default value
key: () => {}
```

- Asynchronous: The return value of an asynchronous promise is directly set to the state, causing a state change. The computed cache becomes invalid. If it is a template reference state, the state will be obtained again. Therefore, it is important to use judgment to prevent multiple asynchronous values from causing a dead cycle
```
// When obtaining a key after setting the token,
// an undefined value is returned 2 seconds ago,
// and the same value as the token is returned 2 seconds later
token: undefined,
async key(value, x) {
  // Pay attention to adding judgment to assign values
  // when there is no value,
  // to prevent multiple asynchronous values
  if (this.token && !value) {
    return await new Promise(r => {
      setTimeout(() => {
        r(this.token)
      }, 2000)
    })
  }
}
```
### 4. Set Function
Like the Vue component computed set, it is a function. Similarly, the ee-vuex set function also supports asynchronism, like the Actions of vuex and pinia.

It should be noted that:
- Set will not be called when the same value is set
```
// Define state
key: {
  default: 1,
  set(value) {
    console.log("new value", value)
  }
}

// Vue Component
mounted() {
  // 'new value 1' will not be output on the console
  this.$store.key = 1;
}
```
- When the status has [Default Value](#1-default-value), the default value is assigned when getting. If you manually set the value before getting, the default value will be ignored during get to ensure that the value you set is not overwritten by the default value. However, if your default value contains asynchronism and is already executing, then set cannot stop the executing asynchronous operation, which may cause the asynchronous default value to overwrite your set value. Please try not to design the state in this way.
```
// Define state
key: [1, () => new Promise(r => {
    setTimeout(() => {
      r(3)
    }, 2000)
  })]

// Vue Component
// Example 1: set before get
mounted() {
  // Set first
  // the value of key is 2, and the default value will no longer be valid
  this.$store.key = 2;
  console.log(this.$store.key); // output 2
  // The default value is no longer valid,
  // and the subsequent key values are consistently 2
  setTimeout(() => {
    console.log(this.$store.key); // output 2
  }, 3000)
}
// Example 2: get before set
mounted() {
  // Get first
  // the default value of 1 has been set, and Promise is already being executed
  console.log(this.$store.key); // output 1
  // Set the key to 2
  this.$store.key = 2;
  console.log(this.$store.key); // output 2
  // Promise is already executing, and set cannot be interrupted.
  // After 2 seconds, the key will change to the asynchronous default value of 3
  setTimeout(() => {
    console.log(this.$store.key); // output 3
  }, 3000)
}
```
- When calling the set function, the value has not been actually assigned to the state, so calling get within the set function cannot obtain the latest value. If you need to get the value of the state itself in the set function, you can use setTimeout to delay the call
```
key(value) {
  // If the value is 1, 'value 1 oldvalue undefined' will be output
  console.log("value", value, "oldvalue", this.key)
  // output '$store.key: undefined'
  api();
  setTimeout(() => {
    // output '$store.key: 1'
    api();
  })
}

// The API method prints the value of the store state key
const api = () => {
  console.log("$store.key:", $store.key)
}
```

<hr>

- General Definition: Field set. The parameter is the currently set value
```
key: {
  set(value) {}
}
```

- Concise Definition: Note that only one parameter is considered a set function, even if it is an arrow function
```
key(value) {}
// Can be defined by function
key: function(value) {}
// Can be defined by arrow function
key: (value) => {}
```

- Return Value: When calling set, the value has not been actually set to the state. You can determine the final state value by returning a non null value
```
// For example, the value is 2, and the final key value is 4
key(value) {
  return value * value;
}
```

- Asynchronous: Asynchronous is the same as the [Get Function](#3-get-function). Set asynchrony can be used, for example, when synchronous settings are required to the server. Using catch can prevent this assignment
```
// If Promise is successful, the local and server values will remain consistent.
// If Promise is incorrect, this assignment will fail.
async lauguage(value) {
  await api.setLanguage(value);
  console.log("Successfully synchronized value with the server")
},
```
### Complete Example
```
import { createStore } from 'ee-vuex'
import { api } from './your-api-js'

createStore({
  // (Complete Example)The token of the logged in user
  token: {
    p: 1,
    default: "",
    get(value) { return 'bearer ' + value; },
    set(value) {
      if (!value)
        this.user = undefined;
    }
  },
  // (get example)Login user information:
  // Obtain from the background when there is no data,
  // and return an empty object before obtaining
  user(value, x) {
    if (!value && this.token)
      return api.getUser();
    return value || {};
  },
  // (default value example)All languages: Get all languages from the background
  languages: [[], () => api.getLanguages()],
  // (set example)User setting language: default en, and can be persistent
  language: {
    default: "en",
    p: 1,
    async set(value) {
      // Notify the server user to choose the language to use
      await api.setLanguage(value);
      console.log("Successfully synchronized value with the server")
    }
  },
})
```

## More Example

### Login

1. After the user logs in, they have a token that needs to be persisted, and the get of the token needs to be prefixed with 'bearer '
2. Use token to obtain user information from the background interface when calling user for the first time
3. The token and user will be cleared after the user logs out

- vuex

```
import { createStore } from 'vuex'

const store = createStore({
  state: {
    // Restore the persistent token as the default value
    token: localStorage.getItem('token'),
    user: undefined,
  },
  getters:{
    token(state) {
      return 'bearer ' + state.token;
    },
    user(state) {
      if (!state.user && state.token) {
        // Obtain user information through the API, using setTimeout instead
        // Problem 1. If the template references getters.user in multiple places,
        // the asynchronous request will be triggered multiple times
        // before the asynchronous request ends and the user is obtained
        setTimeout(() => {
          // Problem 2. Cannot use this in getters
          // to point to the current instance of the store
          store.commit('setUser', { name: 'UserName' })
        }, 5000)
      }
      // Let the API return an empty object
      // before obtaining user information to prevent empty references
      return state.user || {};
    },
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      if (token) {
        // Persisting the token
        localStorage.setItem('token', token)
      } else {
        // Clear the token and also clear the user information together
        localStorage.removeItem('token');
        this.commit('setUser', undefined);
      }
    },
    setUser(state, user){
      state.user = user;
      // Problem 3. Regardless of clearing token or user,
      // the other state should be cleared together,
      // but clearing each other can lead to a dead cycle
      if (!user)
        this.commit('setToken', undefined);
    },
  },
})

export default store;
```

Problems with **vuex**

1. Get asynchronously obtains data and sets it. When getting multiple times, obtaining data asynchronously multiple times can cause performance losses
2. When it is necessary to set other states under get, it is inconvenient to call the scope without this
3. Setting the same value will also execute set, and setting back and forth will cause a dead loop
4. A state needs to be defined three times (state, getters, mutations), and the code is not concise

- ee-vuex

```
import { createStore } from 'ee-vuex'

export default createStore({
  token: {
    p: true,
    get(value) {
      return 'bearer ' + value;
    },
    set(value) {
      // Clear the token and also clear the user information together
      if (!value)
        this.user = undefined;
    }
  },
  user: {
    get(value) {
      if (!value) {
        // Obtain user information through the API, using setTimeout instead
        // Comparison 1. If the template references a user in multiple places,
        // only one asynchronous request will be triggered
        // Because the user value has not changed,
        // the computed feature returns the cached value of the user
        setTimeout(() => {
          // Comparison 2. This can also be used in get
          // to point to the current instance of the store
          this.user = { name: 'UserName' };
        }, 5000)
      }
    },
    set(value) {
      if (!value) {
        // Comparison 3. Regardless of clearing token or user,
        // the other state should be cleared together,
        // and mutual clearing will not lead to a dead cycle
        // Because of the same value as set,
        // the set method will not be triggered,
        // similar to the Vue component's watch
        if (!user)
          this.commit('setToken', undefined);
        // Let the API return an empty object
        // before obtaining user information to prevent empty references
        return {};
      }
    }
  },
})
```

The code indicates a comparison between **ee-vuex**

1. Get asynchronously obtains data and sets it. When getting multiple times, the cache will be returned to improve line performance
2. When other states need to be set under get, the scope can be pointed to itself using this
3. Setting the same value does not execute set, and round-trip sets do not cause a dead loop
4. A state only defines one object, and the code is concise