
# promise-set
Manipulate promises with map and filter

## Requirements

 * ECMAScript 6 supports
  - V8 > 5.0.0
  - Node > 6.0.0
  - Chrome > 50.0.0

## Usage

### `XPromiseSet`

```javascript
const XPromiseSet = require('promise-set/x')
const MyPromiseSet = XPromiseSet(MyPromiseClass, MySetClass)
const promiseset = new MyPromiseSet(
  (resolve, reject) => {
    dostuff(resolve, reject)
  },
  mypromiseobject, // instance of MyPromiseClass
  ...etc
)
promiseset
  .mapExecutor(
    value => whatifresolved(value),
    error => whatifrejected(error)
  )
```

# UNDER DEVELOPMENT...
