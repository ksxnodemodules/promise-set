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
  const mksum = (rsrj, rjrs, self) => new XPromise((...args) => {
    const {[rsrj]: resolvereject, [rjrs]: rejectresolve} = args
    const {size} = self
    const rsrjresult = new XSet()
    for (const promise of self) {
      promise.then(
        value => {
          rsrjresult.add(value)
          size === rsrjresult.size && resolvereject(rsrjresult)
        },
        rejectresolve
      )
    }
  })
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
      return mksum(0, 1, this)
    }
    get race () {
      return mksum(1, 0, this)
    }
    get normal () {
      return {
        map: (...args) => super.map(...args),
        filter: (...args) => super.filter(...args),
        __proto__: mkmap(this)
      }
    }
    mapExecutor (onfulfill = CALL_RESOLVE, onreject = CALL_REJECT) {
      return new this.constructor(
        ...super.map(
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
    map1fn (callback = RETURN) {
      return new this.mapExecutor(
        value => callback(value, 'fulfilled', this),
        reason => { throw callback(reason, 'rejected', this) }
      )
    map2fn (onfulfill = RETURN, onreject = THROW) {
      return this.mapExecutor(tryexec(onfulfill), tryexec(onreject))
    }
    map (...args) {
      return this.map2fn(...args)
    }
    filter (onfulfill = RETURN_TRUE, onreject = RETURN_TRUE) {
      let {size} = this
      const proto = super.map(
        promise => new Promise(
          (resolve, reject) => promise.then(
            value => onfulfill(value) ? resolve(value) : --size,
            error => onreject(error) ? reject(error) : --size
          )
        )
      )
      return mkmap({
        get size () {
          return size
        },
        __proto__: proto
      })
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
