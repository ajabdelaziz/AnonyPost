var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./forum.db');

db.run("CREATE TABLE comments (commentID INTEGER PRIMARY KEY, entry TEXTS,  author TEXT, location TEXT, trackTopic INTEGER, FOREIGN KEY(trackTopic) REFERENCES topics(topicID));")