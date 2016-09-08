'use strict'

const XIterable = require('x-iterable-base/template')

function XPromiseSet (XPromise = Promise, XSet = Set) {
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
    mapExecutor (onfulfill, onreject) {
      return super.map(
        promise => new Promise(
          (resolve, reject) => promise.then(
            value =>
              onfulfill(value, resolve, reject),
            reason =>
              onreject(reason, resolve, reject)
          )
        )
      )
    }
    map (onfulfill, onreject) {
      return this.mapExecutor(tryexec(onfulfill), tryexec(onreject))
    }
    filter (onfulfill, onreject) {
      return super.map(
        promise => new Promise(
          (resolve, reject) => promise.then(
            value => onfulfill(value) && resolve(value),
            error => onreject(error) && reject(error)
          )
        )
      )
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
  function mkpromise (promise) {
    if (promise instanceof XPromise) {
      return promise
    }
    if (typeof promise === 'function') {
      return new XPromise(promise)
    }
    throw new TypeError('Cannot convert value to promise')
  }
  return PromiseSet
}

module.exports = XPromiseSet
