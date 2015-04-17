var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./forum.db');

db.run("CREATE TABLE pusers (userID INTEGER PRIMARY KEY, username VARCHAR);")