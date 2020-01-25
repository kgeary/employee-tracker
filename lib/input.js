const inquirer = require("inquirer");
const cTable = require("console.table");
const query = require("./query");
const DB = require("./DB");

const getFullName = i => `${i.first_name} ${i.last_name}`;

// A single question with a multiple choice list to be provided
const listSub = [
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
      menu: listSub,
      message: "Select a Department",
      choices: query.view.allDepartments,
      mapIn: i => i.name,
    },
    func: query.view.allEmployeesByDepartment
  },
  {
    name: "View All Employees by Manager",
    subMenu: {
      menu: listSub,
      message: "Select a Manager",
      choices: query.view.allEmployees,
      mapIn: getFullName,
    },
    func: query.view.allEmployeesByManager,
  },
  {
    name: "Add Employee",
    func: addEmployee,
    view: "add",
  },
  {
    name: "Remove Employee",
    subMenu: {
      menu: listSub,
      message: "Select an Employee to Remove",
      choices: query.view.allEmployees,
      mapIn: getFullName,
    },
    func: removeEmployee,
  },
  {
    name: "Update Employee Role",
    func: null
  },
  {
    name: "Update Employee Manager",
    func: null
  },
  {
    name: "View All roles",
    func: query.view.allRoles
  },
  {
    name: "Add Role",
    menu: null,
    func: null
  },
  {
    name: "Remove Role",
    menu: null,
    func: null
  },
  {
    name: "View All Departments",
    func: query.view.allDepartments
  },
  {
    name: "Add Department",
    func: null
  },
  {
    name: "Remove Department",
    func: null
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

function getEmployeeId(employees, managerName) {
  try {
    return employees.find(i => `${i.first_name} ${i.last_name}` == managerName).id;
  } catch {
    return null;
  }
}

function getRoleId(roles, roleName) {
  try {
    return roles.find(i => i.title == roleName).id;
  } catch {
    return null;
  }
}

function getDepartmentId(departments, name) {
  try {
    return roles.find(i => i.name === name).id;
  } catch {
    return null;
  }
}

async function addEmployee(db) {
  const [employees, roles] = await Promise.all([query.view.allEmployees(db), query.view.allRoles(db)]);
  
  const mappedRoles = roles.map(i => i.title);
  const mappedEmployees = employees.map(getFullName);
  console.table(mappedRoles);

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

  let employeeDetails = await inquirer.prompt(addSub);

  // Look up role id
  employeeDetails.role_id = getRoleId(roles, employeeDetails.role);

  // Look up manager id
  employeeDetails.manager_id = getEmployeeId(employees, employeeDetails.manager);

  // Send the Add request to the database
  const newEmployeeId = await query.add.employee(db, employeeDetails);

  // Return the new employee Id
  return newEmployeeId;
}

/**
 * Remove an Employee from the database
 * @param {DB} db 
 */
async function removeEmployee(db, employee_name) {

  query.removeEmployee(db)
}

async function prompt() {
  try {
    db = new DB();
    await db.connect();

    do {
      // Main Menu Prompt
      const res = await inquirer.prompt(menuMain);
      const option1 = choicesMain.find(i => i.name === res.cmd);

      // User Selected Quit
      if (option1.quit) {
        break;
      } else if (option1.subMenu) {

        // For commands that require a sub-menu
        let subChoices = await option1.subMenu.choices(db);

        // Update the message if specified
        if (option1.subMenu.message) {
          option1.subMenu.menu[0].message = option1.subMenu.message;
        }

        // map the array to provide an easy to see name
        option1.subMenu.menu[0].choices =
          subChoices.map(option1.subMenu.mapIn);

        // console.log(subChoices);
        const option2 = await inquirer.prompt(option1.subMenu.menu);

        // Call the final view Function
        if (option2.cmd) {
          const rows = await option1.func(db, option2.cmd);
          console.table(rows);
        }
      } else {
        // For commands that do not require a sub-menu
        const rows = await option1.func(db);

        if (!option1.view) {
          console.table(rows);
        } else if (option1.view === "add") {
          console.log(`\nNew Employee Addded to Database (ID = ${rows}).\n`);
        }
      }

    } while (true)
  } catch (err) {
    console.log("PROMPT ERROR", err);
  }
}

module.exports = {
  prompt
};