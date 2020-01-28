-- Drop Existing Database, Then Create New Database --
DROP DATABASE IF EXISTS employee_trackerDB;
CREATE DATABASE employee_trackerDB;
USE employee_trackerDB;

CREATE TABLE Department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) UNIQUE
);

CREATE TABLE Role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) UNIQUE,
  salary DECIMAL(10,2),
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES Department(id)
);

CREATE TABLE Employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  FOREIGN KEY (role_id) REFERENCES Role(id),
  FOREIGN KEY (manager_id) REFERENCES Employee(id),
  UNIQUE(first_name, last_name)
);