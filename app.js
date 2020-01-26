const out = require("./lib/out");
const input = require("./lib/input");

async function init() {
  try {
    await input.prompt();
  } catch (err) {
    out.error("ERROR", err);
  } finally {
    out.info("Application Exiting");
  }
};

init();
