const inquirer = require("inquirer");
const cTable = require("console.table");
const query = require("./query");
const DB = require("./DB");


const menuSub = [
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
      menu: menuSub,
      message: "Select a Department",
      choices: query.view.allDepartments,
      mapIn: i => i.name,
    },
    func: query.view.allEmployeesByDepartment 
  },
  {
    name: "View All Employees by Manager", 
    subMenu: {
      menu: menuSub,
      message: "Select a Manager",
      choices: query.view.allEmployees,
      mapIn: i => `${i.first_name} ${i.last_name}`,
    },
    func: query.view.allEmployeesByManager,
  },
  { 
    name: "Add Employee", 
    menu: null,
    func: null 
  },
  { 
    name: "Remove Employee", 
    menu: null,
    func: null 
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

async function addEmployee() {
  employees = []; // query all employee objects
  roles = []; // query all roles

  const menuAddEmp = [
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
      choices: roles.map(i => i.title),
    },
    {
      type: "input",
      message: "Who is the employee's manager?",
      name: "role",
      choices: employees.map(i => `${i.first_name} ${i.last_name}`),
    },
  ];

  const res = inquirer.prompt(menuAddEmp);

  // Add Employee

}

async function prompt() {
  try {
    db = new DB();
    await db.connect();

    do {
      const res = await inquirer.prompt(menuMain);
      const option1 = choicesMain.find(i => i.name === res.cmd);
      
      if (option1.quit) {
        break;
      } else if (option1.subMenu) {
        // For commands that require a sub-menu
        let subChoices = await option1.subMenu.choices(db);
        console.table(subChoices);   
        option1.subMenu.menu[0].message = option1.subMenu.message;
        option1.subMenu.menu[0].choices = subChoices.map(option1.subMenu.mapIn);

        const option2  = await inquirer.prompt(option1.subMenu.menu);
        
        // Call the final view Function
        const rows = await option1.func(db, option2.cmd);
        console.table(rows);
      } else {
        // For commands that do no require a sub-menu
        const rows = await option1.func(db);
        console.table(rows);
      }
      
    } while (true)
  } catch (err) {
    console.log("PROMPT ERROR", err);
  }
}

module.exports = {
  prompt
};