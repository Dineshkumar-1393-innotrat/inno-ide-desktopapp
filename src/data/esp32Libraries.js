/**
 * ESP32 Arduino Framework Libraries
 * Complete list of built-in ESP32 libraries with metadata
 */

export const ESP32_LIBRARIES = [
  {
    id: 'arduino-ota',
    name: 'ArduinoOTA',
    version: '2.0.0',
    author: 'Ivan Grokhotkov and Hristo Gochkov',
    description: 'Enables Over The Air upgrades, via wifi and espota.py UDP request/TCP download. With this library you can enable your sketch to be upgraded over network. Includes mdns announces to get discovered by the arduino IDE.',
    category: 'Communication',
    includes: ['ArduinoOTA.h'],
    examples: [
      {
        name: 'BasicOTA',
        code: `#include <WiFi.h>
#include <ArduinoOTA.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(5000);
    ESP.restart();
  }
  
  ArduinoOTA.begin();
  Serial.println("Ready");
}

void loop() {
  ArduinoOTA.handle();
}`
      }
    ]
  },
  {
    id: 'async-udp',
    name: 'ESP32 Async UDP',
    version: '2.0.0',
    author: 'Me-No-Dev',
    description: 'Async UDP Library for ESP32',
    category: 'Communication',
    includes: ['AsyncUDP.h'],
    examples: []
  },
  {
    id: 'ble-arduino',
    name: 'ESP32 BLE Arduino',
    version: '2.0.0',
    author: 'Neil Kolban',
    description: 'BLE functions for ESP32. This library provides an implementation Bluetooth Low Energy support for the ESP32 using the Arduino platform.',
    category: 'Communication',
    includes: ['BLEDevice.h', 'BLEServer.h', 'BLEUtils.h', 'BLE2902.h'],
    examples: [
      {
        name: 'BLE_server',
        code: `#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  BLEDevice::init("ESP32");
  pServer = BLEDevice::createServer();
  pServer->startAdvertising();
  Serial.println("BLE Server Started");
}

void loop() {
  delay(1000);
}`
      }
    ]
  },
  {
    id: 'bluetooth-serial',
    name: 'BluetoothSerial',
    version: '2.0.0',
    author: 'Evandro Copercini',
    description: 'Simple UART to Classical Bluetooth bridge for ESP32',
    category: 'Communication',
    includes: ['BluetoothSerial.h'],
    examples: [
      {
        name: 'SerialToSerialBT',
        code: `#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32test"); // Bluetooth device name
  Serial.println("The device started, now you can pair it with bluetooth!");
}

void loop() {
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }
  if (SerialBT.available()) {
    Serial.write(SerialBT.read());
  }
  delay(20);
}`
      }
    ]
  },
  {
    id: 'dns-server',
    name: 'DNSServer',
    version: '2.0.0',
    author: 'Kristijan Novoselić',
    description: 'A simple DNS server for ESP32. This library implements a simple DNS server.',
    category: 'Communication',
    includes: ['DNSServer.h'],
    examples: []
  },
  {
    id: 'eeprom',
    name: 'EEPROM',
    version: '2.0.0',
    author: 'Ivan Grokhotkov',
    description: 'Enables reading and writing data a sequential, addressable FLASH storage',
    category: 'Data Storage',
    includes: ['EEPROM.h'],
    examples: [
      {
        name: 'eeprom_write',
        code: `#include <EEPROM.h>

#define EEPROM_SIZE 64

void setup() {
  Serial.begin(115200);
  EEPROM.begin(EEPROM_SIZE);
  
  // Write data
  EEPROM.write(0, 42);
  EEPROM.commit();
  
  // Read data
  int value = EEPROM.read(0);
  Serial.println(value);
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'esp32-examples',
    name: 'ESP32',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 sketches examples',
    category: 'Examples',
    includes: [],
    examples: []
  },
  {
    id: 'mdns',
    name: 'ESPmDNS',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 mDNS Library',
    category: 'Communication',
    includes: ['ESPmDNS.h'],
    examples: [
      {
        name: 'mDNS_Web_Server',
        code: `#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebServer.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  if (MDNS.begin("esp32")) {
    Serial.println("MDNS responder started");
  }
  
  server.begin();
}

void loop() {
  server.handleClient();
}`
      }
    ]
  },
  {
    id: 'ethernet',
    name: 'Ethernet',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Enables network connection (local and Internet) using the ESP32 Ethernet. With this library you can instantiate Servers, Clients and send/receive UDP packets through Ethernet.',
    category: 'Communication',
    includes: ['ETH.h'],
    examples: []
  },
  {
    id: 'ffat',
    name: 'FFat',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 FAT on Flash File System',
    category: 'Data Storage',
    includes: ['FFat.h'],
    examples: []
  },
  {
    id: 'fs',
    name: 'FS',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 File System',
    category: 'Data Storage',
    includes: ['FS.h'],
    examples: []
  },
  {
    id: 'http-client',
    name: 'HTTPClient',
    version: '2.0.0',
    author: 'Markus Sattler',
    description: 'HTTP Client for ESP32',
    category: 'Communication',
    includes: ['HTTPClient.h'],
    examples: [
      {
        name: 'BasicHTTPClient',
        code: `#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  HTTPClient http;
  http.begin("http://example.com");
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println(payload);
  }
  http.end();
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'http-update',
    name: 'HTTPUpdate',
    version: '2.0.0',
    author: 'Markus Sattler',
    description: 'Http Update for ESP32',
    category: 'Device Management',
    includes: ['HTTPUpdate.h'],
    examples: []
  },
  {
    id: 'http-update-server',
    name: 'HTTPUpdateServer',
    version: '2.0.0',
    author: 'Hristo Kapanakov',
    description: 'Simple HTTP Update server based on the WebServer. The library accepts HTTP post requests to the /update url, and updates the ESP32 firmware.',
    category: 'Device Management',
    includes: ['HTTPUpdateServer.h'],
    examples: []
  },
  {
    id: 'i2s',
    name: 'I2S',
    version: '1.0',
    author: 'Tomas Pilny',
    description: 'Enables the communication with devices that use the Inter-IC Sound (I2S) Bus. Specific implementation for ESP.',
    category: 'Signal Input/Output',
    includes: ['I2S.h'],
    examples: []
  },
  {
    id: 'esp-insights',
    name: 'ESP Insights',
    version: '1.0.0',
    author: 'Sanket Wadekar',
    description: 'ESP Insights. With this library you can remotely monitor your device error logs, Network variables, WiFi/Heap Metrics, and also custom variables / metrics.',
    category: 'Device Management',
    includes: ['esp_insights.h'],
    examples: []
  },
  {
    id: 'littlefs',
    name: 'LittleFS',
    version: '2.0.0',
    author: '',
    description: 'LittleFS for esp32',
    category: 'Data Storage',
    includes: ['LittleFS.h'],
    examples: [
      {
        name: 'LittleFS_test',
        code: `#include "FS.h"
#include "LittleFS.h"

void setup() {
  Serial.begin(115200);
  
  if(!LittleFS.begin()){
    Serial.println("LittleFS Mount Failed");
    return;
  }
  
  File file = LittleFS.open("/test.txt", FILE_WRITE);
  if(!file){
    Serial.println("Failed to open file for writing");
    return;
  }
  
  file.println("Hello LittleFS!");
  file.close();
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'netbios',
    name: 'NetBIOS',
    version: '2.0.0',
    author: 'Pablo@xpablo.cz',
    description: 'Enables NBNS (NetBIOS) name resolution. With this library you can connect to your ESP from Windows using a short name',
    category: 'Communication',
    includes: ['NetBIOS.h'],
    examples: []
  },
  {
    id: 'preferences',
    name: 'Preferences',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Provides friendly access to ESP32\'s Non-Volatile Storage',
    category: 'Data Storage',
    includes: ['Preferences.h'],
    examples: [
      {
        name: 'StartCounter',
        code: `#include <Preferences.h>

Preferences preferences;

void setup() {
  Serial.begin(115200);
  
  preferences.begin("my-app", false);
  unsigned int counter = preferences.getUInt("counter", 0);
  counter++;
  
  Serial.printf("Current counter value: %u\\n", counter);
  preferences.putUInt("counter", counter);
  preferences.end();
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'rainmaker',
    name: 'ESP RainMaker',
    version: '2.0.0',
    author: 'Sweety Mhaiske',
    description: 'ESP RainMaker Support. With this library you can build connected devices and access them via phone apps without having to manage the infrastructure.',
    category: 'Device Management',
    includes: ['RMaker.h'],
    examples: []
  },
  {
    id: 'sd',
    name: 'SD',
    version: '2.0.0',
    author: 'Arduino',
    description: 'Enables reading and writing on SD cards. For all Arduino boards.',
    category: 'Data Storage',
    includes: ['SD.h'],
    examples: [
      {
        name: 'CardInfo',
        code: `#include <SD.h>

#define SD_CS 5

void setup() {
  Serial.begin(115200);
  
  if (!SD.begin(SD_CS)) {
    Serial.println("Card Mount Failed");
    return;
  }
  
  uint8_t cardType = SD.cardType();
  if (cardType == CARD_NONE) {
    Serial.println("No SD card attached");
    return;
  }
  
  Serial.println("SD Card Initialized");
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'sd-mmc',
    name: 'SD_MMC',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 SDMMC File System',
    category: 'Data Storage',
    includes: ['SD_MMC.h'],
    examples: []
  },
  {
    id: 'spi',
    name: 'SPI',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Enables the communication with devices that use the Serial Peripheral Interface (SPI) Bus.',
    category: 'Signal Input/Output',
    includes: ['SPI.h'],
    examples: []
  },
  {
    id: 'spiffs',
    name: 'SPIFFS',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 SPIFFS File System',
    category: 'Data Storage',
    includes: ['SPIFFS.h'],
    examples: [
      {
        name: 'SPIFFS_Test',
        code: `#include "FS.h"
#include "SPIFFS.h"

void setup() {
  Serial.begin(115200);
  
  if(!SPIFFS.begin(true)){
    Serial.println("SPIFFS Mount Failed");
    return;
  }
  
  File file = SPIFFS.open("/test.txt", FILE_WRITE);
  if(!file){
    Serial.println("Failed to open file for writing");
    return;
  }
  
  file.println("Hello SPIFFS!");
  file.close();
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'simple-ble',
    name: 'SimpleBLE',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Provides really simple BLE advertiser with just on and off',
    category: 'Communication',
    includes: ['SimpleBLE.h'],
    examples: []
  },
  {
    id: 'ticker',
    name: 'Ticker',
    version: '2.0.0',
    author: 'Bert Melis',
    description: 'Allows to call functions with a given interval.',
    category: 'Timing',
    includes: ['Ticker.h'],
    examples: [
      {
        name: 'TickerBasic',
        code: `#include <Ticker.h>

Ticker ticker;

void timerCallback() {
  Serial.println("Ticker triggered!");
}

void setup() {
  Serial.begin(115200);
  ticker.attach(1, timerCallback); // Call every 1 second
}

void loop() {
}`
      }
    ]
  },
  {
    id: 'usb',
    name: 'USB',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32S2 USB Library',
    category: 'Communication',
    includes: ['USB.h'],
    examples: []
  },
  {
    id: 'update',
    name: 'Update',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'ESP32 Sketch Update Library',
    category: 'Device Management',
    includes: ['Update.h'],
    examples: []
  },
  {
    id: 'webserver',
    name: 'WebServer',
    version: '2.0.0',
    author: 'Ivan Grokhotkov',
    description: 'Simple web server library. The library supports HTTP GET and POST requests, provides argument parsing, handles one client at a time.',
    category: 'Communication',
    includes: ['WebServer.h'],
    examples: [
      {
        name: 'HelloServer',
        code: `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebServer server(80);

void handleRoot() {
  server.send(200, "text/plain", "Hello from ESP32!");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  server.on("/", handleRoot);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}`
      }
    ]
  },
  {
    id: 'wifi',
    name: 'WiFi',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Enables network connection (local and Internet) using the ESP32 built-in WiFi.',
    category: 'Communication',
    includes: ['WiFi.h'],
    examples: [
      {
        name: 'WiFiScan',
        code: `#include "WiFi.h"

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  Serial.println("Scanning WiFi networks...");
}

void loop() {
  int n = WiFi.scanNetworks();
  Serial.println("Scan complete");
  
  if (n == 0) {
    Serial.println("No networks found");
  } else {
    Serial.printf("%d networks found\\n", n);
    for (int i = 0; i < n; ++i) {
      Serial.printf("%d: %s (%d)\\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i));
    }
  }
  delay(5000);
}`
      }
    ]
  },
  {
    id: 'wifi-client-secure',
    name: 'WiFiClientSecure',
    version: '2.0.0',
    author: 'Evandro Luis Copercini',
    description: 'Enables secure network connection (local and Internet) using the ESP32 built-in WiFi. With this library you can make a TLS or SSL connection to a remote server.',
    category: 'Communication',
    includes: ['WiFiClientSecure.h'],
    examples: []
  },
  {
    id: 'wifi-prov',
    name: 'WiFiProv',
    version: '2.0.0',
    author: 'Switi Mhaiske',
    description: 'Enables provisioning. With this library you can perform provisioning on esp32 via SoftAP or BLE.',
    category: 'Communication',
    includes: ['WiFiProv.h'],
    examples: []
  },
  {
    id: 'wire',
    name: 'Wire',
    version: '2.0.0',
    author: 'Hristo Gochkov',
    description: 'Allows the communication between devices or sensors connected via Two Wire Interface Bus (I2C).',
    category: 'Signal Input/Output',
    includes: ['Wire.h'],
    examples: [
      {
        name: 'i2c_scanner',
        code: `#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(115200);
  Serial.println("\\nI2C Scanner");
}

void loop() {
  byte error, address;
  int nDevices = 0;
  
  Serial.println("Scanning...");
  
  for(address = 1; address < 127; address++ ) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.printf("I2C device found at address 0x%02X\\n", address);
      nDevices++;
    }
  }
  
  if (nDevices == 0)
    Serial.println("No I2C devices found\\n");
  else
    Serial.println("done\\n");
  
  delay(5000);
}`
      }
    ]
  }
];

export const LIBRARY_CATEGORIES = [
  'All',
  'Communication',
  'Data Storage',
  'Signal Input/Output',
  'Device Management',
  'Timing',
  'Examples'
];

export default ESP32_LIBRARIES;
