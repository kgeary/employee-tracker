const inquirer = require("inquirer");
const helper = require("./helper");
const cTable = require("console.table");
const query = require("./query");
const DB = require("./DB");

// A single question with a multiple choice list to be provided
const listSubmenu = {
  type: "list",
  message: "Select a TBD",
  name: "cmd",
  choices: null
};

const choicesMain = [
  {
    name: "View All Employees",
    func: query.view.allEmployees
  },
  {
    name: "View All Employees by Department",
    func: viewEmployeesByDeptAsync
  },
  {
    name: "View All Employees by Manager",
    func: viewEmployeesByManagerAsync
  },
  {
    name: "Add Employee",
    func: addEmployeeAsync,
  },
  {
    name: "Remove Employee",
    func: removeEmployeeAsync
  },
  {
    name: "Update Employee Role",
    func: updateRoleAsync,
  },
  {
    name: "Update Employee Manager",
    func: updateManagerAsync,
  },
  {
    name: "View All roles",
    func: query.view.allRoles
  },
  {
    name: "Add Role",
    func: addRoleAsync,
  },
  {
    name: "Remove Role",
    func: removeRoleAsync
  },
  {
    name: "View All Departments",
    func: query.view.allDepartments
  },
  {
    name: "Add Department",
    func: addDepartmentAsync,
  },
  {
    name: "Remove Department",
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


/** Handles the sub-menu for a selected user option
 * 
 * @param {object} userOption the selected user Option menu 
 */
async function runSubMenuAsync(subMenu) {

  // Get the sub-choices
  const choices = await subMenu.choices(db);

  // No Choices to offer - abort
  if (choices.length < 1) {
    console.log("\nThere are no choices to select. Returning to main menu\n");
    return;
  }

  // map the array to provide an easy to see name
  const choicesMapped = choices.map(subMenu.format);

  // Update the prompt message text
  subMenu.menu.message = subMenu.message;

  // Set the choices in the prompt question
  subMenu.menu.choices = choicesMapped;

  // Pass the question as an array
  const userOption = await inquirer.prompt([subMenu.menu]);

  // If a view function was provided
  if (subMenu.viewFunc) {
    const data = await subMenu.viewFunc(db, userOption.cmd, choices);

    if (subMenu.output) {
      // Output a response string
      console.log(subMenu.output(data));
    } else {
      // Output Table Data
      if (data.length > 0) {
        console.table(data);
      } else {
        console.log("\nNo Entries Found!\n");
      }
    }
  } else if (subMenu.removeFunc) {
    // Perform a remove operation
    const id = subMenu.getId(choices, userOption.cmd);
    await helper.removeEntryAsync(db, id, subMenu.removeFunc, subMenu.description);
  } else {
    throw new Error("Must define a viewFunc or removeFunc with submenu");
  }

}

/**
 * Add a New Employee
 * @param {DB} db 
 */
async function addEmployeeAsync(db) {
  // Get the employee and Roles lists
  const [employees, roles] = await Promise.all([query.view.allEmployees(db), query.view.allRoles(db)]);

  if (roles.length < 1) {
    console.log("\nYou must define at least 1 role before adding employees\n");
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
  const newEmployeeId = await query.add.employee(db, employeeDetails);

  // Return the new employee Id
  console.log("\nEmployee Added - " + helper.getFullName(employeeDetails) + "\n");


}

/**
 * View Employees By Department
 * @param {DB} db 
 */
async function viewEmployeesByDeptAsync(db) {
  const subMenu = {
    menu: listSubmenu,
    message: "Select a Department",
    choices: query.view.allDepartments,
    format: i => i.name,
    viewFunc: query.view.allEmployeesByDepartment
  };

  await runSubMenuAsync(subMenu);
}

/**
 * View Employees By Manager
 * @param {DB} db 
 */
async function viewEmployeesByManagerAsync(db) {
  const subMenu = {
    menu: listSubmenu,
    message: "Select a Manager",
    choices: query.view.allEmployees,
    format: helper.getFullName,
    viewFunc: query.view.allEmployeesByManager
  };

  await runSubMenuAsync(subMenu);
}

/**
 * Remove an Employee from the database
 * @param {DB} db
 */
async function removeEmployeeAsync(db) {
  const subMenu = {
    menu: listSubmenu,
    message: "Select an Employee to Remove",
    choices: query.view.allEmployees,
    format: helper.getFullName,
    getId: helper.getEmployeeId,
    removeFunc: query.delete.employee,
    description: "Employee"
  };

  await runSubMenuAsync(subMenu);
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

  console.log("\nRole Added - " + roleDetails.title + "\n");

}

/**
 * Remove an existing Role
 * @param {DB} db 
 */
async function removeRoleAsync(db) {
  const subMenu = {
    menu: listSubmenu,
    message: "Select a Role to Remove",
    choices: query.view.allRoles,
    format: (i) => i.title,
    getId: helper.getRoleId,
    removeFunc: query.delete.role,
    description: "Role"
  };

  await runSubMenuAsync(subMenu);
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
  console.log("\nDepartment added - " + deptDetails.name + "\n");
}

/**
 * Remove an existing Department
 * @param {DB} db 
 */
async function removeDepartmentAsync(db, department, departments) {
  const subMenu = {
    menu: listSubmenu,
    message: "Select a Department to Remove",
    choices: query.view.allDepartments,
    format: (i) => i.name,
    getId: helper.getDepartmentId,
    removeFunc: query.delete.department,
    description: "Department"
  };

  await runSubMenuAsync(subMenu);
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

  console.log(`\n${rows} role(s) updated\n`);

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

  console.log(`\n${rows} manager(s) updated\n`);
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
          console.log("\nNo Records Found!\n");
        }
      }

    } while (true)
  } catch (err) {
    console.log("\nPROMPT ERROR\n", err);
  } finally {
    await db.close();
    console.log("\nDatabase Connection Closed\n");
  }
}

module.exports = {
  prompt
};