require("dotenv").config();
const mysql = require("mysql");
const out = require("./out");

const debug = process.argv[2] === "debug";

class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: process.env.DB_PASSWORD,
      database: "employee_trackerDB"
    });
  }

  /**
   * Establish a connection to the database 
   * (This is not-required prior to query)
   * 
   * @returns {Promise} Promise to connect
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          out.error('Error Connecting: ' + err.stack);
          reject(err);
        } else {
          out.debug(`Connected (Thread ID=${this.connection.threadId})`);
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
   * @returns {Promise} Promise to execute sql and return a result
   */
  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, result) => {
        if (err) {
          out.debug(err);
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
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
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