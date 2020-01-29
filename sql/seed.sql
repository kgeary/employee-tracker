USE employee_trackerDB;

--- Seed Departments ---
INSERT INTO
  Department (name)
VALUES
  ("Accounting"),
  ("Business Development"),
  ("Engineering"),
  ("Human Resources"),
  ("Information Technology");

--- Seed Roles ---
INSERT INTO
  Role (title, salary, department_id)
VALUES
  ("Jr. Accountant", 50000, 1),
  ("Sr. Accountant", 100000, 1),
  ("Manager of Accounting", 100000, 1),
  ("Business Development Associate", 60000, 2),
  ("Manager of Development", 150000, 2),
  ("Engineer 1", 50000, 3),
  ("Engineer 2", 75000, 3),
  ("Engineer 3", 100000, 3),
  ("Manager of Engineering", 150000, 3),
  ("IT Help Desk", 40000, 4),
  ("IT Specialist", 70000, 4),
  ("IT Manager", 120000, 4);

--- Seed Employees
INSERT INTO
  Employee (first_name, last_name, role_id, manager_id)
VALUES
  ("Adam", "Anderson", 3, null),
  ("Bill", "Bower", 1, 1),
  ("Charlie", "Cats", 9, null),
  ("Doug", "Dewey", 6, 3),
  ("Ed", "Eerie", 6, 1),
  ("Fred", "Funk", 7, 2),
  ("Gary", "Gulp", 7, 2),
  ("Hank", "Henry", 8, 2),
  ("Isaac", "Irwin", 4, 1),
  ("Jarvis", "James", 4, 1);

SELECT
  *
FROM
  Employee