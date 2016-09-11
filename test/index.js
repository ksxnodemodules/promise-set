'use strict'

const PromiseSet = require('..')
const {XPromiseSet} = PromiseSet

class CompatibilityError extends Error {
  get name () {
    return 'CompatibilityError'
  }
}

function testnormal (CPrmSet = PromiseSet) {
  const prmset = new CPrmSet()
  console.log(prmset)
}

function testadvance () {
  testnormal(XPromiseSet(Promise, Set))
}

if (XPromiseSet !== require('../x')) {
  throw new CompatibilityError("`require('promise-set').XPromiseSet` must return 'require('x-promise-set/x')'")
}

console.log('Testing PromiseSet...')
testnormal()
console.log('Testing XPromiseSet...')
testadvance()
