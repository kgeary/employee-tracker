const chalk = require("chalk");

const debug = process.argv[2] === "debug";

function outDebug(...str) {
  if (debug) {
    console.log();
    console.log(chalk.black.bgWhiteBright(...str));
  }
}

function outInfo(...str) {
  console.log();
  console.log(chalk.bgGreen.black(...str));
}

function outError(...str) {
  console.log();
  console.log(chalk.red.bold(...str));
}

module.exports = {
  debug: outDebug,
  info: outInfo,
  error: outError,
}