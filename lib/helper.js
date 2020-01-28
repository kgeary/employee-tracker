const out = require("./out");

/**
 * Return the full name from an employee as a single string
 * Used to map employee arrays to a printable list format
 * @param {Object} i an Employee object 
 */
const getFullName = (i) => `${i.first_name} ${i.last_name}`;

/**
 * Get Employee ID from Full Name
 * @param {array} employees 
 * @param {string} fullName
 * @returns {number} employee ID
 */
function getEmployeeId(employees, fullName) {
  try {
    return employees.find(i => `${i.first_name} ${i.last_name}` == fullName).id;
  } catch {
    return null;
  }
}

/**
 * Get Role ID
 * @param {array} roles Array of Role Objects
 * @param {string} roleName Name of the Role to Lookup 
 * @returns {number} role ID
 */
function getRoleId(roles, roleName) {
  try {
    return roles.find(i => i.title == roleName).id;
  } catch {
    return null;
  }
}

/**
 * Get Department ID
 * @param {array} departments Array of Department objects
 * @param {string} name Name of the Department to lookup 
 * @returns {number} department ID
 */
function getDepartmentId(departments, deptName) {
  try {
    return departments.find(i => i.name === deptName).id;
  } catch {
    return null;
  }
}

function checkRemove(count, name) {
  if (typeof count === "string") {
    out.error(`Unable to delete ${name}! (${count})`);
  } else {
    out.info(`${name} was deleted`);
  }
}

function checkUpdate(count, name) {
  if (typeof count === "string") {
    out.error(`Unable to update ${name}! (${count})`);
  } else {
    out.info(`${name} was updated`);
  }
}

function validateName(value) {
  if (/[\w]{1,}/.test(value)) {
    return true;
  } else {
    return "Invalid Name!";
  }
}

function validateNumber(value) {
  if (/[\d]+/.test(value)) {
    return true;
  } else {
    return "Invalid Number!";
  }
}

module.exports = {
  getFullName,
  getDepartmentId,
  getEmployeeId,
  getRoleId,
  checkRemove,
  checkUpdate,
  validateNumber,
  validateName
}
