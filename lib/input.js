const inquirer = require("inquirer");
const helper = require("./helper");
const cTable = require("console.table");
const query = require("./query");
const DB = require("./DB");

// A single question with a multiple choice list to be provided
const listSubmenu = [
  {
    type: "list",
    message: "Select a TBD",
    name: "cmd",
    choices: null
  },
];

const choicesMain = [
  {
    name: "View All Employees",
    func: query.view.allEmployees
  },
  {
    name: "View All Employees by Department",
    subMenu: {
      menu: listSubmenu,
      message: "Select a Department",
      choices: query.view.allDepartments,
      format: i => i.name
    },
    func: query.view.allEmployeesByDepartment
  },
  {
    name: "View All Employees by Manager",
    subMenu: {
      menu: listSubmenu,
      message: "Select a Manager",
      choices: query.view.allEmployees,
      format: helper.getFullName
    },
    func: query.view.allEmployeesByManager,
  },
  {
    name: "Add Employee",
    func: addEmployeeAsync,
    view: "add",
  },
  {
    name: "Remove Employee",
    subMenu: {
      menu: listSubmenu,
      message: "Select an Employee to Remove",
      choices: query.view.allEmployees,
      format: helper.getFullName,
      output: (rows) => `\n${rows} Employee Record(s) Removed\n`
    },
    func: removeEmployeeAsync,
  },
  {
    name: "Update Employee Role",
    func: updateRoleAsync
  },
  {
    name: "Update Employee Manager",
    func: updateManagerAsync,
    view: "update"
  },
  {
    name: "View All roles",
    func: query.view.allRoles
  },
  {
    name: "Add Role",
    func: addRoleAsync,
    view: "add"
  },
  {
    name: "Remove Role",
    subMenu: {
      menu: listSubmenu,
      message: "Select an Role to Remove",
      choices: query.view.allRoles,
      format: (i) => i.title,
      output: (rows) => `\n${rows} Role(s) Removed\n`
    },
    func: removeRoleAsync
  },
  {
    name: "View All Departments",
    func: query.view.allDepartments
  },
  {
    name: "Add Department",
    func: addDepartmentAsync,
    view: "add"
  },
  {
    name: "Remove Department",
    subMenu: {
      menu: listSubmenu,
      message: "Select an Department to Remove",
      choices: query.view.allDepartments,
      format: (i) => i.name,
      output: (rows) => `\n${rows} Departments(s) Removed\n`
    },
    func: removeDepartmentAsync
  },
  {
    name: "Quit",
    quit: true,
  }
];

const menuMain = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "cmd",
    choices: choicesMain.map(i => i.name)
  },
];

/**
 * Add a New Employee
 * @param {DB} db 
 */
async function addEmployeeAsync(db) {
  // Get the employee and Roles lists
  const [employees, roles] = await Promise.all([query.view.allEmployees(db), query.view.allRoles(db)]);

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
  const newEmployeeId = await query.add.employee(db, employeeDetails);

  // Return the new employee Id
  return newEmployeeId;
}

/**
 * Remove an Employee from the database
 * @param {DB} db
 * @param {string} fullName the users First and Last Name
 * @param {array} employees All employee objects array
 */
async function removeEmployeeAsync(db, fullName, employees) {
  // Look up employee id from full name
  const employeeId = helper.getEmployeeId(employees, fullName);

  // Send the Delete request to the database
  const rowsAffected = await query.delete.employee(db, employeeId);

  // Return the rows affected
  return rowsAffected;
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

  // Send the Add request to the database
  const newRoleId = await query.add.role(db, roleDetails);

  // Return the new role Id
  return newRoleId;
}

/**
 * Remove an existing Role
 * @param {DB} db 
 */
async function removeRoleAsync(db, title, roles) {
  const roleId = helper.getRoleId(roles, title);
  const rowsAffected = await query.delete.role(db, roleId);
  return rowsAffected;
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

  // Send the Add request to the database
  const newDeptId = await query.add.department(db, deptDetails);

  // Return the new department Id
  return newDeptId;
}

/**
 * Remove an existing Department
 * @param {DB} db 
 */
