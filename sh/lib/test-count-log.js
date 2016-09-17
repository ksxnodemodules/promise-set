'use strict'
require('process').stdout.write([...require('crypto').prng(32)].map(String.fromCharCode).join(''))
