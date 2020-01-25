const DB = require("./DB");

console.log(process.env.DB_PW);

const db = new DB();

db.connect().then(function() {
  console.log("CONNECTED!");
}).then(function() {
  return db.query("SELECT * FROM employee");
}).then(function(result) {
  console.table(result);
});


