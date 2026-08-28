export const COMPONENT_DATA = {
    // Sensors
    "FlameSensor": ["Flame intensity"],
    "IR sensor": ["voltage", "current", "range", "wavelength", "outputType", "responseTime", "modulationFreq"],
    "LIDAR": ["distance"],
    "DTH11": ["temperature", "humidity"],
    "SGP90": ["CO2", "VOC"],
    "MPU600": ["acceleration (x, y, z)"],
    "ADX-2 Gas Sensor": ["smoke", "LPG", "methane"],
    "Flame Sensor": ["unit"], // Included as per PDF
    "LP522HP": ["pressure"],
    "ADXL345": ["acceleration (x, y, z)"],
    "GY-BMP280": ["temperature", "pressure"],
    "BHT750": ["light level"],
    "KYG98": ["heat/Risk"],
    "MO Gas Sensor": ["oxygen"],
    "VLSLUX": ["distance"],
    "RotaryEncoder": ["position"],
    "HC-SR04": ["distance"],
    "Tap Module": ["tapCount"],
    "JoyStick": ["x-axis", "y-axis"],
    "WindSpeed": ["windSpeed"],
    "SWJ05260": ["acceleration (x, y, z)", "gyroscope (x, y, z)", "magnetometer (x, y, z)"],
    "TSL2561": ["luminosity"],
    "HMC5683L": ["magneticField (x, y, z)"],
    "G - sensor": ["acceleration (x, y, z)", "gyroscope (x, y, z)", "magneticField (x, y, z)"],

    // Actuators
    "Motor": ["speed"],
    "Servo": ["speed"],
    "Pump": ["speed"],
    "Fan": ["speed"],
    "Heater": ["speed", "power"],
    "LED": ["power", "blink", "color"],
    "VibrationMotor": ["brightness"],
    "StepperMotor": ["speed"],

    // Switches
    "RelaySwitch": ["speed"],
    "ButtonSwitch": ["state"],
    "ToggleSwitch": ["state"],

    // Microcontrollers
    "STM32": ["clock speed", "flash memory", "RAM", "Operating voltage"],
    "NRF32": ["clock speed", "flash memory", "RAM", "Operating voltage"],
    "ESP32": ["clock speed", "flash memory", "RAM", "Operating voltage"],
    "CAN Transceiver": ["data rate", "voltage level", "supported protocols"],

    // Power Management
    "PowerSupply": ["ouput voltage", "input voltage", "current capacity", "protections"],
    "battery": ["capacity", "voltage", "backuptime"],

    // Audio Components
    "Microphone": ["current"],
    "Speaker": ["sensitivity", "power"],
    "Buzzer": ["loudiness", "voltage", "protocols"],

    // Connectivity
    "OB-II Connector": ["pins"],
    "GPS module": ["accuracy", "update rate", "sensitivity", "antenna type"],
    "GSM/LTE": ["Network type", "Supported bands", "power consumption", "SIM type", "e-sim", "antenna"]
};

// Categorized Component Types for Dropdown Filtering
export const COMPONENT_TYPES = {
    "Sensor": [
        "FlameSensor", "IR sensor", "LIDAR", "DTH11", "SGP90", "MPU600",
        "ADX-2 Gas Sensor", "Flame Sensor", "LP522HP", "ADXL345", "GY-BMP280",
        "BHT750", "KYG98", "MO Gas Sensor", "VLSLUX", "RotaryEncoder", "HC-SR04",
        "Tap Module", "JoyStick", "WindSpeed", "SWJ05260", "TSL2561", "HMC5683L", "G - sensor"
    ],
    "Actuator": [
        "Motor", "Servo", "Pump", "Fan", "Heater", "LED", "VibrationMotor", "StepperMotor"
    ],
    "Switch": [
        "RelaySwitch", "ButtonSwitch", "ToggleSwitch"
    ],
    "Microcontroller": [
        "STM32", "NRF32", "ESP32", "CAN Transceiver"
    ],
    "PowerManagement": [
        "PowerSupply", "battery"
    ],
    "AudioComponent": [
        "Microphone", "Speaker", "Buzzer"
    ],
    "Connectivity": [
        "OB-II Connector", "GPS module", "GSM/LTE"
    ]
};
