'use strict'

const {dirname} = require('path')
const PromiseSet = require(dirname(__dirname))
const {XPromiseSet} = PromiseSet

function testnormal (CPrmSet = PromiseSet) {
  const prmset = new CPrmSet()
  console.log(prmset)
}

function testadvance () {
  testnormal(XPromiseSet(Promise, Set))
}

console.log('Testing PromiseSet...')
testnormal()
console.log('Testing XPromiseSet...')
testadvance()
