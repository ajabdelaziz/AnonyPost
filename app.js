var express = require('express');
var sqlite3 = require('sqlite3')
var fs = require('fs');
var Mustache = require('mustache');
var morgan = require('morgan');
var bodyParser = require('body-parser')
var methodOverride =require('method-override')
var request = require('request')
var marked = require('marked');

var db = new sqlite3.Database('./forum.db');
var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'))

var geocoder = {
                url: "http://ipinfo.io/json"
  };

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});


app.get('/', function (req, res) {
  res.send(fs.readFileSync('./views/index.html', 'utf8'));
});

app.get('/topics', function (req, res) {
  var template = fs.readFileSync('./views/topics.html', 'utf8');
  
  db.all('SELECT * FROM topics ORDER BY votes DESC;', function (err, topics) {
    var html = Mustache.render(template, {allTopics: topics});
    res.send(html);
  })

});

app.get('/topics/comments', function (req, res) {
  var template = fs.readFileSync('./views/byComments.html', 'utf8');
  
  db.all('SELECT * FROM topics LEFT OUTER JOIN comments WHERE topicID = trackTopic GROUP BY topic ORDER BY entry DESC;', function (err, topics) {
    var html = Mustache.render(template, {allTopics: topics});
    res.send(html);
  })

});


app.get('/topics/:id/comments', function (req, res) {
  var template = fs.readFileSync('./views/comments.html', 'utf8');
  
  db.all('SELECT * FROM comments WHERE trackTopic = ' + req.params.id + ";", {}, function(err, comments) {
    console.log(comments)
    var html = Mustache.render(template, {allComments: comments});
    res.send(html);
  })

})

app.get('/topics/new', function (req,res) {
    res.send(fs.readFileSync('./views/newTopic.html', 'utf8'))
})

//marked needed
app.get('/topics/:id/comments/new', function (req,res) {
  var id = req.params.id
  var page = Mustache.render(fs.readFileSync('./views/newComment.html', 'utf8'), {id: id})
  res.send(page)
})


app.post('/topics/:id/comments', function (req, res) {
  var id = req.params.id
  db.run('PRAGMA foreign_keys = ON;')
  
  request.get(geocoder, function (error, response, body) {
    var parsed = JSON.parse(body)
    var parsedLocation = parsed.region
    
    db.run("INSERT INTO comments (commentID, entry, author, location, trackTopic) VALUES ( NULL, '" + req.body.entry + "', '" + req.body.author + "', '" + parsedLocation + "', " + id + ");")
    res.redirect("/topics")
  })

})


app.post('/topics', function (req, res) {

  request.get(geocoder, function (error, response, body) {
    var parsed = JSON.parse(body)
    var parsedLocation = parsed.region
    
    db.run("INSERT INTO topics (topicID, topic, votes, location, author) VALUES ( NULL, '" + req.body.topic + "', '0' , '" + parsedLocation + "', '" + req.body.author + "');")
  })

  res.redirect("/topics")
})

app.put('/topics/:id/votes', function (req,res) {

   db.run("UPDATE topics SET votes = votes + 1 WHERE topicID = " + req.params.id + ";")
   res.redirect('/topics')
})

app.get('/topics/:topicid/comment/:commentid', function (req,res) {
  
  db.all("SELECT * FROM comments WHERE trackTopic = " +req.param.topicid + " AND commendID = " +req.param.commentID, {}, function(err,comment){
    
    fs.readFile('./views/showComment.html', 'utf8', function (err, html) {
      var renderedHTML = Mustache.render(html, comment[0])
      res.send(renderedHTML)
    })

  })

})

app.get('/topics/:id', function (req,res) {
  
  db.all("SELECT * FROM topics WHERE topicID = " + req.params.id, {}, function(err,topics){
    
    fs.readFile('./views/showTopic.html', 'utf8', function(err, html){
      var renderedHTML = Mustache.render(html, topics[0])
      res.send(renderedHTML)
    })

  })

});

app.get('/topics/:id/edit', function (req,res) {
  
  db.all("SELECT * FROM topics WHERE topicID = " + req.params.id, {}, function(err,topics){
    
    fs.readFile('./views/editTopic.html', 'utf8', function(err, html){
      var renderedHTML = Mustache.render(html, topics[0])
      res.send(renderedHTML)
    })

  })

});

app.delete('/topics/:id', function (req,res) {
  db.run("DELETE FROM topics WHERE topicID =" + req.params.id + ";")
  res.redirect("/topics")
})

//marked needed
app.put('/topics/:id', function (req, res) {
  var topicInfo = req.body;
  db.run("UPDATE topics SET topic ='" + topicInfo.topic + "', location = '" + topicInfo.location + "', author = '" + topicInfo.author + "' WHERE topicID = '" + req.params.id + "';")
  res.redirect("/topics")
})

app.listen(3000, function () {
  console.log("LISTENING!");  
});