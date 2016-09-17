'use strict'

const {exit, stdout, stderr, env: {TEST_COUNT_LOGS, TEST_COUNT_LOGS_DELEMITER}} = require('process')
const {readFileSync} = require('fs')
const expected = 2 * 3

const count = readFileSync(TEST_COUNT_LOGS, {encoding: 'utf8'}).split(TEST_COUNT_LOGS_DELEMITER).filter(Boolean).length
if (count === expected) {
  stdout.write('VERIFICATION PASSED!')
  exit(0)
} else {
  stderr.write('VERIFICATION FAILED!')
  stdout.write(`Expecting ${expected} steps being tested but got ${count}`)
  exit(2)
}
