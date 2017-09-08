const building = process.env.BABEL_ENV != undefined && process.env.BABEL_ENV !== 'cjs'

const plugins = []

if (process.env.BABEL_ENV === 'umd') {
  plugins.push('external-helpers')
}

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    'dev-expression',
    'transform-react-remove-prop-types'
  )
}

module.exports = {
  presets: [
    [ 'es2015', {
      loose: true,
      modules: building ? false : 'commonjs'
    } ],
    'stage-1',
    'react'
  ],
  plugins: plugins
}
