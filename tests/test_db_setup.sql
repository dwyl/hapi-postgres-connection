/* These SQL statements setup the test database tables we need for our tests */
/* first drop test tables from previous session so we have a clean database */
DROP SCHEMA public cascade;
CREATE SCHEMA public;
/* create the people table */
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL
);
/* insert a person into the people table */
INSERT INTO people (email, password)
VALUES (
  'test@test.net',
  '$2a$12$OgPE9DUNM0KaSodSQVJvw.36GjolssAeO.dfi7a9cmc9KbQTDTj7W'
);
/* create logs table */
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    log_timestamp INTEGER DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
    message VARCHAR(160) NOT NULL
);
INSERT INTO logs (message)
VALUES (
  'Hello World!'
);
