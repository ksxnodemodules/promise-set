'use strict'

const countpromise = (prmset, size) => new Promise((resolve, reject) => {
  const result = []
  prmset.forEach(
    value => {
      result.push(value)
      result.length === size && resolve(result)
    },
    reject
  )
})

module.exports = countpromise
