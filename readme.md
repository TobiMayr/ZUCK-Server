# ZUCK NodeJS Server


### Repository klonen:
`git clone https://github.com/TobiMayr/ZUCK-Server.git`

`server.js`       -> der Server (nodeJS)

`views/`          -> die Webseite (HTML/EJS)

`public/`         -> die Webseite (CSS, Bilder)


## Sonstiges:

### Nodeserver beim Booten starten:

#### Folgende Datei erstellen:
unter: `/etc/systemd/system/nodeserver.service`

``` Bash
[Unit]
Description=NodeJS server on startup
#Requires=After=mysql.service       # Requires the mysql service to run first

[Service]
ExecStart=/usr/bin/nodejs /root/NodeServer/server.js
# Required on some systems
#WorkingDirectory=/root/NodeServer
Restart=always
 # Restart service after 10 seconds if node service crashes
 RestartSec=10
 # Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodejs-example
#User=<alternate user>
#Group=<alternate group>
Environment=NODE_ENV=production PORT=1337

[Install]
WantedBy=multi-user.target
```

#### Service aktivieren:
`systemctl enable nodeserver.service`

#### Service starten:
`systemctl start nodeserver.service`

#### Service auf Fehler überprüfen:
`systemctl status nodeserver.service`

Mehr infos unter folgendem [link](https://www.axllent.org/docs/view/nodejs-service-with-systemd/)
