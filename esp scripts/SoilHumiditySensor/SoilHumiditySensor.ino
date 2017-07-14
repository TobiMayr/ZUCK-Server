#include <ESP8266WiFi.h>
#include <EEPROM.h>

const char* ssid = "ZUCK";
const char* password = "ruckzuck";
const char* host = "zuck_server";
const int httpPort = 8081;
const int IDAddress = 0;
WiFiClient client;

void setup() 
{
  Serial.begin(115200);
  EEPROM.begin(2);

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
      ESP.deepSleep(120e6);
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
      sendGetRequest("/sensor/signin/window");
      String res = readServerResponse();
      EEPROM.write(IDAddress, res.toInt());
      EEPROM.commit();
      writeBitToFlash(bitAddress, sendPos, true);
    } else
    {
      Serial.println("Connection failed");
    }
    ESP.deepSleep(5e6);
  } else
  {
    
    
    
    delay(1000);
    ESP.deepSleep(240e6);
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
