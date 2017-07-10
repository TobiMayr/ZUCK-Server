// Load the http module to create an http server.

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var PythonShell = require('python-shell');
//var favicon = require('serve-favicon');
var options = {mode: 'text'}
var fs = require('fs');
var request = require('request');
var app = express();

var sensorTempHumidity = 'test';
var sensorTemp1;
var sensorHumid1 = 'test';
var lightIPs = [];
var lightNames = [];
var windowSensors = [];
var currentId = 1;

var link = 'https://newsapi.org/v1/articles?source=die-zeit&sortBy=latest&apiKey=a1ef913e98c94358994dc8a8f7347aff;'
var port = 8082;

request(link, function (error , response , body) {

    if(!error && response.statusCode == 200){

        console.log(body);
    }
    else{
        console.log("hdsa");
    }
});

<<<<<<< HEAD
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
=======
app.get('/', function(req, res){

    var windowStat;
    if(!windowSensors[0]){
        windowStat = false;
    }else{
        windowStat = windowSensors[0].isOpen;
    }

>>>>>>> 4c7d2c713315f23f81d277bb154f3e40f432f284
   res.render('index', {
       windowStatus: windowStat,
       temperatureHumidity1: sensorTempHumidity,
       temperature1: sensorTemp1,
       humidity1: sensorHumid1
   });
});

//app.use(favicon());
app.use(express.static(__dirname + "/public"));

app.listen(port);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//IPs der Glühbirnen bekommen
PythonShell.run('python/discover_bulbs.py', options, function (err, bulb_ips) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    var cleanLightsString = bulb_ips.toString().replace(/u/g,'').replace(/'/g,'"').replace(/[\[\]']+/g,'');
    // console.log(cleanLightsString);
    var lightObj = JSON.parse(cleanLightsString);
    for (var key in lightObj)
    {

         /*var ip = lightObj.ip;
         var label = lightObj.capabilities.name;
         var toggleStatus = lightObj.capabilities.power;
         var colour = lightObj.capabilities.rgb;
         var brightness = lightObj.capabilities.bright;*/


        if (key === 'ip'){
            lightIPs.push(lightObj[key]);
        }else if (key === 'capabilities'){
            for (var capability in lightObj[key]){
                if (capability === 'name'){
                    lightNames.push(lightObj[key][capability]);
                }
            }
        }
    }

    console.log('IPs: ' + lightIPs);
    console.log('Names: ' + lightNames);
});



app.get('/LichtOn', function (req, res, next) {
    var options2 = {
       mode: 'text',
       args: lightIPs[0]
   };
    PythonShell.run('python/toggle_light.py', options2, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
    });

});

//http://zuck_server/sensor/window/true
app.get('/sensor/window/:open/:id', function(req, res){

    var foundIp = false;
    for(var i = 0; i < windowSensors.length; i++){
        if(parseInt(req.params.id) == windowSensors[i].id){
            foundIp = true;
            console.log('found IP!');
            if(req.params.open === 'true')
            {
                console.log("Window open");
                windowSensors[i].isOpen = true;
            }
            else
            {
                console.log("Window closed");
                windowSensors[i].isOpen = false;
            }
        }
    }
    if(!foundIp){
        res.write('\z0\z');
        res.end();
    }
});


app.get('/sensor/signin/window/', function(req, res){
    console.log('signed in with currentId: ' + currentId);
    var windowSens = {
        id: currentId,
        isOpen: true
    };
    windowSensors.push(windowSens);
    res.write('\z' + currentId + '\z');
    res.end();
    currentId++;
});

app.get('/sensor/temphumid/:temp', function(req, res){
    sensorTempHumidity = req.params.temp;

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

console.log('Server started at port:' + port);

