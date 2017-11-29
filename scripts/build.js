const fs = require("fs")
const path = require("path")
const execSync = require("child_process").execSync
const prettyBytes = require("pretty-bytes")
const pascalCase = require("pascal-case")
const gzipSize = require("gzip-size")

process.chdir(path.resolve(__dirname, ".."))

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: "inherit",
    env: Object.assign({}, process.env, extraEnv)
  })

const packageName = require("../package").name

console.log("\nBuilding CommonJS modules...")

exec(`rollup -c scripts/config.js -f cjs -o cjs/${packageName}.js`)

console.log("\nBuilding ES modules...")

exec(`rollup -c scripts/config.js -f es -o esm/${packageName}.js`)

console.log("\nBuilding UMD modules...")

exec(`rollup -c scripts/config.js -f umd -o umd/${packageName}.js`, {
  BUILD_NAME: pascalCase(packageName),
  BUILD_ENV: "development"
})

exec(`rollup -c scripts/config.js -f umd -o umd/${packageName}.min.js`, {
  BUILD_NAME: pascalCase(packageName),
  BUILD_ENV: "production"
})

console.log(
  "\nThe minified, gzipped UMD build is %s",
  prettyBytes(gzipSize.sync(fs.readFileSync(`umd/${packageName}.min.js`)))
)
