'use strict'
const {fromCharCode} = String
const aCharCode = 'a'.charCodeAt()
const i2c = x => fromCharCode(x + aCharCode)
require('process').stdout.write(
  [...require('crypto').prng(32)]
    .map(byte => i2c(byte >> 4) + i2c(byte & 0b1111)).join('')
)
