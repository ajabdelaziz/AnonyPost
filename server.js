var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser')
var methodOverride =require('method-override')
var topics = require('./topics.js')
var comments = require('./comments.js')
var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'))


app.get('/', topics.getWelcome); 

app.get('/topics', topics.getTopics); 

app.get('/topics/new', topics.newTopic);

app.get('/topics/:id/edit', topics.getEdit);

app.get('/topics/comments', topics.getByComments);

app.get('/topics/:id/comments', comments.allComments);

app.get('/topics/:id/comments/new', comments.NewComment);

app.get('/topics/:id', topics.getTopicID);

app.post('/topics', topics.postTopic);

app.post('/topics/:id/comments', comments.postComment);

app.put('/topics/:id/votes/positive', topics.upVoteTopic);

app.put('/topics/:id/votes/negative', topics.downVoteTopic);

app.put('/topics/:id', topics.editTopic);

app.delete('/topics/:id', topics.delTopic);
  
app.listen(3000, function () {
  console.log("LISTENING!");  
});