const DB = require("./DB");

/** 
 * Get All Entries by Type
 * @param {DB} db Database object
 * @param {string} sql SQL to execute
 * 
 * @returns {array} Results object array
 */
async function getAll(db, sql) {
  const rows = [];
  const result = await db.query(sql);
  
  for (let index=0; index < result.length; index++) {
    const row = result[index];
    rows.push(row);
  }

  return rows;
}

/**
 * Remove Entry
 * @param {DB} db Database object
 * @param {string} sql SQL to execute
 * @param {string} description Table being affected
 */
async function removeEntry(db, sql, description) {
  const result = await db.query(sql);
  if (result.affectedRows < 1) { throw new Error("Failed to delete " + description); }
  return result.affectedRows;
}


/**
 * Add New Employee
 * 
 * @param {DB} db database to act on
 * @param {Object} obj Object with employee fields to add
 */
async function addEmployee(db, employee) {
  db.query(`INSERT INTO employee ("first_name", "last_name", "role_id", "manager_id")
  VALUES (${employee.first_name}, ${employee.last_name}, ${employee.role_id}, ${employee.manager_id})`)
  .then((result) => {
    console.log(result);
  });
}

async function viewAllEmployees(db) {
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
    employee e2 ON e1.manager_id = e2.id`
);}

async function viewAllEmployeesByDept(db, department_id) {
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
    WHERE department.id = ${department_id}`
    );
}

async function viewAllEmployeesByMgr(db, manager_id) {
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
    employee e2 ON e1.manager_id = e2.id WHERE e1.manager_id = ${manager_id}`
    );
}

async function allRoles(db) {
  return getAll(db, "SELECT * FROM Role");
}

async function allDepartments(db) {
  return getAll(db, "SELECT * FROM Department");
}

async function deleteEmployee(db, employeeId) {
  return removeEntry(db, `DELETE FROM employee WHERE employee.id = ${employeeId}`, "Employee");
}

async function deleteDepartment(db, departmentId) {
  return removeEntry(db, `DELETE FROM department WHERE department.id = ${departmentId}`, "Department");
}

async function deleteRole(db, roleId) {
  return removeEntry(db, `DELETE FROM role WHERE role.id = ${roleId}`, "Role");
}

module.exports = {
  add: {
    employee: addEmployee,
    department: null,
    role: null,
  },

  delete: {
    employee: deleteEmployee,
    department: deleteDepartment,
    role: deleteRole,
  },

  update: {
    employeeRole: null,
    employeeManager: null,
  },

  view: {
    allEmployees: viewAllEmployees,
    allEmployeesByDepartment: viewAllEmployeesByDept,
    allEmployeesByManager: viewAllEmployeesByMgr,
    allRoles: allRoles,
    allDepartments: allDepartments,
  }
}