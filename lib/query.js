/**
 * NOTE THIS FILE CAN ONLY BE INCLUDED IN ONE LOCATION
 */
const DB = require("./DB");
const out = require("./out");

const db = new DB();

// Connect to the database (not really needed) but a good test for connectivity
async function init() {
  await db.connect();
}

// Close the database connection
async function close() {
  await db.close();
}

/** 
 * Get All Entries - SELECT
 * @param {string} sql SQL to execute
 * @param {array} values Parametized Values
 * 
 * @returns {array} Row results object array
 */
async function getAll(sql, values) {
  const rows = [];
  try {
    const rows = await db.query(sql, values);
    return rows;
  } catch (err) {
    out.debug(err.code);
    throw err;
  }
}

/**
 * Modify Record - Insert, Update or Delete a record
 * @param {string} sql SQL to execute
 * @param {values} values Parametized values
 * @returns {number} number of affected rows
 */
async function modifyRecord(sql, values) {
  try {
    const result = await db.query(sql, values);
    return result.affectedRows;
  } catch (err) {
    out.debug(err.code);
    return err.code;
  }
}

// Views
async function viewAllEmployees() {
  return getAll(
    `SELECT 
    e1.id,
    e1.first_name,
    e1.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT(e2.first_name, " ", e2.last_name) AS 'manager'
    FROM
      employee e1
    JOIN
      role ON e1.role_id = role.id
    JOIN
      department ON role.department_id = department.id
    LEFT JOIN
      employee e2 ON e1.manager_id = e2.id
    ORDER BY e1.id`
  );
}

async function viewAllEmployeesByDept(department_name) {
  return getAll(
    `SELECT 
    e1.id,
    e1.first_name,
    e1.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT(e2.first_name, " ", e2.last_name) AS 'manager'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        JOIN
    department ON role.department_id = department.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id
    WHERE department.name = ?
    ORDER BY e1.id`, [department_name]);
}

async function viewAllEmployeesByMgr(manager_name) {
  return getAll(
    `SELECT 
    e1.id,
    e1.first_name,
    e1.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT(e2.first_name, " ", e2.last_name) AS 'manager'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        JOIN
    department ON role.department_id = department.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id 
WHERE 
    CONCAT(e2.first_name, " ", e2.last_name) = ?
ORDER BY e1.id`,
    [manager_name]);
}

async function viewAllManagers() {
  return getAll(
    `SELECT DISTINCT e1.id, e1.first_name, e1.last_name from employee as e1
    JOIN employee as e2
      ON e1.id = e2.manager_id`
  );
}

async function allRoles() {
  return getAll(
    `SELECT role.id, role.title, role.salary, department.name AS department 
    FROM role 
    JOIN department
      ON role.department_id = department.id
    ORDER BY role.id`
  );
}

async function allDepartments() {
  return getAll("SELECT * FROM Department ORDER BY id");
}

async function departmentBudget(department_id) {
  return await db.query(
    `SELECT department.name as department, SUM(role.salary) as budget
    FROM employee
    JOIN role
      ON employee.role_id = role.id
    JOIN department
      on role.department_id = department.id
    WHERE department_id = ?`,
    [department_id])
    .then((result) => {
      return result;
    });
}

// Add New Employee
async function addEmployee(employee) {
  return await db.query(
    `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?, ?, ?, ?)`,
    [employee.first_name, employee.last_name, employee.role_id, employee.manager_id])
    .then((result) => {
      return result.insertId;
    });
}

// Add New Role
async function addRole(role) {
  return await db.query(
    `INSERT INTO role (title, salary, department_id)
    VALUES (?, ?, ?)`,
    [role.title, role.salary, role.department_id])
    .then((result) => {
      return result.insertId;
    });
}

// Add New Department
async function addDepartment(department) {
  return await db.query(
    `INSERT INTO department (name) VALUES (?)`,
    [department.name])
    .then((result) => {
      return result.insertId;
    });
}

// UPDATE Employee Role
async function updateRole(employeeId, roleId) {
  return await modifyRecord(
    `UPDATE employee SET role_id = ? 
    WHERE employee.id = ?;`,
    [roleId, employeeId]);
}

// Update Employee Manager
async function updateManager(employeeId, managerId) {
  return await modifyRecord(
    `UPDATE employee SET manager_id = ? 
    WHERE employee.id = ?;`,
    [managerId, employeeId]);
}

// Delete Employee
async function deleteEmployee(employeeId) {
  return await modifyRecord(
    `DELETE FROM employee WHERE employee.id = ?`, [employeeId]);
}

// Delete Department
async function deleteDepartment(departmentId) {
  return await modifyRecord(
    `DELETE FROM department WHERE department.id = ?`, [departmentId]);
}

// Delete Role
async function deleteRole(roleId) {
  return await modifyRecord(`DELETE FROM role WHERE role.id = ?`, [roleId]);
}

module.exports = {
  init,
  close,
  employee: {
    add: addEmployee,
    delete: deleteEmployee,
    update: {
      manager: updateManager,
      role: updateRole
    },
    view: {
      all: viewAllEmployees,
      byDepartment: viewAllEmployeesByDept,
      byManager: viewAllEmployeesByMgr,
      managers: viewAllManagers
    }
  },

  department: {
    add: addDepartment,
    delete: deleteDepartment,
    view: {
      all: allDepartments,
      budget: departmentBudget
    }
  },

  role: {
    add: addRole,
    delete: deleteRole,
    view: {
      all: allRoles
    }
  },
}