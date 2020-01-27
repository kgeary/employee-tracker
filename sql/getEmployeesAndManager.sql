-- Get All employees and their manager --
USE employee_trackerDB;

SELECT 
    e1.id EmployeeId,
    e1.first_name EmployeeFirstName,
    e1.last_name EmployeeLastName,
    e1.manager_id ManagerId,
    e2.first_name AS ManagerFirstName,
    e2.last_name AS ManagerLastName
FROM
    employee e1
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id
ORDER BY id