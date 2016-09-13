'use strict'

const {stdout, stderr, exit} = require('process')
const assert = require('assert')
const compareSet = require('set-comparision')
const {XIterable} = require('x-iterable-base')
const PromiseSet = require('..')
const a2x = require('./lib/val-to-doubled-arr.js')
const strset = require('./lib/set-to-str.js')
const {console} = global
const {XPromiseSet} = PromiseSet
const CSet = XIterable(Set)
const assertSetEquality = (a, b, msg) => assert(compareSet(a, b), msg)
const assertSetEqualityMessage = (actual, expect) => `\t - Expectation: ${strset(expect)}\n\t - Reality: ${strset(actual)}`
const {fromCharCode} = String

class ExpectationError extends Error {
  get name () {
    return 'ExpectationError'
  }
}

function testproc (CPrmSet) {
  const {XPromise} = CPrmSet
  const step = (object, count = 0, ...prevexpect) => {
    console.log(`Begining step ${count}`, object)
    return {
      nextStep: (act, expect) => {
        const currentexpect = expect(...prevexpect)
        const pass = rest => {
          stdout.write(`Passed step ${count}\n`)
        }
        const fail = error => {
          stderr.write(`Failed at step ${count}: `)
          console.error(error)
          exit(1)
        }
        try {
          const nextObject = act(object, step)
          new Promise(
            (resolve, reject) =>
              assertResultSet({object: nextObject, resolve, reject}, ...currentexpect)
          )
            .then(pass)
            .catch(fail)
          return step(nextObject, count + 1, ...currentexpect)
        } catch (error) {
          fail(error)
        }
      },
      __proto__: null
    }
  }
  step(new CPrmSet(
    ...[...'abcdef'].map(x => new XPromise(f => f(x))),
    ...[...'ghijkl'].map(x => new XPromise((f, g) => g(x))),
    ...[...'ABCDEF'].map(x => f => f(x)),
    ...[...'GHIJKL'].map(x => (f, g) => g(x))
  ))
    .nextStep(
      prmset =>
        prmset.map(...a2x(x => x.charCodeAt())),
      () => [
        new CSet('abcdefABCDEF'),
        new CSet('ghijklGHIJKL')
      ]
    )
    .nextStep(
      prmset =>
        prmset.filter(...a2x(x => x & 1)),
      (...prevexpect) => prevexpect.map(
        expectation => expectation.filter(x => x & 1)
      )
    )
    .nextStep(
      prmset =>
        prmset.map(...a2x(fromCharCode)),
      (...prevexpect) => prevexpect.map(
        expectation => expectation.map(fromCharCode)
      )
    )
  function assertResultSet ({object, resolve, reject}, resolveExpectation, rejectExpectation) {
    const resolveActual = new CSet()
    const rejectActual = new CSet()
    const failReasonNeg = (value, state) =>
      reject(new ExpectationError(`Detected '${value}' which shouldn't be ${state}`))
    const failproc = (unexpectation, state, dest) =>
      x => unexpectation.has(x) ? failReasonNeg(x, state) : dest.add(x)
    const failifresolved = failproc(rejectExpectation, 'rejected', resolveActual)
    const failifrejected = failproc(resolveExpectation, 'resolved', rejectActual)
    const testneg = object.map(failifrejected, failifresolved)
    Promise.all(testneg).then(() => {
      try {
        assertSetEquality(
          resolveActual,
          resolveExpectation,
          `Resolving Wrong:\n${assertSetEqualityMessage(resolveActual, resolveExpectation)}`
        )
        assertSetEquality(
          rejectActual,
          rejectExpectation,
          `Rejecting Wrong:\n${assertSetEqualityMessage(rejectActual, rejectExpectation)}`
        )
        resolve([resolveExpectation, rejectExpectation])
      } catch (error) {
        reject(error)
      }
    })
  }
}

function testnormal () {
  testproc(PromiseSet, 'PromiseSet')
}

function testadvance () {
  testproc(XPromiseSet(Promise, Set), 'XPromiseSet')
}

assert(
  XPromiseSet === require('../x'),
  "`require('promise-set').XPromiseSet` must return 'require('x-promise-set/x')'"
)

console.log('Testing PromiseSet...')
testnormal()
console.log('Testing XPromiseSet...')
testadvance()
