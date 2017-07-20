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
var lights = [];
var windowSensors = [];
var soilSensors = [];
var mailboxSensors = [];
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


app.get('/', function(req, res){

    if(!windowSensors[0]){
        windowSensors.push(windowSens = {
            status: 'kein Sensor',
            imgSrc: 'images/window.svg'
        });
    }

    if(!lights[0]){
        lights.push(light = {
            ip: 0,
            label: 0,
            toggleStatus: 0,
            imgSrc: 0,
            colour: 0,
            brightness: 0
        });
    }

    if(!mailboxSensors[0]){
        mailboxSensors.push(mailboxSens = {
            id: 0,
            status: 'kein Sensor'
        });
    }

    if(!soilSensors[0]){
        soilSensors.push(soilSens = {
            id: 0,
            humidity: 'kein Sensor'
        });
    }

    res.render('index', {
        title: 'HomeAutomationService ZUCK',
        windowSensors: windowSensors,
        temperatureHumidity1: sensorTempHumidity,
        temperature1: sensorTemp1,
        humidity1: sensorHumid1,
        lights: lights,
        soilSensors: soilSensors,
        mailboxSensors: mailboxSensors
    });
});

//app.use(favicon());
app.use(express.static(__dirname + "/public"));

app.listen(port);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


function discoverBulbs() {
//IPs der Glühbirnen bekommen
    PythonShell.run('python/discover_bulbs.py', options, function (err, bulb_ips) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        var cleanLightsString = bulb_ips.toString().replace(/u/g, '').replace(/'/g, '"').replace(/[\[\]']+/g, '');
        cleanLightsString = '[' + cleanLightsString + ']';
        // console.log(cleanLightsString);
        try {
            var lightsObj = JSON.parse(cleanLightsString);
        } catch (e) {
            console.log(e);
        }
        lights = [];
        if (lightsObj) {
            for (var i = 0; i < lightsObj.length; i++){

                var imageSrc = '';

                if (lightsObj[i].capabilities.power == 'on') {
                    imageSrc = "images/lightbulbOn.svg";
                } else if (lightsObj[i].capabilities.power == 'off') {
                    imageSrc = "images/lightbulb_new.svg";
                }


                var light = {
                    ip: lightsObj[i].ip,
                    label: lightsObj[i].capabilities.name,
                    toggleStatus: lightsObj[i].capabilities.power,
                    imgSrc: imageSrc,
                    colour: lightsObj[i].capabilities.rgb,
                    brightness: lightsObj[i].capabilities.bright
                };
                lights.push(light);
            }
        }
        //lights sortieren mit Hilfe der letzten Zahl der IP
        lights.sort(function(a,b) {
            var a = a.ip;
            var b = b.ip;

            a = a.split(".");
            b = b.split(".");
            if (a[a.length - 1] < b[b.length - 1])
                return -1;
            if (a[a.length - 1] > b[b.length - 1])
                return 1;
            return 0;
        });
    });

}

discoverBulbs();
setInterval(discoverBulbs, 30000);




app.get('/lights/:ip', function (req, res, next) {

    for(var i = 0; i <lights.length; i++){
        console.log("im array" + i);
        if(req.params.ip == lights[i].ip){
            console.log("ip gefunden");
            if(lights[i].toggleStatus == 'on'){
                discoverBulbs();
                lights[i].imgSrc = "images/lightbulbOn.svg";
                console.log("lampe an");
            }else if(lights[i].toggleStatus == 'off'){
                discoverBulbs();
                lights[i].imgSrc = "images/lightbulb_new.svg";
                console.log("lampe aus");
            }
        }
    }
    var options2 = {
        mode: 'text',
        args: req.params.ip
    };
    if(lights.length > 0){
        PythonShell.run('python/toggle_light.py', options2, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
        });
    }

    res.redirect('back');
});

/*
 app.get('/LichtRed', function (req, res, next) {
 var options2 = {
 mode: 'text',
 args: lightIPs[0]
 };
 if(lightIPs.length > 0){
 PythonShell.run('python/red_light.py', options2, function (err, results) {
 if (err) throw err;
 // results is an array consisting of messages collected during execution
 });
 }

 res.redirect('back');
 });

 app.get('/LichtBlue', function (req, res, next) {
 var options2 = {
 mode: 'text',
 args: lightIPs[0]
 };
 if(lightIPs.length > 0){
 PythonShell.run('python/blue_light.py', options2, function (err, results) {
 if (err) throw err;
 // results is an array consisting of messages collected during execution
 });
 }

 res.redirect('back');
 })

 app.get('/LichtGreen', function (req, res, next) {
 var options2 = {
 mode: 'text',
 args: lightIPs[0]
 };
 if(lightIPs.length > 0){
 PythonShell.run('python/green_light.py', options2, function (err, results) {
 if (err) throw err;
 // results is an array consisting of messages collected during execution
 });
 }

 res.redirect('back');
 });
 */

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
                windowSensors[i].status = 'Auf';
                windowSensors[i].imgSrc = 'images/window.svg'
            }
            else
            {
                console.log("Window closed");
                windowSensors[i].status = 'Zu';
                windowSensors[i].imgSrc = 'images/windowClosed.svg'
            }
        }
    }
    if(!foundIp){
        res.write('\z0\z');
        res.end();
    }
    else{
        res.write('\z1\z');
        res.end();
    }
});

app.get('/sensor/soil/:humidity/:id', function(req, res){

    var foundIp = false;
    for(var i = 0; i < soilSensors.length; i++){
        if(parseInt(req.params.id) == soilSensors[i].id){
            foundIp = true;
            console.log('found IP from soil sensor');
            soilSensors[i].humidity = parseInt(req.params.humidity) + '+';
        }
    }
    if(!foundIp){
        res.write('\z0\z');
        res.end();
    }
    else{
        res.write('\z1\z');
        res.end();
    }
});

app.get('/sensor/mailbox/:status/:id', function(req, res){

    var foundIp = false;
    for(var i = 0; i < mailboxSensors.length; i++){
        if(parseInt(req.params.id) == mailboxSensors[i].id){
            foundIp = true;
            console.log('found IP!');
            mailboxSensors[i].status = req.params.status + '+';
        }
    }
    if(!foundIp){
        res.write('\z0\z');
        res.end();
    }
    else{
        res.write('\z1\z');
        res.end();
    }
});

app.get('/sensor/signin/mailbox/', function(req, res){

    var mailboxSens = {
        id: currentId,
        status: 'empty'
    };
    mailboxSensors.push(mailboxSens);
    res.write('\z' + currentId + '\z');
    res.end();
    currentId++;
    console.log('signed in mailbox with currentId: ' + currentId);
});

app.get('/sensor/signin/soil/', function(req, res){
    console.log('signed in soilsensor   with currentId: ' + currentId);
    var soilSens = {
        id: currentId,
        humidity: 0
    };
    soilSensors.push(soilSens);
    res.write('\z' + currentId + '\z');
    res.end();
    currentId++;
});

app.get('/sensor/signin/window/', function(req, res){
    console.log('signed in with currentId: ' + currentId);
    var windowSens = {
        id: currentId,
        status: 'Auf',
        imgSrc: 'images/window.svg'
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

