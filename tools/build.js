const fs = require('fs')
const execSync = require('child_process').execSync
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  })

console.log('Building CommonJS modules ...')

exec('babel modules -d . --ignore __tests__', {
  BABEL_ENV: 'cjs'
})

console.log('\nBuilding ES modules ...')

exec('babel modules -d esm --ignore __tests__', {
  BABEL_ENV: 'esm'
})

console.log('\nBuilding react-broadcast.js ...')

exec('rollup -c -f umd -o umd/react-broadcast.js', {
  BABEL_ENV: 'umd',
  NODE_ENV: 'development'
})

console.log('\nBuilding react-broadcast.min.js ...')

exec('rollup -c -f umd -o umd/react-broadcast.min.js', {
  BABEL_ENV: 'umd',
  NODE_ENV: 'production'
})

const size = gzipSize.sync(
  fs.readFileSync('umd/react-broadcast.min.js')
)

console.log('\ngzipped, the UMD build is %s', prettyBytes(size))
