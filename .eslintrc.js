module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    quotes: "off",
    "spaced-comment": "off",
    "space-before-function-paren": "off",
    "no-console": "off",
    "object-shorthand": "off",
    "array-bracket-spacing": "off",
    "no-multiple-empty-lines": "off",
    "comma-dangle": "off"
  }
}
