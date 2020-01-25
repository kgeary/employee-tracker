const inquirer = require("inquirer");

const choicesMain = [
  { name: "View All Employees", func: null },
  { name: "View All Employees by Department", func: null },
  { name: "View All Employees by Manager", func: null },
  { name: "Add Employee", func: null },
  { name: "Remove Employee", func: null },
  { name: "Update Employee Role", func: null },
  { name: "Update Employee Manager", func: null },
  { name: "View All roles", func: null },
  { name: "Add Role", func: null },
  { name: "Remove Role", func: null },
  { name: "View All Departments", func: null },
  { name: "Add Department", func: null },
  { name: "Remove Department", func: null },
];

const choicesRoles = []; // TODO
const choicesEmployees = []; //

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
  roles =  []; // query all roles

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
  const res = await inquirer.prompt(menuMain);
  const selectedOption = choicesMain.find(i => i.name === res.cmd);

  const sub = await selectedOption.func();
}

module.exports = {
  prompt
};