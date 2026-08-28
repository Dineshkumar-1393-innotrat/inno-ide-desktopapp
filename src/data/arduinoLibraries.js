export const ARDUINO_LIBRARIES = [
  {
    id: 'arduino-core',
    name: 'Arduino Core',
    version: '1.0.6',
    author: 'Arduino',
    description: 'Core Arduino wiring APIs for AVR boards such as Uno, Mega, and Nano.',
    category: 'Core',
    includes: ['Arduino.h'],
    examples: [
      {
        name: 'Blink',
        code: `#include <Arduino.h>\n\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`,
      },
    ],
  },
  {
    id: 'arduino-wire',
    name: 'Wire (I2C)',
    version: '1.0.2',
    author: 'Arduino',
    description: 'Allows communication with I2C / TWI devices.',
    category: 'Communication',
    includes: ['Wire.h'],
    examples: [
      {
        name: 'I2CScanner',
        code: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n}\n\nvoid loop() {\n  Serial.println("Scanning...");\n  for (byte address = 1; address < 127; address++) {\n    Wire.beginTransmission(address);\n    if (Wire.endTransmission() == 0) {\n      Serial.print("Found device at 0x");\n      Serial.println(address, HEX);\n    }\n  }\n  delay(5000);\n}`,
      },
    ],
  },
  {
    id: 'arduino-spi',
    name: 'SPI',
    version: '1.0.1',
    author: 'Arduino',
    description: 'Enables communication with SPI devices.',
    category: 'Signal Input/Output',
    includes: ['SPI.h'],
    examples: [],
  },
  {
    id: 'arduino-wifi',
    name: 'WiFi',
    version: '1.2.7',
    author: 'Arduino',
    description: 'Enables network connection (local and Internet) using the built-in WiFi on ESP32 and compatible WiFi shields.',
    category: 'Communication',
    includes: ['WiFi.h'],
    examples: [
      {
        name: 'WiFiStatus',
        code: `#include <WiFi.h>\n\nchar ssid[] = "YOUR_SSID";\nchar pass[] = "YOUR_PASSWORD";\n\nvoid setup() {\n  Serial.begin(115200);\n  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {\n    Serial.println("Connecting to WiFi...");\n    delay(1000);\n  }\n  Serial.println("Connected to WiFi");\n}\n\nvoid loop() {\n  Serial.println(WiFi.localIP());\n  delay(5000);\n}`,
      },
    ],
  },
  {
    id: 'arduino-sd',
    name: 'SD',
    version: '1.2.4',
    author: 'Arduino',
    description: 'Enables reading and writing on SD cards.',
    category: 'Data Storage',
    includes: ['SD.h'],
    examples: [],
  },
];

export const ARDUINO_CATEGORIES = [
  'All',
  'Core',
  'Communication',
  'Signal Input/Output',
  'Data Storage',
];

export default ARDUINO_LIBRARIES;
