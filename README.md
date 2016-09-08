
# promise-set
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![dependencies status](https://david-dm.org/ksxnodemodules/promise-set.svg)](https://david-dm.org/ksxnodemodules/promise-set#info=dependencies)
[![devDependencies status](https://david-dm.org/ksxnodemodules/promise-set/dev-status.svg)](https://david-dm.org/ksxnodemodules/promise-set#info=devDependencies)
[![Travis CI](https://travis-ci.org/ksxnodemodules/promise-set.svg?branch=master)](https://travis-ci.org/ksxnodemodules/promise-set.svg?branch=master)
![downloads](https://img.shields.io/npm/dt/promise-set.svg)
![version](https://img.shields.io/npm/v/promise-set.svg)
[![license](https://img.shields.io/npm/l/promise-set.svg)](http://spdx.org/licenses/MIT)

## Requirements

 * ECMAScript 6 supports
  - V8 > 5.0.0
  - Node > 6.0.0
  - Chrome > 50.0.0

## Usage

### Import

#### `XPromiseSet`

There're two ways to import this class

```javascript
const XPromiseSet = require('promise-set/x')
```

```javascript
const {XPromiseSet} = require('promise-set')
```
Usage

```javascript
XPromiseSet(XPromise, XSet)
  // XPromise and XSet might be either es6 Promise and Set or custom classes or undefined
```

#### `PromiseSet`

It's just `XPromiseSet(Promise, Set)`

```javascript
const PromiseSet = require('promise-set')
```

### Methods

#### `.all()`

 * Arguments: None
 * Returns: A `XPromise` instance

Equivalent to [`XPromise::all`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

#### `.race()`

 * Arguments: None
 * Returns: A `XPromise` instance

Equivalent to [`XPromise::race`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

#### `.map(onfulfill, onreject)`

 * Arguments: Two functions `onfulfill` and `onreject` that take 1 argument and return value to resolve or throw exception to reject
 * Returns: Delivered object of 'this' (`PromiseSet` instance)

#### `.filter(onfulfill, onreject)`

 * Arguments: Two functions `onfulfill` and `onreject` that take 1 argument and return a boolean
 * Returns: Delivered object of 'this' (`PromiseSet` instance)

### Example

```javascript
const XPromiseSet = require('promise-set/x')
const MyPromiseSet = XPromiseSet(MyPromiseClass, MyIterableSetClass)
const promiseset = new MyPromiseSet(
  mypromiseexecutor, // fn (resolve: fn (?) -> void, reject: fn (?) -> void) -> void
  mypromiseobject, // instance of MyPromiseClass
  ...etc
)
promiseset
  .mapExecutor(
    onfulfill, // fn (val: ?, resolve: fn (?) -> void, reject: fn (?) -> void) -> void
    onreject
  )
  .map(
    onfulfill, // fn (val: ?) !> ? -> ?
    onreject
  )
  .filter(
    onfulfill, // fn (val: ?) -> bool
    onreject
  )
```
