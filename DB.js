const mysql = require("mysql");

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});



class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "734512",
      database: "employeeDB"
    });
  }

  connect() {
    this.connection.connect(this.afterConnection());
  }
  // THIS MIGHT HAVE ASYNC ISSUES - CALLBACK METHOD?
  afterConnection() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log(res);
      connection.end();
    });
  }

  getEmployees() {
    this.connection.query("SELECT * FROM employees", function(err, res) {
      if (err) throw err;
      console.log(res);
    });
  }
}

module.exports = DB;