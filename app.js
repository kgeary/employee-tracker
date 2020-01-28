const out = require("./lib/out");
const tracker = require("./lib/tracker");

async function init() {
  try {
    await tracker.run();
  } catch (err) {
    out.error("ERROR", err);
  } finally {
    out.info("Application Exiting");
  }
};

init();
