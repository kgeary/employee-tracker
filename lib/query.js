const DB = require("./DB");
const out = require("./out");
/** 
 * Get All Entries
 * @param {DB} db Database object
 * @param {string} sql SQL to execute
 * 
 * @returns {array} Row results object array
 */
async function getAll(db, sql) {
  const rows = [];
  const result = await db.query(sql);

  for (let index = 0; index < result.length; index++) {
    const row = result[index];
    rows.push(row);
  }

  return rows;
}

/**
 * Modify Record - Update or delete a record
 * @param {DB} db Database object
 * @param {string} sql SQL to execute
 * @returns {number} number of affected rows
 */
async function modifyRecord(db, sql) {
  try {
    const result = await db.query(sql);
    return result.affectedRows;
  } catch (err) {
    out.debug(err.message);
    return 0;
  }
}

// Views
async function viewAllEmployees(db) {
  return getAll(db,
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

async function viewAllEmployeesByDept(db, department_name) {
  return getAll(db,
    `SELECT 
    e1.id,
    e1.first_name AS First,
    e1.last_name AS Last,
    role.title AS Position,
    role.salary AS Salary,
    department.name AS Department,
    CONCAT(e2.first_name, " ", e2.last_name) AS 'Manager'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        JOIN
    department ON role.department_id = department.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id
    WHERE department.name = "${department_name}"
    ORDER BY e1.id`
  );
}

async function viewAllEmployeesByMgr(db, manager_name) {
  return getAll(db,
    `SELECT 
    e1.id,
    e1.first_name AS First,
    e1.last_name AS Last,
    role.title AS Position,
    role.salary AS Salary,
    department.name AS Department,
    CONCAT(e2.first_name, " ", e2.last_name) AS 'Manager'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        JOIN
    department ON role.department_id = department.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id WHERE CONCAT(e2.first_name, " ", e2.last_name) = "${manager_name}"
ORDER BY e1.id`
  );
}

async function allRoles(db) {
  return getAll(db, 
    `SELECT role.id, role.title, role.salary, department.name AS department 
    FROM role 
    JOIN department
      ON role.department_id = department.id
    ORDER BY role.id
    `);
}

async function allDepartments(db) {
  return getAll(db, "SELECT * FROM Department ORDER BY id");
}

// Add New Employee
async function addEmployee(db, employee) {
  return await db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES ("${employee.first_name}", "${employee.last_name}", ${employee.role_id}, ${employee.manager_id})`)
    .then((result) => {
      return result.insertId;
    });
}

// Add New Role
async function addRole(db, role) {
  return await db.query(`INSERT INTO role (title, salary, department_id)
  VALUES ("${role.title}", ${role.salary}, ${role.department_id})`)
    .then((result) => {
      return result.insertId;
    });
}

// Add New Department
async function addDepartment(db, department) {
  return await db.query(`INSERT INTO department (name)
  VALUES ("${department.name}")`)
    .then((result) => {
      return result.insertId;
    });
}

// UPDATE Employee Role
async function updateRole(db, employeeId, roleId) {
  return modifyRecord(db,
    `UPDATE employee SET role_id = ${roleId} 
    WHERE employee.id = ${employeeId};`, 
    "Employee Role");
}

// Update Employee Manager
async function updateManager(db, employeeId, managerId) {
  return modifyRecord(db,
    `UPDATE employee SET manager_id = ${managerId} 
    WHERE employee.id = ${employeeId};`,
    "Employee Manager");
}

// Delete Employee
async function deleteEmployee(db, employeeId) {
  return modifyRecord(db, `DELETE FROM employee WHERE employee.id = ${employeeId}`, "employee");
}

// Delete Department
async function deleteDepartment(db, departmentId) {
  return modifyRecord(db, `DELETE FROM department WHERE department.id = ${departmentId}`, "epartment");
}
// Delete Role
async function deleteRole(db, roleId) {
  return modifyRecord(db, `DELETE FROM role WHERE role.id = ${roleId}`, "role");
}

module.exports = {
  add: {
    employee: addEmployee,
    department: addDepartment,
    role: addRole,
  },

  delete: {
    employee: deleteEmployee,
    department: deleteDepartment,
    role: deleteRole,
  },

  update: {
    role: updateRole,
    manager: updateManager,
  },

  view: {
    allEmployees: viewAllEmployees,
    allEmployeesByDepartment: viewAllEmployeesByDept,
    allEmployeesByManager: viewAllEmployeesByMgr,
    allRoles: allRoles,
    allDepartments: allDepartments,
  }
}