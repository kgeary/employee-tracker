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

/**
 * Remove an Entry from a table
 * @param {DB} db database object
 * @param {number} id Element ID
 * @param {function} removeFunc Query Function to execute to remove record 
 * @param {table} table table to remove from
 * @param {name} name of the element being removed
 * @returns {number} number of rows affected
 */
async function removeEntryAsync(db, id, removeFunc, table, name) {
  const count = await removeFunc(db, id);
  if (count < 1) {
    out.error(`Failed to delete ${name} from ${table}`);
  } else {
    out.info(`${name} deleted from ${table}`);
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
  removeEntryAsync,  
}
