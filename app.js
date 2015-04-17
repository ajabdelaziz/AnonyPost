var express = require('express');
var sqlite3 = require('sqlite3')
var fs = require('fs');
var Mustache = require('mustache');
var morgan = require('morgan');
var bodyParser = require('body-parser')
var methodOverride =require('method-override')

var db = new sqlite3.Database('./forum.db');
var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'))

app.get('/', function(req, res){
  res.send(fs.readFileSync('./views/index.html', 'utf8'));
});

app.get('/topics', function(req, res) {
  var template = fs.readFileSync('./views/topics.html', 'utf8');

  db.all('SELECT * FROM topics;', function(err, topics) {
    var html = Mustache.render(template, {allTopics: topics});
    res.send(html);
  })
});

app.get('/topics/:id/comments', function (req, res){
  var template = fs.readFileSync('./views/comments.html', 'utf8');

  db.run('PRAGMA foreign_keys = ON;')

  db.all('SELECT * FROM comments WHERE trackTopic = ' + req.params.id + ";", {}, function(err, comments) {
    console.log(comments)
    var html = Mustache.render(template, {allComments: comments});
    res.send(html);
  })
})

app.get('/topics/new', function(req,res){
    res.send(fs.readFileSync('./views/newTopic.html', 'utf8'))
})

app.get('/topics/:id/comments/new', function(req,res){
    res.send(fs.readFileSync('./views/newComment.html', 'utf8'))
})

app.post('/topics/:id/comments', function(req, res){
    db.run('PRAGMA foreign_keys = ON;')
    db.run("INSERT INTO comments (commentID, entry, author, location, trackTopic) VALUES ( NULL, '" + req.body.entry + "', '" + req.body.author + "', '" + req.body.location + "', '" + req.params.id + "');")
    console.log(req.body.author)
    // res.send("You have posted a new comment")
    res.redirect("/topics")
})


app.post('/topics', function(req, res){
    db.run("INSERT INTO topics (topicID, topic, votes, location, author) VALUES ( NULL, '" + req.body.topic + "', '0' , '" + req.body.location + "', '" + req.body.author + "');")
    // res.send("You have created a new topic")
    res.redirect("/topics")
})

app.get('/topics/:topicid/comment/:commentid', function(req,res){
  db.all("SELECT * FROM comments WHERE trackTopic = " +req.param.topicid + " AND commendID = " +req.param.commentID, {}, function(err,comment){
 
    fs.readFile('./views/showComment.html', 'utf8', function(err, html){
      var renderedHTML = Mustache.render(html, comment[0])
      res.send(renderedHTML)
    })
  })
})

app.get('/topics/:id', function(req,res){
  db.all("SELECT * FROM topics WHERE topicID = " + req.params.id, {}, function(err,topics){
    fs.readFile('./views/showTopic.html', 'utf8', function(err, html){
    
      var renderedHTML = Mustache.render(html, topics[0])
      res.send(renderedHTML)
    })
  })
});


app.delete('/topics/:id', function(req,res){
  db.run("DELETE FROM topics WHERE topicID =" + req.params.id + ";")
  res.redirect("/topics")
})


app.put('/topics/:id/', function(req, res){
  var topicInfo = req.body;
  db.run("UPDATE topics SET topic ='" + topicInfo.topic + "', location = '" + topicInfo.location + "', author = '" + topicInfo.author + "' WHERE topicID = '" + req.params.id + "';")
  res.redirect("/topics")
})

app.listen(3000, function() {
  console.log("LISTENING!");  
});