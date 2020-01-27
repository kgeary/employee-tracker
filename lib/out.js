const chalk = require("chalk");

const debug = process.argv[2] === "debug";

function outDebug(...str) {
  if (debug) {
    console.log();
    console.log(chalk.cyan(...str));
  }
}

function outInfo(...str) {
  console.log();
  console.log(chalk.green.bold(...str));
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