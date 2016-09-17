'use strict'

const {exit} = require('process')
const assert = require('assert')
const compareSet = require('set-comparision')
const {XIterable} = require('x-iterable-base')
const PromiseSet = require('..')
const fn2rsrj = require('./lib/fn-to-rs-rj.js')
const strset = require('./lib/set-to-str.js')
const countpromise = require('./lib/count-prm-set.js')
const {console} = global
const {XPromiseSet} = PromiseSet
const CSet = XIterable(Set)
const {fromCharCode} = String

class ExpectationError extends Error {
  get name () {
    return 'ExpectationError'
  }
}

function assertSetEquality (actual, expect, act) {
  console.log(`After ${act}:\n\t - Expectation: ${strset(expect)}\n\t - Reality: ${strset(actual)}`)
  assert(compareSet(actual, expect), 'Assertion Result: failed.')
  console.log('Assertion Result: passed.')
}

function testproc (CPrmSet, testname) {
  const {XPromise} = CPrmSet
  const step = (object, initcount, ...prevexpect) => {
    console.log(`Step ${initcount} has been started:`, object)
    return {
      nextStep: (act, expect) => {
        const count = initcount + 1
        const currentexpect = prevexpect.map(expect)
        const pass = () => {
          console.log(`Passed step ${count}`)
        }
        const fail = error => {
          console.error(`Failed at Step ${count} of Test '${testname}'`)
          console.error(error)
          setTimeout(exit, 0, 1)
        }
        try {
          const nextObject = act(object, step)
          new Promise(
            (resolve, reject) =>
              assertResultSet({object: nextObject, resolve, reject}, ...currentexpect)
          )
            .then(pass)
            .catch(fail)
          return step(nextObject, count, ...currentexpect)
        } catch (error) {
          fail(error)
        }
      },
      __proto__: null
    }
  }
  step(
    new CPrmSet(
      ...[...'abcdef'].map(x => new XPromise(f => f(x))),
      ...[...'ghijkl'].map(x => new XPromise((f, g) => g(x))),
      ...[...'ABCDEF'].map(x => f => f(x)),
      ...[...'GHIJKL'].map(x => (f, g) => g(x))
    ),
    0,
    new CSet('abcdefABCDEF'),
    new CSet('ghijklGHIJKL')
  )
    .nextStep(
      prmset =>
        prmset.map(...fn2rsrj(x => x.charCodeAt())),
      expectation =>
        expectation.map(x => x.charCodeAt())
    )
    .nextStep(
      prmset =>
        prmset.filter(...fn2rsrj(x => x & 1)),
      expectation =>
        expectation.filter(x => x & 1)
    )
    .nextStep(
      prmset =>
        prmset.map(...fn2rsrj(fromCharCode)),
      expectation =>
        expectation.map(fromCharCode)
    )
  function assertResultSet ({object, resolve, reject}, resolveExpectation, rejectExpectation) {
    const failReasonNeg = ({value, state}) =>
      new ExpectationError(`Detected '${value}' which shouldn't be ${state}`)
    const failproc = (unexpectation, state) =>
      (value, resolve, reject) => (unexpectation.has(value) ? reject : resolve)({value, state})
    const testneg = object.mapExecutor(
      failproc(rejectExpectation, 'resolved'),
      failproc(resolveExpectation, 'rejected')
    )
    countpromise(testneg, [...resolveExpectation, ...rejectExpectation].length)
      .catch(desc => {
        throw failReasonNeg(desc)
      })
      .then(result => {
        const getset = xState =>
          new CSet(result.filter(({state}) => state === xState).map(({value}) => value))
        assertSetEquality(getset('resolved'), resolveExpectation, 'Resolving')
        assertSetEquality(getset('rejected'), rejectExpectation, 'Rejecting')
        resolve(result)
      })
      .catch(error => {
        console.log('resolveExpectation: ', [...resolveExpectation])
        console.log('rejectExpectation: ', [...rejectExpectation])
        reject(error)
      })
  }
}

function testnormal () {
  testproc(PromiseSet, 'PromiseSet')
}

function testadvance () {
  class CustomPromiseSet extends XPromiseSet(Promise, Set) {}
  testproc(CustomPromiseSet, 'XPromiseSet')
}

assert(
  XPromiseSet === require('../x'),
  "`require('promise-set').XPromiseSet` must return 'require('x-promise-set/x')'"
)

console.log('Testing PromiseSet...')
testnormal()
console.log('Testing XPromiseSet...')
testadvance()
