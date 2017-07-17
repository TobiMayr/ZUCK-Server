#include <ESP8266WiFi.h>
#include <EEPROM.h>

const char* ssid = "ZUCK";
const char* password = "ruckzuck";
const char* host = "192.168.0.108";
const int httpPort = 8082;
const int IDAddress = 0;
const int bitAddress = 1;
const int windowPos = 0;
const int sendPos = 1;
WiFiClient client;

const int CONTACTPIN = 4;

void setup() 
{
  Serial.begin(115200);
  EEPROM.begin(2);
  pinMode(CONTACTPIN, INPUT_PULLUP);
  
  delay(10);

  Serial.println("");
  Serial.println("");
  Serial.println("Connecting to");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  int timeout = millis() + 5000;

  while(WiFi.status() != WL_CONNECTED)
  {
    if(timeout-millis() > 0)
    {
      delay(5000);
      Serial.print(".");
    }else
      ESP.deepSleep(5e6);   //for Showtime, else 120
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP adress:");
  Serial.println(WiFi.localIP());

  Serial.println("Connecting to");
  Serial.println(host);

  if (EEPROM.read(0) == 0)
  {
    if (client.connect(host, httpPort))
    {
      Serial.println("Asking for ID");
      sendGetRequest("/sensor/signin/window");
      String res = readServerResponse();
      EEPROM.write(IDAddress, res.toInt());
      EEPROM.commit();
      writeBitToFlash(bitAddress, sendPos, false);
    } else
    {
      Serial.println("Connection failed");
    }
    ESP.deepSleep(5e6);
  } else
  {
    Serial.println("Get window status");
    String windowOpen = "false";
    boolean sendLast = bitRead(EEPROM.read(bitAddress), sendPos);
    boolean sendNow = false;
    boolean lastState = bitRead(EEPROM.read(bitAddress), windowPos);

    if(!sendLast)
    {
      if(lastState)
        windowOpen = "true";
      else
        windowOpen = "false";

      sendNow = true;
    }else
    {
      if (digitalRead(CONTACTPIN) == HIGH)
      {
        windowOpen = "true";
        if (!lastState)
        {
          writeBitToFlash(bitAddress, windowPos, true);
          sendNow = true;
        }
      } else
      {
        if (lastState)
        {
          writeBitToFlash(bitAddress, windowPos, false);
          sendNow = true;
        }
      }
    }

    if (sendNow)
    {
      if (client.connect(host, httpPort))
      {
        Serial.println("Sending window status");
        int id = EEPROM.read(IDAddress);
        String packet = "/sensor/window/" + windowOpen;
        packet = packet + "/";
        packet = packet + id;
        sendGetRequest(packet);
        if(!sendLast)
          writeBitToFlash(bitAddress, sendPos, true);
          
        String res = readServerResponse();
        Serial.println("Server response: " +res);

        if(res.toInt() == 0)
        {
          Serial.println("Reset ID");
          EEPROM.write(IDAddress, 0);
          EEPROM.commit();
        }
      } else
      {
        Serial.println("Connection failed");
        if(sendLast)
          writeBitToFlash(bitAddress, sendPos, false);
          ESP.deepSleep(10e6);  //for showtime, else 5 min(300)
      }
    }

    delay(1000);
    ESP.deepSleep(10e6);  //for showtime, else 5 min(300)
  }
}

void writeBitToFlash(int address, int pos, bool value)
{
  byte EEPROMBYTE = EEPROM.read(address);
  bitWrite(EEPROMBYTE, pos, value);
  EEPROM.write(address, EEPROMBYTE);
  EEPROM.commit();
}

void sendGetRequest(String packet)
{
  client.print(String("GET ") + packet + " HTTP/1.1\r\n" + "HOST: " + host + "\r\n" + "Connection: close\r\n\r\n");
}

String readServerResponse()
{
  int timeout = millis() + 5000;

  while (client.available() == 0)
  {
    if (timeout - millis() < 0)
    {
      Serial.println("Timeout!");
      client.stop();
      return "";
    }
  }
  String preRes = client.readStringUntil('\z');
  String res = client.readStringUntil('\z');
  return res;
}

void loop()
{

}
