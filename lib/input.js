const inquirer = require("inquirer");
const out = require("./out");
const helper = require("./helper");
const cTable = require("console.table");
const query = require("./query");
const DB = require("./DB");

// Choices for the main menu and the associated handler
const choicesMain = [
  { name: "View All Employees", func: query.view.allEmployees },
  { name: "View All Employees by Department", func: viewEmployeesByDeptAsync },
  { name: "View All Employees by Manager", func: viewEmployeesByManagerAsync },
  { name: "Add Employee", func: addEmployeeAsync },
  { name: "Remove Employee", func: removeEmployeeAsync },
  { name: "Update Employee Role", func: updateRoleAsync },
  { name: "Update Employee Manager", func: updateManagerAsync },
  { name: "View All roles", func: query.view.allRoles },
  { name: "Add Role", func: addRoleAsync },
  { name: "Remove Role", func: removeRoleAsync },
  { name: "View All Departments", func: query.view.allDepartments },
  { name: "Add Department", func: addDepartmentAsync },
  { name: "Remove Department", func: removeDepartmentAsync },
  { name: "View Department Budget", func: viewDepartmentBudgetAsync },
  { name: "Quit", quit: true }
];

// Main Menu object for inquirer
const menuMain = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "cmd",
    choices: choicesMain.map(i => i.name)
  },
];

/**
 * Prompt the user with a list of choices and return the name and id of response
 * @param {DB} db Database
 * @param {string} display Display string to show in prompt
 * @param {function} queryFunc QUERY function to query database
 * @param {function} mapFunc MAP function to display values
 * @param {function} idFunc ID Lookup function
 */
async function getTableAsync(db, display, queryFunc, mapFunc, idFunc) {
  const items = await queryFunc(db);
  const itemsMapped = items.map(mapFunc);

  const userOption = await inquirer.prompt([
    {
      type: "list",
      message: display,
      choices: itemsMapped,
      name: "cmd"
    }
  ]);

  const name = userOption.cmd;
  const id = idFunc(items, name);

  return { name, id };
}

/**
 * Prompt the user for an Employee and store the answer
 * @param {DB} db database
 * @param {string} display message to display when prompting user
 */
async function getEmployeeAsync(db, display = "Select an Employee") {
  return await getTableAsync(
    db,
    display,
    query.view.allEmployees,
    helper.getFullName,
    helper.getEmployeeId);
}

/**
 * Prompt the user for a Department and store the answer
 * @param {DB} db database
 * @param {string} display message to display when prompting user
 */
async function getDepartmentAsync(db, display = "Select a Department") {
  return await getTableAsync(
    db,
    display,
    query.view.allDepartments,
    (i) => i.name,
    helper.getDepartmentId);
}

/**
 * Prompt the user for a Role and store the answer
 * @param {DB} db database
 * @param {string} display message to display when prompting user
 */
async function getRoleAsync(db, display = "Select a Role") {
  return await getTableAsync(
    db,
    display,
    query.view.allRoles,
    (i) => i.title,
    helper.getRoleId);
}

/**
 * View the department budget
 * @param {DB} db database
 */
async function viewDepartmentBudgetAsync(db) {
  const dept = await getDepartmentAsync(db);
  const res = await query.view.departmentBudget(db, dept.id);
  console.table(res);
}

/**
 * View Employees By Department
 * @param {DB} db 
 */
async function viewEmployeesByDeptAsync(db) {
  const dept = await getDepartmentAsync(db);
  return await query.view.allEmployeesByDepartment(db, dept.name);
}

/**
 * View Employees By Manager
 * @param {DB} db 
 */
async function viewEmployeesByManagerAsync(db) {
  const mgr = await getEmployeeAsync(db, "Select a Manager");
  return await query.view.allEmployeesByManager(db, mgr.name);
}

/**
 * Remove an Employee from the database
 * @param {DB} db
 */
async function removeEmployeeAsync(db) {
  const employee = await getEmployeeAsync(db, "Select an Employee to Remove");
  const count = await query.delete.employee(db, employee.id);
  helper.checkRemove(count, employee.name);
}

/**
 * Remove an existing Role
 * @param {DB} db 
 */
async function removeRoleAsync(db) {
  const role = await getRoleAsync(db, "Select a Role to Remove");
  const count = await query.delete.role(db, role.id);
  helper.checkRemove(count, role.name);
}

/**
 * Remove an existing Department
 * @param {DB} db 
 */
async function removeDepartmentAsync(db) {
  const dept = await getDepartmentAsync(db, "Select a Department to Remove");
  const count = await query.delete.department(db, dept.id);
  helper.checkRemove(count, dept.name);
}

/** 
 * Change the Role of an Employeee
 * @param {DB} db 
 */
