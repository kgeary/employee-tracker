const out = require("./out");

const getFullName = (i) => `${i.first_name} ${i.last_name}`;
const getAddStr = (data) => `\nNew record addded to Database (ID = ${data}).\n`;
const getRemoveStr = (data) => `\nRecord(s) Removed (count=${data})\n`;
const getUpdateStr = (data) => `\nRecord(s) Updated. (count=${data})\n`;

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
  if (count > 0) {
    out.info(`${name} was deleted`);
  } else {
    out.error(`Unable to delete ${name}!`);
  }
}

function checkUpdate(count, name) {
  if (count > 0) {
    out.info(`${name} was updated`);
  } else {
    out.error(`Unable to update ${name}!`);
  }
}

module.exports = {
  getAddStr,
  getRemoveStr,
  getUpdateStr,
  getFullName,
  getDepartmentId,
  getEmployeeId,
  getRoleId,
  checkRemove,
  checkUpdate
}
