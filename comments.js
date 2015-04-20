var sqlite3 = require('sqlite3')
var fs = require('fs');
var Mustache = require('mustache');
var request = require('request')
var marked = require('marked');

var db = new sqlite3.Database('./forum.db');


var geocoder = {
  url: "http://ipinfo.io/json"
};

var comments = {

  allComments: function (req, res) {
    var template = fs.readFileSync('./views/comments.html', 'utf8');
  
    db.all('SELECT * FROM comments WHERE trackTopic = ' + req.params.id + ";", {}, function(err, comments) {
      updatedComments = [];
      console.log(comments)
      comments.forEach(function (comment){
        var newObj = {
          author: comment.author,
          location: comment.location,
          entry: marked(comment.entry)
          };

        updatedComments.push(newObj)
      })
      
    var html = Mustache.render(template, {allComments: updatedComments});
    res.send(html);
    })
  },

  NewComment: function (req,res) {
    var id = req.params.id
    var page = Mustache.render(fs.readFileSync('./views/newComment.html', 'utf8'), {id: id})
    res.send(page)
  },

  postComment: function (req, res) {
    var id = req.params.id
    db.run('PRAGMA foreign_keys = ON;')
  
      request.get(geocoder, function (error, response, body) {
        var parsed = JSON.parse(body)
        var parsedLocation = parsed.region
    
        db.run("INSERT INTO comments (commentID, entry, author, location, trackTopic) VALUES ( NULL, '" + req.body.entry + "', '" + req.body.author + "', '" + parsedLocation + "', " + id + ");")
        res.redirect("/topics")
      })
  }
}

module.exports = comments