// ESP32 GPIO Options & Roles for Hardware Rules & Actions
export const ESP32_GPIO_OPTIONS = [
  { pin: "GPIO 2", label: "GPIO 2 (Onboard LED / Strapping)", role: "Digital Output / PWM", defaultTarget: "Onboard LED", defaultAction: "Send Serial Command", defaultPayload: "LED:{state}" },
  { pin: "GPIO 4", label: "GPIO 4 (PWM / Servo / Touch)", role: "PWM Output / Servo / ADC", defaultTarget: "PWM Servo", defaultAction: "Write PWM Duty / Angle", defaultPayload: "SERVO:{value}" },
  { pin: "GPIO 5", label: "GPIO 5 (Buzzer / CS / Digital Output)", role: "Digital Output / PWM", defaultTarget: "Buzzer", defaultAction: "Trigger Buzzer & Alert", defaultPayload: "BUZZER:1" },
  { pin: "GPIO 12", label: "GPIO 12 (Touch / ADC2_CH5 / Relay)", role: "Digital Output / Relay", defaultTarget: "Relay 1", defaultAction: "Write Digital GPIO", defaultPayload: "RELAY:1" },
  { pin: "GPIO 13", label: "GPIO 13 (Touch / ADC2_CH4 / Motor A)", role: "Motor Driver / Output", defaultTarget: "Motor IN1", defaultAction: "Write Digital GPIO", defaultPayload: "MOTOR:HIGH" },
  { pin: "GPIO 14", label: "GPIO 14 (Touch / ADC2_CH6 / Motor B)", role: "Motor Driver / Output", defaultTarget: "Motor IN2", defaultAction: "Write Digital GPIO", defaultPayload: "MOTOR:LOW" },
  { pin: "GPIO 15", label: "GPIO 15 (DAC / ADC2_CH3 / NeoPixel)", role: "Addressable RGB / PWM", defaultTarget: "NeoPixel Strip", defaultAction: "Send Serial Command", defaultPayload: "COLOR:{hex}" },
  { pin: "GPIO 16", label: "GPIO 16 (UART2 RX / Digital IO)", role: "UART / GPIO", defaultTarget: "UART Device", defaultAction: "Send Serial Command", defaultPayload: "UART:SEND" },
  { pin: "GPIO 17", label: "GPIO 17 (UART2 TX / Digital IO)", role: "UART / GPIO", defaultTarget: "UART Device", defaultAction: "Send Serial Command", defaultPayload: "UART:TX" },
  { pin: "GPIO 18", label: "GPIO 18 (VSPI CLK / Digital Output)", role: "SPI Clock / Digital IO", defaultTarget: "SPI Display", defaultAction: "Write Digital GPIO", defaultPayload: "SPI:CLK" },
  { pin: "GPIO 19", label: "GPIO 19 (VSPI MISO / Digital IO)", role: "SPI MISO / Digital IO", defaultTarget: "SPI MISO", defaultAction: "Write Digital GPIO", defaultPayload: "SPI:MISO" },
  { pin: "GPIO 21", label: "GPIO 21 (I2C SDA / Wire)", role: "I2C SDA Telemetry", defaultTarget: "I2C Bus", defaultAction: "Read Telemetry Stream", defaultPayload: "I2C:READ" },
  { pin: "GPIO 22", label: "GPIO 22 (I2C SCL / Wire)", role: "I2C SCL Telemetry", defaultTarget: "I2C Bus", defaultAction: "Read Telemetry Stream", defaultPayload: "I2C:READ" },
  { pin: "GPIO 23", label: "GPIO 23 (VSPI MOSI / Digital IO)", role: "SPI MOSI / Digital IO", defaultTarget: "SPI Device", defaultAction: "Write Digital GPIO", defaultPayload: "SPI:MOSI" },
  { pin: "GPIO 25", label: "GPIO 25 (DAC1 / ADC2_CH8 / Audio)", role: "DAC Audio / Voltage Output", defaultTarget: "Speaker / DAC", defaultAction: "Write PWM Duty / Angle", defaultPayload: "DAC:{value}" },
  { pin: "GPIO 26", label: "GPIO 26 (DAC2 / ADC2_CH9 / Audio)", role: "DAC Audio / Voltage Output", defaultTarget: "Speaker / DAC", defaultAction: "Write PWM Duty / Angle", defaultPayload: "DAC:{value}" },
  { pin: "GPIO 27", label: "GPIO 27 (ADC2_CH7 / Touch / Relay)", role: "Digital Output / Relay", defaultTarget: "Relay 2", defaultAction: "Write Digital GPIO", defaultPayload: "RELAY2:1" },
  { pin: "GPIO 32", label: "GPIO 32 (ADC1_CH4 / Touch / Temp)", role: "Analog Input / Telemetry", defaultTarget: "Temperature Sensor", defaultAction: "Read Telemetry Stream", defaultPayload: "GET:TEMP" },
  { pin: "GPIO 33", label: "GPIO 33 (ADC1_CH5 / Touch / Light LDR)", role: "Analog Input / Telemetry", defaultTarget: "Light Sensor (LDR)", defaultAction: "Read Telemetry Stream", defaultPayload: "GET:LDR" },
  { pin: "GPIO 34", label: "GPIO 34 (ADC1_CH6 / Input Only)", role: "Analog Input Only (No Pullup)", defaultTarget: "Analog Sensor 1", defaultAction: "Read Telemetry Stream", defaultPayload: "GET:ADC34" },
  { pin: "GPIO 35", label: "GPIO 35 (ADC1_CH7 / Input Only)", role: "Analog Input Only (No Pullup)", defaultTarget: "Battery Voltage Monitor", defaultAction: "Read Telemetry Stream", defaultPayload: "GET:BATTERY" }
];

