#include <ESP8266WiFi.h>
#include <EEPROM.h>

const char* ssid = "ZUCK";
const char* password = "ruckzuck";
const char* host = "NanoPiAir_Mailinh";
const int httpPort = 8081;
WiFiClient client;

const int CONTACTPIN = 4;
bool send = false;

void setup() 
{
  Serial.begin(115200);
  EEPROM.begin(1);
  pinMode(CONTACTPIN, INPUT_PULLUP);
  
  delay(10);

  Serial.println("");
  Serial.println("");
  Serial.println("Connecting to");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while(WiFi.status() != WL_CONNECTED)
  {
    delay(5000);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP adress:");
  Serial.println(WiFi.localIP());

  Serial.println("Connecting to");
  Serial.println(host);

  String windowOpen = "false";
  boolean lastState = bitRead(EEPROM.read(1), 1);
  
  if(digitalRead(CONTACTPIN) == HIGH)
  {
    windowOpen = "true";
    if(!lastState)
    {
      byte EEPROMBYTE = EEPROM.read(1);
      bitWrite(EEPROMBYTE, 1, true);
      EEPROM.write(1, EEPROMBYTE);
      EEPROM.commit();
      send = true;
    }
  }else
  {
    if(lastState)
    {
      byte EEPROMBYTE = EEPROM.read(1);
      bitWrite(EEPROMBYTE, 1, false);
      EEPROM.write(1, EEPROMBYTE);
      EEPROM.commit();
      send = true;
    }
  }
  
  if(send)
  {
    if(client.connect(host, httpPort))
    {
      String packet = "/sensor/window/" + windowOpen;
      client.print(String("GET ") + packet + " HTTP/1.1\r\n" + "HOST: " + host + "\r\n" + "Connection: close\r\n\r\n");
      Serial.println(packet);
      send = false;

      int timeout = millis() + 5000;
        
      while(client.available() == 0)
      {
        if(timeout - millis() < 0)
        {
          Serial.println("Timeout!");
          client.stop();
          return;
        }
      }
      while(client.available())
      {
         String line = client.readStringUntil('\r');
         Serial.println(line);
      }
    }else
    {
      Serial.println("Connection failed");
    }
  }

  delay(1000);
  ESP.deepSleep(240e6);
}

void loop() 
{
   
}
