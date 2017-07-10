// Load the http module to create an http server.

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var PythonShell = require('python-shell');
var options = {mode: 'text'}
var fs = require('fs');
var app = express();

var windowOpen = true;
var sensorTempHumidity = 'test';
var sensorTemp1;
var sensorHumid1 = 'test';
var currentHumidityID = 0;
var lightIPs = [];
var lightNames = [];

var port = 8083;


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

app.listen(port);

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//IPs der Glühbirnen bekommen
PythonShell.run('python/discover_bulbs.py', options, function (err, bulb_ips) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    var cleanLightsString = bulb_ips.toString().replace(/u/g,'').replace(/'/g,'"').replace(/[\[\]']+/g,'');
    console.log(cleanLightsString);
    var lightObj = JSON.parse(cleanLightsString);
    for (var key in lightObj)
    {
        /*
         var ip = lightObj.ip;
         var label = lightObj.capabilities.name;
         var toggleStatus = lightObj.capabilities.power;
         var colour = lightObj.capabilities.rgb;
         var brightness = lightObj.capabilities.bright;
         */

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

    console.log('IPs: ' + lightIPs)
    console.log('Names: ' + lightNames);
});



app.get('/LichtOn', function (req, res) {
    var options2 = {
       mode: 'text',
       args: lightIPs[0]
   };
    PythonShell.run('python/toggle_light.py', options2, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
        //
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
