-- Get All Employees who are Managers --
USE employee_trackerdb;

SELECT DISTINCT e1.id, e1.first_name, e1.last_name from employee as e1
JOIN employee as e2
	ON e1.id = e2.manager_id