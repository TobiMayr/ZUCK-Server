#include <ESP8266WiFi.h>
#include <EEPROM.h>

const char* ssid = "ZUCK";
const char* password = "ruckzuck";
const char* host = "192.168.0.108";
const int httpPort = 8082;
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
      sendGetRequest("/sensor/signin/soil");
      String res = readServerResponse();
      EEPROM.write(IDAddress, res.toInt());
      EEPROM.commit();
    } else
    {
      Serial.println("Connection failed");
    }
    ESP.deepSleep(5e6);
  } else
  {
    String humidity = readHumidity();
    
    if (client.connect(host, httpPort))
      {
        Serial.println("Sending humidity");
        int id = EEPROM.read(IDAddress);
        String packet = "/sensor/soil/" + humidity;
        packet = packet + "/";
        packet = packet + id;
        sendGetRequest(packet);

        String res = readServerResponse();
        Serial.println("Server response: " +res);

        if(res.toInt() == 0)
        {
          EEPROM.write(IDAddress, 0);
          EEPROM.commit();
        }
      } else
      {
        Serial.println("Connection failed");
      }
    
    delay(1000);
    ESP.deepSleep(240e6);
  }
}

String readHumidity()
{
  int hum = analogRead(A0);
  hum = (hum-457)/4.2;
  hum = 100 - hum;
  return "" + hum;
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
