'use strict'

const XIterable = require('x-iterable-base/template')
const {getPrototypeOf} = Object
const CALL_RESOLVE = (value, resolve) => resolve(value)
const CALL_REJECT = (value, resolve, reject) => reject(value)
const RETURN = x => x
const THROW = x => { throw x }
const RETURN_TRUE = () => true

function XPromiseSet (XPromise = Promise, XSet = Set) {
  const mkpromise = promise => {
    if (promise instanceof XPromise) {
      return promise
    }
    if (typeof promise === 'function') {
      return new XPromise(promise)
    }
    throw new TypeError('Cannot convert value to promise')
  }
  const mkmap = object => {
    const origin = getPrototypeOf(object)
    return {
      has: x => origin.has(x),
      delete: x => origin.delete(x),
      entries: () => origin.entries(),
      keys: () => origin.keys(),
      values: () => origin.values(),
      clear: () => origin.clear(),
      get size () { return origin.size },
      __proto__: object
    }
  }
  const tryexec = fn => (value, resolve, reject) => {
    try {
      resolve(fn(value))
    } catch (error) {
      reject(error)
    }
  }
  class PromiseSet extends XIterable(XSet) {
    constructor (...args) {
      super(args.map(mkpromise))
    }
    add (...args) {
      args.map(mkpromise).forEach(promise => super.add(promise))
      return this
    }
    delete (...args) {
      args.forEach(promise => super.delete(promise))
      return this
    }
    get all () {
      return XPromise.all(this)
    }
    get race () {
      return XPromise.race(this)
    }
    mapExecutor (onfulfill = CALL_RESOLVE, onreject = CALL_REJECT) {
      return mkmap(
        super.map(
          promise => new Promise(
            (resolve, reject) => promise.then(
              value =>
                onfulfill(value, resolve, reject),
              reason =>
                onreject(reason, resolve, reject)
            )
          )
        )
      )
    }
    map (onfulfill = RETURN, onreject = THROW) {
      return this.mapExecutor(tryexec(onfulfill), tryexec(onreject))
    }
    filter (onfulfill = RETURN_TRUE, onreject = RETURN_TRUE) {
      return mkmap(
        super.map(
          promise => new Promise(
            (resolve, reject) => promise.then(
              value => onfulfill(value) && resolve(value),
              error => onreject(error) && reject(error)
            )
          )
        )
      )
    }
    forEach (onfulfill, onreject) {
      this.map(onfulfill, onreject)
    }
    static get XPromiseSet () {
      return XPromiseSet
    }
    static get XPromise () {
      return XPromise
    }
    static get XSet () {
      return XSet
    }
  }
  return PromiseSet
}

module.exports = XPromiseSet
