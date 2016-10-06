
var eslintRules = require('../config/eslint')

module.exports = {
  env: {
    'embertest': true
  },

  rules: eslintRules,

  globals: {
    selectGroupChoose: true,
    wait: true,
  }
}

