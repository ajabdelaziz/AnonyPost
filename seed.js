var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./forum.db');

db.run("INSERT INTO topics VALUES (NULL, 'how i learned to code', '2', 'New York', 'Adam');")

db.run("PRAGMA foreign_keys = ON;")

db.run("INSERT INTO comments VALUES (NULL, 'I learned at GA', 'Bob', 'Hong Kong', '1');")