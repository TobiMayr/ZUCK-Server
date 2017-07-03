// Load the http module to create an http server.

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var windowOpen = true;
var sensorTempHumidity = 'test';
var sensorTemp1;
var sensorHumid1 = 'test';
var pic = "http://bilder.bild.de/fotos/lachsack-36229038/Bild/1.bild.jpg";
var currentHumidityID = 0;

//Glühbirne Python Script




app.get('/', function(req, res){
   res.render('index', {
       windowStatus: windowOpen,
       temperatureHumidity1: sensorTempHumidity,
       temperature1: sensorTemp1,
       humidity1: sensorHumid1,
       ImageLink: pic
   });
});

app.use(express.static(__dirname + "/public"));

app.listen(8081);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/LichtOn', function (req, res) {
        var PythonShell = require('python-shell');
        PythonShell.run('testscript.py', function (err) {
            if(err) throw err;
            console.log('finished');
        });
});

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
    sensorTempHumidity = req.params.temp;
    //
    var strArray = sensorTempHumidity.split("-")
    sensorTemp1 = strArray[0];
    sensorHumid1 = strArray[1];
});

/*
app.get('/sensor/allocateId/temperature', function(req, res){
    new humidity(++currentHumidityID, "Humidity_" + currentHumidityID, sensorTemp1, sensorHumid1);
    res.write(currentHumidityID.toString());
    res.end();
});
*/

console.log('Server started:  ZUCK_Server:8081');
