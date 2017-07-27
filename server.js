// Load the http module to create an http server.

var http = require('http').Server(app);
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var PythonShell = require('python-shell');
//var favicon = require('serve-favicon');
var options = {mode: 'text'}
var fs = require('fs');
var request = require('request');
var app = express();

var sensorTempHumidity = 'kein Sensor';
var sensorTemp1 = 'kein Sensor';
var sensorHumid1 = 'kein Sensor';
var lights = [];
var windowSensors = [];
var soilSensors = [];
var mailboxSensors = [];
var currentId = 1;

var port = 8082;
var windowImgClosed = 'images/windowClosed.svg';
var windowImgOpen = 'images/window.svg';
var mailboxImgFilled = 'images/mailboxFull.svg';
var mailboxImgEmpty = 'images/mailboxEmpty.svg';
var lightImgOn = 'images/lightbulbOn.svg';
var lightImgOff = 'images/lightbulb_new.svg';
var plantImgDry ='images/plantDry.svg';
var plantImgHealthy = 'images/plant.svg';
var tvImgOn = 'images/tvOn.svg';
var tvImgOff = 'images/tv.svg';
var coffeeImgOn = 'images/coffeeOn.svg';
var coffeeImgOff = 'images/coffee.svg';

var tvStatus = 'false';
var funkStatus = 'false';


app.get('/', function(req, res){

    if(!windowSensors[0]){
        windowSensors.push(windowSens = {
            id: 0,
            status: 'kein Sensor',
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
            humidity: 'kein Sensor',
            healthyStatus: 'true'
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
        mailboxSensors: mailboxSensors,
        tvStatus: tvStatus,
        funkStatus: funkStatus
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
        if (err){
            console.log("Could not load Lights. Probably Network down");
            console.log(err);
        }else {
            // results is an array consisting of messages collected during execution
            var cleanLightsString = bulb_ips.toString().replace(/u/g, '').replace(/'/g, '"').replace(/[\[\]']+/g, '');
            cleanLightsString = '[' + cleanLightsString + ']';
            console.log(cleanLightsString);
            try {
                var lightsObj = JSON.parse(cleanLightsString);
            } catch (e) {
                console.log(e);
            }
            lights = [];
            if (lightsObj) {
                for (var i = 0; i < lightsObj.length; i++) {

                    var imageSrc = '';

                    if (lightsObj[i].capabilities.power == 'on') {
                        imageSrc = lightImgOn
                    } else if (lightsObj[i].capabilities.power == 'off') {
                        imageSrc = lightImgOff
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
            lights.sort(function (a, b) {
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
        }
    });

}

discoverBulbs();
setInterval(discoverBulbs, 30000);


app.get('/lights/:ip', function (req, res) {

    for(var i = 0; i <lights.length; i++){
        console.log("im array" + i);
        if(req.params.ip == lights[i].ip){
            console.log("lampen ip gefunden");
            if(lights[i].toggleStatus == 'on'){
                discoverBulbs();
                lights[i].imgSrc = lightImgOn
                console.log("lampe an");
            }else if(lights[i].toggleStatus == 'off'){

                lights[i].imgSrc = lightImgOff
                console.log("lampe aus");
                discoverBulbs();
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
            console.log('found window sensor IP!');
            if(req.params.open === 'true')
            {
                console.log("Window open");
                windowSensors[i].status = 'Auf';
            }
            else
            {
                console.log("Window closed");
                windowSensors[i].status = 'Zu';
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
            soilSensors[i].humidity = parseInt(req.params.humidity) + '%';
            if(soilSensors[i].humidity < 20){
                soilSensors[i].healthyStatus = 'false'
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

app.get('/sensor/mailbox/:status/:id', function(req, res){

    var foundIp = false;
    for(var i = 0; i < mailboxSensors.length; i++){
        if(parseInt(req.params.id) == mailboxSensors[i].id){
            foundIp = true;
            console.log('found mailbox IP!');
            mailboxSensors[i].status = req.params.status;
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
        status: 'Leer'
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
        humidity: 0,
        healthyStatus: 'true'
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
        status: 'Auf'
    };
    windowSensors.push(windowSens);
    res.write('\z' + currentId + '\z');
    res.end();
    currentId++;
});

app.get('/sensor/temphumid/:temp', function(req, res){
    sensorTempHumidity = req.params.temp;
    console.log(sensorTempHumidity);
    var strArray = sensorTempHumidity.split("-");
    sensorTemp1 = strArray[0];
    sensorHumid1 = strArray[1];
});

//Coffee
app.get('/sensor/funk/:stat', function(req, res){
    funkStatus = req.params.stat;
    console.log(funkStatus);
});

//TV
app.get('/sensor/infrarot/:stat', function(req, res){
    tvStatus = req.params.stat;
});

setTimeout(discoverBulbs, 5000);

console.log('Server started at port:' + port);

