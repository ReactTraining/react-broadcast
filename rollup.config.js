const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const bundleSize = require('rollup-plugin-bundle-size');

const env = process.env.NODE_ENV;

const config = {
   entry: 'modules/index.js',
   moduleName: 'react-broadcast',
   sourceMap: true,
   external: ['react', 'prop-types'],
   globals: {
      react: 'React',
      'prop-types': 'PropTypes',
   },
   plugins: [
      commonjs(),
      babel({
         babelrc: false,
         exclude: 'node_modules/**',
         presets: [['es2015', { modules: false }], 'stage-1', 'react'],
         plugins: ['external-helpers', 'transform-react-remove-prop-types'],
      }),
      replace({
         'process.env.NODE_ENV': JSON.stringify(env),
      }),
      resolve({
         browser: true,
         module: true,
      }),
      bundleSize(),
   ],
};

if (env === 'production') {
   config.plugins.push(
      uglify({
         compress: {
            warnings: false,
         },
      })
   );
}

module.exports = config;
