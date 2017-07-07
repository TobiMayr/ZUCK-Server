// Load the http module to create an http server.

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var PythonShell = require('python-shell');
var fs = require('fs');
var app = express();

var windowOpen = true;
var sensorTempHumidity = 'test';
var sensorTemp1;
var sensorHumid1 = 'test';
var currentHumidityID = 0;
var lightsIPs;


/*
//Alle Glühbirnen im Netzwerk finden
PythonShell.run('python/XXXX.py', function (err) {
    if(err) throw err;
    console.log('Searched for light bulbs');
});

fs.readFile('YYYYY.txt', 'utf8', function(err, contents) {
    lightsIPs = contents;
    console.log(contents);
});
*/




app.get('/', function(req, res){
   res.render('index', {
       windowStatus: windowOpen,
       temperatureHumidity1: sensorTempHumidity,
       temperature1: sensorTemp1,
       humidity1: sensorHumid1
   });
});

app.use(express.static(__dirname + "/public"));

app.listen(8082);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/LichtOn', function (req, res) {
        var PythonShell = require('python-shell');
        var options = {mode: 'text'}

        PythonShell.run('testscript.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
            //sensorHumid1 = results;
        });
});

//http://NanoPiAir_Mailinh/sensor/window/true
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

app.get('/sensor/temperature/:temp', function(req, res){
    sensorTempHumidity = req.params.temp;
    //
    var strArray = sensorTempHumidity.split("-");
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
