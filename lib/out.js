const chalk = require("chalk");

const debug = process.argv[2] === "debug";

function outDebug(...str) {
  if (debug) {
    console.log();
    console.log(chalk.black.bgWhiteBright(...str));
    console.log();
  }
}

function outInfo(...str) {
  console.log();
  console.log(chalk.green.bold(...str));
  console.log();
}

function outError(...str) {
  console.log();
  console.log(chalk.red.bold(...str));
  console.log();
}

module.exports = {
  debug: outDebug,
  info: outInfo,
  error: outError,
}