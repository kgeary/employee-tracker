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

  /**
   * Establish a connection to the database 
   * (This is not-required prior to query)
   * 
   * @returns {Promise} Promise to connect
   */
  connect() {
    return new Promise(function(resolve, reject) {
      this.connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          reject(err);
        } else {
          console.log('connected');
          resolve();
        }
      });
    });
  }

  /**
   * Query the database (Can also be used for delete, insert, update)
   *
   * @param {string} sql A query statement for the database 
   *
   * @returns {Promise} Promise to execute sql
   */
  query(sql) {
    return new Promise(function(resolve, reject) {
      this.connection.query(sql, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Close the database connection
   * 
   * @returns {Promise} Promise to close the connection
   */ 
  close() {
    return new Promise(function(resolve, reject) {
      this.connection.end(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = DB;