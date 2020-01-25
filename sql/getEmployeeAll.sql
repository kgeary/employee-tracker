-- Get All Employees, Their Position, and their Manager's Name
USE employee_trackerDB;

SELECT 
    e1.id,
    e1.first_name AS First,
    e1.last_name AS Last,
    role.title AS Position,
    role.salary AS Salary,
    e2.first_name AS 'Mgr First',
    e2.last_name AS 'Mgr Last'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id