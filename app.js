const input = require("./lib/input");

async function init() {
  try {
    console.log("CONNECTED!");
    await input.prompt();
  } catch (err) {
    console.log("ERROR", err);
  } finally {
    await db.close()
    console.log("ALL DONE");
  }
};

init();
