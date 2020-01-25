const cTable = require('console.table');
const inquirer = require("inquirer");
const DB = require("./lib/DB");
const query = require("./lib/query");
const input = require("./lib/input");

console.log(process.env.DB_PW);

const db = new DB();


async function init() {
  await db.connect()
  console.log("CONNECTED!");
  const departments = await query.view.allDepartments(db);

  const responses = await inquirer.prompt([
    {
      type: "list",
      message: "Select a department",
      name: "department",
      choices: departments.map(i => i.name),
    }
  ]);

  const dept = departments.find(i => i.name === responses.department);

  if (!dept) {console.log("Department not found!"); return; }

  const result = await query.view.allEmployeesByDepartment(db, dept.id);
  console.table(result);
  await db.close()
  console.log("ALL DONE");
}

init();
