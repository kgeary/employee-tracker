const getFullName = i => `${i.first_name} ${i.last_name}`;

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
function getDepartmentId(departments, name) {
  try {
    return roles.find(i => i.name === name).id;
  } catch {
    return null;
  }
}

module.exports = {
  getDepartmentId,
  getEmployeeId,
  getFullName,
  getRoleId,
}
