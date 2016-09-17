'use strict'
const fn2rsrj = fn => [x => fn(x), x => { throw fn(x) }]
module.exports = fn2rsrj
