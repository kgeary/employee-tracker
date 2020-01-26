-- Get All Employee Info --
USE employee_trackerDB;

SELECT 
    employee.id, first_name, last_name, role.title
FROM
    employee
JOIN
    role ON employee.role_id = role.id
ORDER BY id