export const RULE_ACTION_TYPES = [
  { value: "Send Serial Command", label: "Send Serial Command", defaultPayload: "LED:{state}", desc: "Transmit formatted text or command string over UART/Serial port" },
  { value: "Write PWM Duty / Angle", label: "Write PWM Duty / Angle", defaultPayload: "SERVO:{value}", desc: "Output hardware PWM duty cycle or RC Servo pulse angle" },
  { value: "Write Digital GPIO", label: "Write Digital GPIO (HIGH/LOW)", defaultPayload: "GPIO:HIGH", desc: "Drive GPIO pin to logical HIGH (3.3V) or LOW (0V)" },
  { value: "Trigger Buzzer & Alert", label: "Trigger Buzzer & Alert", defaultPayload: "BUZZER:1", desc: "Sound physical buzzer tone and flag software alert notification" },
  { value: "Read Telemetry Stream", label: "Read Telemetry Stream", defaultPayload: "GET:TEMP", desc: "Poll or request an instant telemetry reading from sensor" }
];

export const RULE_CONDITION_TYPES = [
  { value: "Always", label: "Always (Pass check)", hasThreshold: false, desc: "Fires immediately when the trigger event occurs without filtering" },
  { value: "Value >", label: "Value Greater Than (>)", hasThreshold: true, defaultThreshold: "30", defaultUnit: "°C", desc: "Fires only when the trigger value exceeds the specified threshold" },
  { value: "Value <", label: "Value Less Than (<)", hasThreshold: true, defaultThreshold: "10", defaultUnit: "°C", desc: "Fires only when the trigger value falls below the specified threshold" },
  { value: "Value ==", label: "Value Equals (==)", hasThreshold: true, defaultThreshold: "1", defaultUnit: "", desc: "Fires when trigger value exactly matches the target state (e.g. 1 / true / 0)" },
  { value: "Value !=", label: "Value Not Equals (!=)", hasThreshold: true, defaultThreshold: "0", defaultUnit: "", desc: "Fires when trigger value differs from target state" },
  { value: "Value Between", label: "Value in Range [Min, Max]", hasThreshold: true, defaultThreshold: "20, 45", defaultUnit: "°C", desc: "Fires when value is within the specified boundary range" }
];

export const TELEMETRY_TRIGGER_SOURCES = [
  { id: "telem_temp", name: "Temperature Sensor (ADC)", unit: "°C", defaultThreshold: "30", pin: "GPIO 32" },
  { id: "telem_humidity", name: "Humidity Sensor (DHT22)", unit: "%", defaultThreshold: "75", pin: "GPIO 33" },
  { id: "telem_light", name: "Ambient Light Sensor (LDR)", unit: "lux", defaultThreshold: "200", pin: "GPIO 34" },
  { id: "telem_dist", name: "Ultrasonic Distance Sensor", unit: "cm", defaultThreshold: "15", pin: "GPIO 4" },
  { id: "telem_battery", name: "Battery Level Telemetry", unit: "%", defaultThreshold: "20", pin: "GPIO 35" }
];
