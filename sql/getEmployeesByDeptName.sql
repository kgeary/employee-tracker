-- Get All Employees by Dept

USE employee_trackerDB;

SELECT 
    e1.id,
    e1.first_name AS First,
    e1.last_name AS Last,
    role.title AS Position,
    role.salary AS Salary,
    department.name AS Department,
    CONCAT(e2.first_name, ' ', e2.last_name) AS 'Manager'
FROM
    employee e1
        JOIN
    role ON e1.role_id = role.id
        JOIN
    department ON role.department_id = department.id
        LEFT JOIN
    employee e2 ON e1.manager_id = e2.id
WHERE
    department.name = 'Engineering'
ORDER BY id