var sqlite3 = require('sqlite3')
var fs = require('fs');
var Mustache = require('mustache');
var request = require('request')
var marked = require('marked');

var db = new sqlite3.Database('./forum.db');


var geocoder = {
  
  url: "http://ipinfo.io/json"
  
  };

var topics = { 
  
  getWelcome: function (req, res) {
    res.send(fs.readFileSync('./views/index.html', 'utf8'));
    },

  getTopics:  function (require, res) {
    var template = fs.readFileSync('./views/topics.html', 'utf8');
      
      db.all('SELECT * FROM topics ORDER BY votes DESC;', function (err, topics) {
        var html = Mustache.render(template, {allTopics: topics});
        res.send(html);
           })
  },
  getByComments: function (req, res) {
   var template = fs.readFileSync('./views/byComments.html', 'utf8');
  
   db.all('SELECT * FROM topics LEFT OUTER JOIN comments WHERE topicID = trackTopic GROUP BY topic ORDER BY entry DESC;', function (err, topics) {
     var html = Mustache.render(template, {allTopics: topics});
     res.send(html);
   })

  },       

   newTopic:  function (req,res) {
     res.send(fs.readFileSync('./views/newTopic.html', 'utf8'))
    },

   postTopic: function (req, res) {

     request.get(geocoder, function (error, response, body) {
       var parsed = JSON.parse(body)
       var parsedLocation = parsed.region
    
      db.run("INSERT INTO topics (topicID, topic, votes, location, author) VALUES ( NULL, '" + req.body.topic + "', '0' , '" + parsedLocation + "', '" + req.body.author + "');")
      
        res.redirect("/topics")
      })
    },

  upVoteTopic: function (req,res) {

    db.run("UPDATE topics SET votes = votes + 1 WHERE topicID = " + req.params.id + ";")
    res.redirect('/topics')
  },

  downVoteTopic: function (req,res) {

   db.run("UPDATE topics SET votes = votes - 1 WHERE topicID = " + req.params.id + ";")
   res.redirect('/topics')
  },

  getTopicID: function (req,res) {

    db.all("SELECT * FROM topics WHERE topicID = " + req.params.id, {}, function (err,topics){
    
      fs.readFile('./views/showTopic.html', 'utf8', function(err, html){
        console.log(topics)
       var renderedHTML = Mustache.render(html, topics[0])  
        res.send(renderedHTML)
     })

    })

  },

  getEdit:  function (req,res) {

    db.all("SELECT * FROM topics WHERE topicID = " + req.params.id, {}, function(err,topics){
    
      fs.readFile('./views/editTopic.html', 'utf8', function(err, html){
      var renderedHTML = Mustache.render(html, topics[0])
       res.send(renderedHTML)
      })

   })

  },

 delTopic: function (req,res) {

    db.run("DELETE FROM topics WHERE topicID =" + req.params.id + ";")
    res.redirect("/topics")
  },

  editTopic: function (req, res) {
    var topicInfo = req.body;
    db.run("UPDATE topics SET topic ='" + topicInfo.topic + "', location = '" + topicInfo.location + "', author = '" + topicInfo.author + "' WHERE topicID = '" + req.params.id + "';")
    res.redirect("/topics")
  }
}

module.exports = topics