async function updateRoleAsync(db) {
  const employee = await getEmployeeAsync(db);
  const role = await getRoleAsync(db);
  const count = await query.update.role(db, employee.id, role.id);
  helper.checkUpdate(count, employee.name);
}

/**
 * Change the Manager of an Employee
 * @param {DB} db 
 */
async function updateManagerAsync(db) {
  const employee = await getEmployeeAsync(db, "Employee");
  const manager = await getEmployeeAsync(db, "Manager");
  const count = await query.update.manager(db, employee.id, manager.id);
  helper.checkUpdate(count, employee.name);
}

/**
 * Add a New Employee
 * @param {DB} db 
 */
async function addEmployeeAsync(db) {
  // Get the employee and Roles lists
  const [employees, roles] = await Promise.all([query.view.allEmployees(db), query.view.allRoles(db)]);

  if (roles.length < 1) {
    out.error("You must define at least 1 role before adding employees");
    return null;
  }

  // Map the lists to a print friendly format
  const mappedRoles = roles.map(i => i.title);
  const mappedEmployees = employees.map(helper.getFullName);

  const addSub = [
    {
      type: "input",
      message: "What is the employee's first name?",
      name: "first_name",
    },
    {
      type: "input",
      message: "What is the employee's last name?",
      name: "last_name",
    },
    {
      type: "list",
      message: "What is the employee's role?",
      name: "role",
      choices: mappedRoles,
    },
    {
      type: "list",
      message: "Who is the employee's manager?",
      name: "manager",
      choices: mappedEmployees,
    }
  ];

  // Prompt the user for Employee Details
  let employeeDetails = await inquirer.prompt(addSub);

  // Look up role id from role title
  employeeDetails.role_id = helper.getRoleId(roles, employeeDetails.role);

  // Look up manager id from full name
  employeeDetails.manager_id = helper.getEmployeeId(employees, employeeDetails.manager);

  // Send the Add request to the database
  try {
    const newEmployeeId = await query.add.employee(db, employeeDetails);
    out.info("Employee Added - " + helper.getFullName(employeeDetails));
  } catch (err) {
    out.error("ERROR: Unable to add - " + helper.getFullName(employeeDetails));
  }
}

/**
 * Add a new Role
 * @param {DB} db 
 */
async function addRoleAsync(db) {
  // Get the Departments list
  const departments = await query.view.allDepartments(db);

  // Map the list to a print friendly format
  const mappedDepartments = departments.map(i => i.name);

  const addSub = [
    {
      type: "input",
      message: "What is the job title?",
      name: "title",
    },
    {
      type: "number",
      message: "What is the annual salary?",
      name: "salary",
    },
    {
      type: "list",
      message: "What department is the role under?",
      name: "department",
      choices: mappedDepartments,
    }
  ];

  // Prompt the user for Employee Details
  const roleDetails = await inquirer.prompt(addSub);

  // Look up manager id from full name
  roleDetails.department_id = helper.getDepartmentId(departments, roleDetails.department);

  try {
    // Send the Add request to the database
    const newRoleId = await query.add.role(db, roleDetails);
    out.info("Role Added - " + roleDetails.title);
  } catch {
    out.error("ERROR: Failed to add Role - " + roleDetails.title);
  }
}

/**
 * Add a new Department
 * @param {DB} db 
 */
async function addDepartmentAsync(db) {
  const addSub = [
    {
      type: "input",
      message: "What is the department name?",
      name: "name",
    },
  ];

  // Prompt the user for info
  const deptDetails = await inquirer.prompt(addSub);

  try {
    // Send the Add request to the database
    const newDeptId = await query.add.department(db, deptDetails);
    // Return the new department Id
    out.info("Department added - " + deptDetails.name);
  } catch (err) {
    out.error("ERROR: Failed to add Department - " + deptDetails.name);
  }
}

/**
 * Prompt Loop 
 * Prompt the user what they would like to do with the employee tracker.
 * Loops until the user asks to quit or an error occurs.
 */
async function prompt() {
  try {
    const db = new DB();
    await db.connect();

    do {
      // Main Menu Prompt
      const res = await inquirer.prompt(menuMain);
      const userOption = choicesMain.find(i => i.name === res.cmd);

      // User Selected Quit - break out of the prompt loop
      if (userOption.quit) {
        break;
      }

      // Call the user function
      const data = await userOption.func(db);

      // If data was passed back - output something
      if (data) {
        if (data.length > 0) {
          console.table(data);
        } else {
          out.error("No Records Found!");
        }
      }
    } while (true)
  } catch (err) {
    out.error("PROMPT ERROR", err);
  } finally {
    await db.close();
    out.info("Database Connection Closed");
  }
}

module.exports = {
  prompt
};