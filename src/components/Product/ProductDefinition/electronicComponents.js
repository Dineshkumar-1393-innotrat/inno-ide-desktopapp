export const electronicComponents = [
  {
    type: "Sensors",
    components: [
      //   { name: "Light Sensor", unit: ["Lux"], min: "", max: "" },
      //   { name: "Gas Sensor", unit: ["PPM"], min: "", max: "" },
      //   { name: "Temperature Sensor", unit: ["Celsius"], min: "", max: "" },
      //   { name: "Humidity Sensor", unit: ["%"], min: "", max: "" },
      //   { name: "Pressure Sensor", unit: ["hPa", "mbar"], min: "", max: "" },
      //   { name: "Proximity Sensor", unit: ["boolean"], min: "", max: "" },
      //   { name: "CO2 Sensor", unit: ["PPM"], min: "", max: "" },
      //   { name: "Ultrasonic Sensor", unit: ["cm"], min: "", max: "" },
      //   { name: "Smoke Sensor", unit: ["PPM"], min: "", max: "" },
      //   { name: "Infrared Sensor", unit: ["Celsius"], min: "", max: "" },
      //   { name: "Accelerometer", unit: ["m/s²"], min: "", max: "" },
      //   { name: "Gyroscope", unit: ["Degree/Second"], min: "", max: "" },
      // { name: "Flame Sensor" },
      { name: "LIDAR" },
      { name: "DHT11", description: "Temperature & Humidity Sensor" },
      { name: "SGP30", description: "Air Quality Sensor" },
      { name: "MPU6050", description: "Accelerometer & Gyroscope" },
      { name: "MQ-2 Gas Sensor", description: "Smoke, LPG, Methane" },
      { name: "LPS22HP", description: "Pressure and Temperature" },
      { name: "ADXL345", description: "3-Axis Accelerometer" },
      { name: "MPX5700", description: "Pressure Sensor" },
      { name: "GY-BMP280", description: "Temperature & Pressure Sensor" },
      { name: "BH1750", description: "Light Sensor" },
      { name: "KY039", description: "Heart Rate Sensor" },
      { name: "Mercury Tilt Sensor" },
      { name: "MQ Gas Sensor", description: "Oxygen" },
      {
        name: "VL53L0X",

        description: "Time-of-Flight Distance Sensor",
      },
      { name: "Rotary Encoder" },
      {
        name: "HC-SR04",

        description: "Ultrasonic Distance Sensor",
      },
      { name: "Tap Module" },
      { name: "JoyStick" },
      {
        name: "MPU9250",
        description: "Accelerometer, Gyroscope, Magnetometer",
      },
      { name: "TSL2561", description: "Luminosity Sensor" },
      { name: "HMC5883L", description: "Magnetometer" },
    ],
  },

  // here min and max values might be (0, 1000)
  {
    type: "Actuators",
    components: [
      { name: "Motor", unit: ["RPM"], min: 0, max: "" },
      { name: "Servo", unit: ["RPM"], min: 0, max: "" },
      { name: "Pump", unit: ["RPM"], min: 0, max: "" },
      { name: "Fan", unit: ["RPM"], min: 0, max: "" },
      { name: "Heater", unit: ["Watts"], min: 0, max: "" },
      //   { name: "Linear Actuator", unit: ["mm", "cm"], min: 0, max: "" },
      //   { name: "Solenoid Valve", unit: ["Volts"], min: 0, max: "" },
      //   { name: "Electric Valve", unit: ["Volts"], min: 0, max: "" },
      { name: "Shutter Actuator", unit: ["RPM"], min: 0, max: "" },
      { name: "LED" },
      { name: "Vibration Motor", unit: ["RPM"], min: 0, max: "" },
      { name: "Stepper Motor", unit: ["RPM", "Watts"], min: 0, max: "" },
      //   { name: "Piezoelectric Actuator", unit: ["Volts"], min: 0, max: "" },
    ],
  },
  {
    type: "Switches",
    components: [
      { name: "Relay Switch" },
      { name: "Button Switch" },
      { name: "Toggle Switch" },
    ],
  },
  {
    type: "Controllers",
    components: [
      {
        name: "STM32",
      },
    ],
  },

  {
    type: "Power Management",
    components: [
      { name: "Power Supply", unit: ["Volts", "Amps"], min: "", max: "" },
    ],
  },

  {
    type: "Audio Components",
    components: [
      { name: "Microphone" },
      { name: "Speaker" },
      { name: "Buzzer" },
    ],
  },
];
