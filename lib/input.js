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

// A single question menu with a multiple choice list tbd
const listSubmenu = {
  type: "list",
  message: "Select a TBD",
  name: "cmd",
  choices: null
};

/** Handles the sub-menu for a selected user option
 * 
 * @param {object} subMenu Sub Menu options object
 */
async function subMenuAsync(subMenu) {

  // Get the choices from the database
  const choices = await subMenu.choices(db);

  // If there are no choices available quit early.
  if (choices.length < 1) {
    out.error("There are no choices to select. Returning to main menu");
    return;
  }

  // Setup inquirer and run the prompts
  const choicesMapped = choices.map(subMenu.format);
  subMenu.menu = listSubmenu;
  subMenu.menu.message = subMenu.message;
  subMenu.menu.choices = choicesMapped;
  const userOption = await inquirer.prompt([subMenu.menu]);

  // If a view function was provided
  if (subMenu.viewFunc) {
    // Call the View Function to get the view data
    const data = await subMenu.viewFunc(db, userOption.cmd, choices);

    // If an output formatter was provide use that to console log
    if (subMenu.output) {
      // Output a response string
      out.info(subMenu.output(data));
    } else {
      // Output Table Data
      if (data.length > 0) {
        console.table(data);
      } else {
        out.error("No Entries Found!");
      }
    }
  } else if (subMenu.removeFunc && subMenu.getId && subMenu.description) {
    // If a remove function was provided try it
    const id = subMenu.getId(choices, userOption.cmd);
    try {
      await helper.removeEntryAsync(db, id, subMenu.removeFunc, subMenu.description, userOption.cmd);
    } catch (err) {
      out.error(`ERROR: Unable to remove ${userOption.cmd} from ${subMenu.description}`);
    }
  } else {
    throw new Error("Must define a viewFunc or removeFunc with submenu");
  }
}

/**
 * View Employees By Department
 * @param {DB} db 
 */
async function viewEmployeesByDeptAsync(db) {
  const subMenu = {
    message: "Select a Department",
    choices: query.view.allDepartments,
    format: i => i.name,
    viewFunc: query.view.allEmployeesByDepartment
  };

  await subMenuAsync(subMenu);
}

/**
 * View Employees By Manager
 * @param {DB} db 
 */
async function viewEmployeesByManagerAsync(db) {
  const subMenu = {
    message: "Select a Manager",
    choices: query.view.allEmployees,
    format: helper.getFullName,
    viewFunc: query.view.allEmployeesByManager
  };

  await subMenuAsync(subMenu);
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
 * Remove an Employee from the database
 * @param {DB} db
 */
async function removeEmployeeAsync(db) {
  const subMenu = {
    message: "Select an Employee to Remove",
    choices: query.view.allEmployees,
    format: helper.getFullName,
    getId: helper.getEmployeeId,
    removeFunc: query.delete.employee,
    description: "Employee"
  };

  await subMenuAsync(subMenu);
}

/**
 * Remove an existing Role
 * @param {DB} db 
 */
async function removeRoleAsync(db) {
  const subMenu = {
    message: "Select a Role to Remove",
    choices: query.view.allRoles,
    format: (i) => i.title,
    getId: helper.getRoleId,
    removeFunc: query.delete.role,
    description: "Role"
  };

  await subMenuAsync(subMenu);
}

/**
 * Remove an existing Department
 * @param {DB} db 
 */
async function removeDepartmentAsync(db) {
  const subMenu = {
    message: "Select a Department to Remove",
    choices: query.view.allDepartments,
    format: (i) => i.name,
    getId: helper.getDepartmentId,
    removeFunc: query.delete.department,
    description: "Department"
  };

  await subMenuAsync(subMenu);
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
  try {
    const rows = await query.update.role(db, employeeId, roleId);
    out.info(`${rows} role(s) updated`);
  } catch (err) {
    out.error(`ERROR: Failed to update role`);
  }
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
  try {
    const rows = await query.update.manager(db, employeeId, managerId);
    out.info(`${rows} manager(s) updated`);
  } catch (err) {
    out.error(`ERROR: Failed to update manager`);
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
      }

      // Call the user function
      const data = await userOption.func(db);

      // If data was passed back output something
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