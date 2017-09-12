const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')

process.chdir(path.resolve(__dirname, '..'))

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  })

console.log('\nBuilding CommonJS modules...')

exec('rollup -c scripts/config.js -f cjs -o cjs/react-broadcast.js')

console.log('\nBuilding ES modules...')

exec('rollup -c scripts/config.js -f es -o esm/react-broadcast.js')

console.log('\nBuilding UMD modules...')

exec('rollup -c scripts/config.js -f umd -o umd/react-broadcast.js', {
  BUILD_ENV: 'development'
})

exec('rollup -c scripts/config.js -f umd -o umd/react-broadcast.min.js', {
  BUILD_ENV: 'production'
})

console.log(
  '\nThe minified, gzipped UMD build is %s',
  prettyBytes(gzipSize.sync(fs.readFileSync('umd/react-broadcast.min.js')))
)