async function removeDepartmentAsync(db, department, departments) {
  const departmentId = helper.getDepartmentId(departments, department);
  const rowsAffected = await query.delete.department(db, departmentId);
  return rowsAffected;
}

/** 
 * Change the Role of an Employeee
 * @param {DB} db 
 */
async function updateRoleAsync(db) {
  const employees = await query.view.allEmployees(db);
  const roles = await query.view.allRoles(db);
  const employeesMapped = employees.map(helper.getFullName);
  const rolesMapped = roles.map(i => i.title);

  const userOptions = await inquirer.prompt([
    {
      type: "list",
      message: "Select an employee",
      name: "employeeName",
      choices: employeesMapped
    },
    {
      type: "list",
      message: `Select new Role`,
      name: "roleName",
      choices: rolesMapped
    }
  ]);

  const employeeId = helper.getEmployeeId(employees, userOptions.employeeName);
  const roleId = helper.getRoleId(roles, userOptions.roleName);
  const rows = await query.update.role(db, employeeId, roleId);
  return rows;
}

/**
 * Change the Manager of an Employee
 * @param {DB} db 
 */
async function updateManagerAsync(db) {
  const employees = await query.view.allEmployees(db);
  const employeesMapped = employees.map(helper.getFullName);

  const userOptions = await inquirer.prompt([
    {
      type: "list",
      message: "Select an employee",
      name: "employeeName",
      choices: employeesMapped
    },
    {
      type: "list",
      message: "Select new Manager",
      name: "managerName",
      choices: employeesMapped
    }
  ]);

  const employeeId = helper.getEmployeeId(employees, userOptions.employeeName);
  const managerId = helper.getEmployeeId(employees, userOptions.managerName);
  const rows = await query.update.manager(db, employeeId, managerId);
  return rows;
}

/** Handles the sub-menu for a selected user option
 * 
 * @param {object} userOption the selected user Option menu 
 */
async function handleSubMenuAsync(userOption) {

  // Get the sub-choices
  const choices = await userOption.subMenu.choices(db);

  // map the array to provide an easy to see name
  const choicesMapped = choices.map(userOption.subMenu.format);

  // Update the prompt message text
  userOption.subMenu.menu[0].message = userOption.subMenu.message;

  // Set the choices in the prompt question
  userOption.subMenu.menu[0].choices = choicesMapped;

  const userOption2 = await inquirer.prompt(userOption.subMenu.menu);

  // Call the final view Function
  const data = await userOption.func(db, userOption2.cmd, choices);
  if (userOption.subMenu.output) {
    // Output a response string
    console.log(userOption.subMenu.output(data));
  } else {
    // Output Table Data
    console.table(data);
  }
}

/**
 * Prompt Loop 
 * Prompt the user what they would like to do with the employee tracker.
 * Loops until the user asks to quit or an error occurs.
 * 
 */
async function prompt() {
  try {
    db = new DB();
    await db.connect();

    do {
      // Main Menu Prompt
      const res = await inquirer.prompt(menuMain);
      const userOption = choicesMain.find(i => i.name === res.cmd);

      // User Selected Quit
      if (userOption.quit) {
        break;
      } else if (userOption.subMenu) {
        // Handler for a simple sub-menu (1 question, 1 list of data)
        await handleSubMenuAsync(userOption);
      } else {
        // For commands that do not require a sub-menu or handle it themselves
        const data = await userOption.func(db);
        if (!userOption.view) {
          console.table(data);
        } else {
          switch (userOption.view) {
            case "add":
              console.log(`\nNew record addded to Database (ID = ${data}).\n`);
              break;
            case "remove":
              console.log(`\n$Record Removed (count={data})\n`);
              break;
            case "update":
              console.log(`\n$Records Updated. (count={data})\n`);
            default:
              console.log("\nTHIS IS A DEFAULT CASE\n");
          }
        }
      }
    } while (true)
  } catch (err) {
    console.log("PROMPT ERROR", err);
  } finally {
    await db.close();
    console.log("Database Connection Closed");
  }
}

module.exports = {
  prompt
};