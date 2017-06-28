// Load the http module to create an http server.
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var windowOpen = true;
var sensorTemp1 = 'test';
var sensorHumid1 = 'test';
var pic = "http://bilder.bild.de/fotos/lachsack-36229038/Bild/1.bild.jpg";

app.get('/', function(req, res){
   res.render('index', {
       windowStatus: windowOpen,
       temperature1: sensorTemp1,
       humidity1: sensorHumid1,
       ImageLink: pic
   });
});

app.listen(8081);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//http://NanoPiAir_Mailinh/sensor/window/true
app.get('/sensor/window/:open', function(req, res){
    if(req.params.open == "true")
    {
        console.log("Window open");
        windowOpen = true;
        pic = "http://bilder.bild.de/fotos/lachsack-36229038/Bild/1.bild.jpg";
    }
    else
    {
        console.log("Window closed");
        windowOpen = false;
        pic = "http://bilder.bild.de/fotos/der-russische-praesident-wladimir-putin-exklusiv-im-bild-interview-44105778/Bild/2.bild.jpg";
    }
});

app.get('/sensor/temperature/:temp', function(req, res){
    sensorTemp1 = req.params.temp;
});

app.get('/sensor/humidity/:humid', function(req, res){
    sensorHumid1 = req.params.humid;
});

console.log('Server started:  NanoPiAir_Mailinh:8081');
