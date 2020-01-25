USE employee_trackerDB;

--- Seed Departments ---
INSERT INTO Department (name) VALUES ("Accounting");
INSERT INTO Department (name) VALUES ("Business Development");
INSERT INTO Department (name) VALUES ("Engineering");
INSERT INTO Department (name) VALUES ("Human Resources");
INSERT INTO Department (name) VALUES ("Information Technology");

--- Seed Roles ---
INSERT INTO Role (title, salary, department_id) values ("Jr. Accountant", 50000, 1);
INSERT INTO Role (title, salary, department_id) values ("Sr. Accountant", 100000, 1);
INSERT INTO Role (title, salary, department_id) values ("Manager of Accounting", 100000, 1);
INSERT INTO Role (title, salary, department_id) values ("Business Development Associate", 60000, 2);
INSERT INTO Role (title, salary, department_id) values ("Manager of Development", 150000, 2);
INSERT INTO Role (title, salary, department_id) values ("Engineer 1", 50000, 3);
INSERT INTO Role (title, salary, department_id) values ("Engineer 2", 75000, 3);
INSERT INTO Role (title, salary, department_id) values ("Engineer 3", 100000, 3);
INSERT INTO Role (title, salary, department_id) values ("Manager of Engineering", 150000, 3);
INSERT INTO Role (title, salary, department_id) values ("IT Help Desk", 40000, 4);
INSERT INTO Role (title, salary, department_id) values ("IT Specialist", 70000, 4);
INSERT INTO Role (title, salary, department_id) values ("IT Manager", 120000, 4);

--- Seed Employees
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Adam", "Anderson", 3, null);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Bill", "Bower", 1, 1);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Charlie", "Cats", 9, null);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Doug", "Dewey", 6, 3);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Ed", "Eerie", 6, 1);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Fred", "Funk", 7, 2);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Gary", "Gulp", 7, 2);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Hank", "Henry", 8, 2);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Isaac", "Irwin", 4, 1);
INSERT INTO Employee (first_name, last_name, role_id, manager_id) values ("Jarvis", "James", 4, 1);

