// Load the http module to create an http server.
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var windowOpen = true;

app.get('/', function(req, res){
   res.render('index', {
       windowStatus: windowOpen
   });
});

app.listen(8081);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//http://127.0.0.1:8081/sensor/window/true
app.get('/sensor/window/:open', function(req, res){
    if(req.params.open == "true")
    {
        console.log("Window open");
        windowOpen = true;
    }
    else
    {
        console.log("Window closed");
        windowOpen = false;
    }
}); 
