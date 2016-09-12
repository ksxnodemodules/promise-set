'use strict'

const {stdout, stderr, exit} = require('process')
const assert = require('assert')
const {XIterable} = require('x-iterable-base')
const PromiseSet = require('..')
const {console} = global
const {XPromiseSet} = PromiseSet
const a2x = x => [x, x]
const CSet = XIterable(Set)

class ExpectationError extends Error {
  get name () {
    return 'ExpectationError'
  }
}

function testnormal (CPrmSet = PromiseSet) {
  const {XPromise} = CPrmSet
  const step = (object, count = 0, ...expectrest) => {
    console.log(`Begining step ${count}`, object)
    return {
      nextStep: (act, expect, ...expectrest) => {
        let nextexpectrest
        const pass = rest => {
          nextexpectrest = rest || ''
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
              expect({object: nextObject, resolve, reject}, ...expectrest)
          )
            .then(pass)
            .catch(fail)
          return step(nextObject, count + 1, ...nextexpectrest)
        } catch (error) {
          fail(error)
        }
      }
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
      param =>
        assertResultSet(param, new CSet('abcdefABCDEF'), new CSet('ghijklGHIJKL'))
    )
    .nextStep(
      prmset =>
        prmset.filter(...a2x(x => x & 1)),
      (param, prevResolveExpectation, prevRejectExpectation) =>
        assertResultSet(param, prevResolveExpectation.filter(x => x & 1), prevRejectExpectation.filter(x => x & 1))
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
        assert.deepStrictEqual([...resolveActual], [...resolveExpectation])
        assert.deepStrictEqual([...rejectActual], [...rejectExpectation])
        resolve([resolveExpectation, rejectExpectation])
      } catch (error) {
        reject(error)
      }
    })
  }
}

function testadvance () {
  testnormal(XPromiseSet(Promise, Set))
}

assert(
  XPromiseSet === require('../x'),
  "`require('promise-set').XPromiseSet` must return 'require('x-promise-set/x')'"
)

console.log('Testing PromiseSet...')
testnormal()
console.log('Testing XPromiseSet...')
testadvance()
