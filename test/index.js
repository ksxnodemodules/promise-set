'use strict'

const {stdout, stderr, exit} = require('process')
const assert = require('assert')
const PromiseSet = require('..')
const {console} = global
const {XPromiseSet} = PromiseSet
const a2x = x => [x, x]

function testnormal (CPrmSet = PromiseSet) {
  const {XPromise} = CPrmSet
  const step = (object, count = 0) => {
    console.log(`Begining step ${count}`, object)
    return {
      nextStep: (act, expect) => {
        const pass = () => {
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
              expect({object: nextObject, resolve, reject})
          )
            .then(success)
            .catch(fail)
          return step(nextObject, count + 1)
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
      ({object, resolve, reject}) => {
        resolve()
      }
    )
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
