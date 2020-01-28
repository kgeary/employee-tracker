const inquirer = require("inquirer");
const out = require("./out");
const helper = require("./helper");
const cTable = require("console.table");
const query = require("./query");


// Choices for the main menu and the associated handler
const choicesMain = [
  { name: "View All Employees", func: query.employee.view.all },
  { name: "View All Employees by Department", func: viewEmployeesByDeptAsync },
  { name: "View All Employees by Manager", func: viewEmployeesByManagerAsync },
  { name: "Add Employee", func: addEmployeeAsync },
  { name: "Remove Employee", func: removeEmployeeAsync },
  { name: "Update Employee Role", func: updateRoleAsync },
  { name: "Update Employee Manager", func: updateManagerAsync },
  { name: "View All roles", func: query.role.view.all },
  { name: "Add Role", func: addRoleAsync },
  { name: "Remove Role", func: removeRoleAsync },
  { name: "View All Departments", func: query.department.view.all },
  { name: "View Department Budgets", func: viewDepartmentBudgetAsync },
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

/**
 * Prompt the user with a list of choices and return the name and id of response
 * @param {string} display Display string to show in prompt
 * @param {function} queryFunc QUERY function to query database
 * @param {function} mapFunc MAP function to display values
 * @param {function} idFunc ID Lookup function to get if from display name
 */
async function getUserChoiceAsync(display, queryFunc, mapFunc, idFunc) {
  const items = await queryFunc();
  const itemsMapped = items.map(mapFunc);

  // If we have no options to display log an error and exit immediately
  if (items.length < 1) {
    out.error("No Items Found!");
    return null;
  }

  // Prompt the user for a choice from the generated list of options
  const userOption = await inquirer.prompt([
    {
      type: "list",
      message: display,
      choices: itemsMapped,
      name: "cmd"
    }
  ]);

  // Get the name from the response object and use that to lookup the id
  const name = userOption.cmd;
  const id = idFunc(items, name);

  return { name, id };
}

/**
 * Prompt the user for an Employee and store the answer
 * @param {string} display message to display when prompting user
 */
async function getEmployeeAsync(display = "Select an Employee") {
  return await getUserChoiceAsync(
    display,
    query.employee.view.all,
    helper.getFullName,
    helper.getEmployeeId);
}

/**
 * Prompt the user for a Manager and store the answer
 * @param {string} display message to display when prompting user
 */
async function getManagerAsync(display = "Select a Manager") {
  return await getUserChoiceAsync(
    display,
    query.employee.view.managers,
    helper.getFullName,
    helper.getEmployeeId);
}

/**
 * Prompt the user for a Department and store the answer
 * @param {string} display message to display when prompting user
 */
async function getDepartmentAsync(display = "Select a Department") {
  return await getUserChoiceAsync(
    display,
    query.department.view.all,
    (i) => i.name,
    helper.getDepartmentId);
}

/**
 * Prompt the user for a Role and store the answer
 * @param {string} display message to display when prompting user
 */
async function getRoleAsync(display = "Select a Role") {
  return await getUserChoiceAsync(
    display,
    query.role.view.all,
    (i) => i.title,
    helper.getRoleId);
}

/**
 * View Routine - View data by some criteria
 * @param {function} promptFuncAsync the prompt function to get the data needed
 * @param {function} viewFuncAsync the view function query
 * @param {string} field property in data to pass to final view function 
 */
async function viewRoutine(promptFuncAsync, viewFuncAsync, field) {
  const data = await promptFuncAsync();
  if (!data) return;
  return await viewFuncAsync(data[field]);
}

/**
 * View the department budget
 */
async function viewDepartmentBudgetAsync() {
  return await viewRoutine(getDepartmentAsync, query.department.view.budget, "id");
}

/**
 * View Employees By Department
 */
async function viewEmployeesByDeptAsync() {
  return await viewRoutine(getDepartmentAsync, query.employee.view.byDepartment, "name");
}

/**
 * View Employees By Manager
 */
async function viewEmployeesByManagerAsync() {
  return await viewRoutine(getManagerAsync, query.employee.view.byManager, "name");
}

/**
 * Remove Routine
 * @param {function} promptFunc 
 * @param {function} deleteFunc 
 * @param {string} type Type of record to remove, used for prompts
 */
async function removeRoutine(promptFunc, deleteFunc, type) {
  const data = await promptFunc(`Select ${type} to Remove`);
  if (!data) return;
  const count = await deleteFunc(data.id);
  helper.checkRemove(count, data.name);
}

/**
 * Remove an Employee from the database
 */
async function removeEmployeeAsync() {
  await removeRoutine(getEmployeeAsync, query.employee.delete, "an Employee");
}

/**
 * Remove an existing Role
 */
async function removeRoleAsync() {
  await removeRoutine(getRoleAsync, query.role.delete, "a Role");
}

/**
 * Remove an existing Department
 */
async function removeDepartmentAsync() {
  await removeRoutine(getDepartmentAsync, query.department.delete, "a Department");
}

/** 
 * Change the Role of an Employeee
 */
async function updateRoleAsync() {
  const employee = await getEmployeeAsync();
  if (!employee) return;

  const role = await getRoleAsync();
  const count = await query.employee.update.role(employee.id, role.id);
  helper.checkUpdate(count, employee.name);

}

/**
 * Change the Manager of an Employee
 */
async function updateManagerAsync() {
  const employee = await getEmployeeAsync("Employee");
  if (!employee) return;

  const manager = await getEmployeeAsync("Manager");
  const count = await query.employee.update.manager(employee.id, manager.id);
  helper.checkUpdate(count, employee.name);
}

/**
 * Add a New Employee
 */
async function addEmployeeAsync() {
  // Get the employee and Roles lists
  const [employees, roles] = await Promise.all([query.employee.view.all(), query.role.view.all()]);

  if (roles.length < 1) {
    out.error("You must define at least 1 role before adding employees");
    return null;
  }

  // Map the lists to a print friendly format
  const mappedRoles = roles.map(i => i.title);
  const mappedEmployees = employees.map(helper.getFullName);

  // Add Employee Sub-menu questions
  const addSub = [
    {
      type: "input",
      message: "What is the employee's first name?",
      name: "first_name",
      validate: helper.validateName
    },
    {
      type: "input",
      message: "What is the employee's last name?",
      name: "last_name",
      validate: helper.validateName
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
      choices: ["[NONE]", ...mappedEmployees],
      when: mappedEmployees.length > 0
    }
  ];

  // Send the Add request to the database
  try {
    // Prompt the user for Employee Details
    const employeeDetails = await inquirer.prompt(addSub);

    // Look up role id from role title
    employeeDetails.role_id = helper.getRoleId(roles, employeeDetails.role);

    // Look up manager id from full name
    employeeDetails.manager_id = helper.getEmployeeId(employees, employeeDetails.manager);

    // add the employee to the database
    const newEmployeeId = await query.employee.add(employeeDetails);

    // let the user know everything went well
    out.info(`Employee Added: ${helper.getFullName(employeeDetails)} (ID=${newEmployeeId})`);
  } catch (err) {
    out.debug("addEmployeeAsync ERROR", err);
    if (employeeDetails) {
      out.error(`ERROR: Unable to add - ${helper.getFullName(employeeDetails)} (${err.code})`);
    } else {
      out.error("ERROR: Unable to add employee");
    }
  }
}

/**
 * Add a new Role
 */
async function addRoleAsync() {
  // Get the Departments list
  const departments = await query.department.view.all();

  if (departments.length < 1) {
    out.error("You must add a department first");
    return;
  }

  // Map the list to a print friendly format
  const mappedDepartments = departments.map(i => i.name);

  // Add Role Sub-menu questions
  const addSub = [
    {
      type: "input",
      message: "What is the job title?",
      name: "title",
    },
    {
      type: "input",
      message: "What is the annual salary?",
      name: "salary",
      validate: helper.validateNumber
    },
    {
      type: "list",
      message: "What department is the role under?",
      name: "department",
      choices: mappedDepartments,
    }
  ];

  try {
    // Prompt the user for Employee Details
    const roleDetails = await inquirer.prompt(addSub);

    // Look up department id from full name
    roleDetails.department_id = helper.getDepartmentId(departments, roleDetails.department);

    // Send the Add request to the database
    const newRoleId = await query.role.add(roleDetails);

    // Let the user know everything went well
    out.info("Role Added - " + roleDetails.title);
  } catch (err) {
    // Something went wrong alert the user
    if (roleDetails) {
      out.error(`ERROR: Failed to add Role - ${roleDetails.title} ${err.code}`);
    } else {
      out.error('ERROR: Failed to add Role');
    }
  }
}

/**
 * Add a new Department
 */
async function addDepartmentAsync() {
  const addSub = [
    {
      type: "input",
      message: "What is the department name?",
      name: "name",
    },
  ];

  try {
    // Prompt the user for info
    const deptDetails = await inquirer.prompt(addSub);

    // Send the Add request to the database
    const newDeptId = await query.department.add(deptDetails);

    // Return the new department Id
    out.info("Department added - " + deptDetails.name);
  } catch (err) {
    // Something went wrong let the user know
    if (deptDetails) {
      out.error(`ERROR: Failed to add Department - ${deptDetails.name} (${err.code})`);
    } else {
      out.error("ERROR: Failed to add Department");
    }
  }
}

/**
 * Prompt Loop 
 * Prompt the user what they would like to do with the employee tracker.
 * Loops until the user asks to quit or an error occurs.
 */
async function run() {
  try {

    // Initialize the query module
    await query.init();

    do {
      // Main Menu Prompt
      const res = await inquirer.prompt(menuMain);
      const userOption = choicesMain.find(i => i.name === res.cmd);

      // User Selected Quit - break out of the prompt loop
      if (userOption.quit) {
        break;
      }

      // Call the user function
      const data = await userOption.func();

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
    // Catch All Errors and log to the console
    out.error("PROMPT ERROR", err);
  } finally {
    // Close the query module
    await query.close();
    out.info("Database Connection Closed");
  }
}

module.exports = {
  run
};