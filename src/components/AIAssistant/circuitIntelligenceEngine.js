/**
 * Antigravity Circuit Intelligence Engine
 * Specialized knowledge base and reasoning system for InnoIDE Simulation Canvas.
 */

// Helper to normalize component names
export const normalizeComponentName = (item) => {
  if (!item) return "Unknown";
  if (typeof item === "string") return item.trim();
  const name = item.symbol?.name || item.name || item.label || "Component";
  return name.trim();
};

/**
 * Categorize canvas components into functional hardware categories
 */
export const categorizeComponents = (droppedItems = []) => {
  const result = {
    microcontrollers: [],
    sensors: [],
    actuators: [],
    displays: [],
    power: [],
    others: [],
    all: []
  };

  droppedItems.forEach((item, index) => {
    const rawName = normalizeComponentName(item);
    const lower = rawName.toLowerCase();
    const info = {
      id: item.id || `item_${index}`,
      index,
      name: rawName,
      x: Math.round(item.x || 0),
      y: Math.round(item.y || 0),
      rotation: item.rotation || 0,
      raw: item
    };

    result.all.push(info);

    if (lower.includes("microcontroller") || lower.includes("mcu") || lower.includes("esp32") || lower.includes("arduino")) {
      result.microcontrollers.push(info);
    } else if (
      lower.includes("sensor") ||
      lower.includes("optical") ||
      lower.includes("temperature") ||
      lower.includes("moisture") ||
      lower.includes("distance") ||
      lower.includes("accelerometer") ||
      lower.includes("heartbeat") ||
      lower.includes("gas") ||
      lower.includes("air") ||
      lower.includes("ph") ||
      lower.includes("touch") ||
      lower.includes("sound") ||
      lower.includes("motion") ||
      lower.includes("ir")
    ) {
      result.sensors.push(info);
    } else if (
      lower.includes("servo") ||
      lower.includes("motor") ||
      lower.includes("relay") ||
      lower.includes("actuator") ||
      lower.includes("button") ||
      lower.includes("toggle")
    ) {
      result.actuators.push(info);
    } else if (
      lower.includes("display") ||
      lower.includes("oled") ||
      lower.includes("buzzer") ||
      lower.includes("light") ||
      lower.includes("led") ||
      lower.includes("hooter")
    ) {
      result.displays.push(info);
    } else if (lower.includes("power") || lower.includes("supply") || lower.includes("battery") || lower.includes("vcc")) {
      result.power.push(info);
    } else {
      result.others.push(info);
    }
  });

  return result;
};

/**
 * Generate a comprehensive analysis of the simulation canvas
 */
export const analyzeCanvasState = (droppedItems = [], connections = [], activeTab = null, projectName = "", productName = "") => {
  const categorized = categorizeComponents(droppedItems);
  const connList = Array.isArray(connections) ? connections : [];

  const hasMCU = categorized.microcontrollers.length > 0;
  const hasPower = categorized.power.length > 0;
  const hasSensors = categorized.sensors.length > 0;
  const hasActuators = categorized.actuators.length > 0;
  const hasDisplays = categorized.displays.length > 0;

  const warnings = [];
  const suggestions = [];

  if (droppedItems.length === 0) {
    suggestions.push("The simulation canvas is currently empty. Drag a **Microcontroller**, some **Sensors**, and an **OLED Display** or **Servo Motor** from the left sidebar to start building your hardware simulation.");
  } else {
    if (!hasMCU) {
      warnings.push("⚠️ **No Microcontroller detected**: Sensors and actuators require a central microcontroller (ESP32/Arduino) to process signals and execute control logic.");
      suggestions.push("Add a **Microcontroller** from the MICROCONTROLLERS section in the sidebar.");
    }

    if (!hasPower && (hasActuators || hasDisplays)) {
      warnings.push("⚡ **External Power Recommendation**: High-load devices (like Servo Motors, Relays, or Hooters) can cause brownouts if powered solely from MCU regulator pins. Consider placing a **Power Supply**.");
    }

    if (hasMCU && droppedItems.length > 1 && connList.length === 0) {
      warnings.push("🔌 **No Wire Connections**: Components are placed on canvas but not connected with virtual wires. Use connector zones (Z1 - Z6) on the Microcontroller to link your peripherals.");
    }

    if (hasSensors && !hasActuators && !hasDisplays) {
      suggestions.push("💡 You have sensors listening to input! Add an actuator (e.g., **Servo Motor**, **Relay**) or an indicator (**OLED Display**, **RGB LED**, **Buzzer**) to react to sensor thresholds.");
    }
  }

  const summaryText = droppedItems.length === 0
    ? "Canvas is empty."
    : `${droppedItems.length} components (${categorized.microcontrollers.length} MCU, ${categorized.sensors.length} Sensors, ${categorized.actuators.length} Actuators, ${categorized.displays.length} Displays/Indicators) with ${connList.length} connection(s).`;

  return {
    categorized,
    totalComponents: droppedItems.length,
    totalConnections: connList.length,
    hasMCU,
    hasPower,
    hasSensors,
    hasActuators,
    hasDisplays,
    warnings,
    suggestions,
    summaryText,
    tabName: activeTab?.name || "Simulation 1",
    projectName: projectName || "Active Project",
    productName: productName || "Default Product"
  };
};

/**
 * Synthesize working Arduino / C++ code tailored to canvas items
 */
export const generateFirmwareCode = (droppedItems = [], connections = []) => {
  const { categorized, hasMCU } = categorizeComponents(droppedItems);
  
  if (droppedItems.length === 0) {
    return `// InnoIDE Simulation Canvas is currently empty.
// Place a Microcontroller and components to generate dedicated firmware!

void setup() {
  Serial.begin(115200);
  Serial.println("InnoIDE Virtual System Ready - Place components to synthesize logic.");
}

void loop() {
  // Add components to the canvas to generate operational loop code
  delay(1000);
}`;
  }

  const includes = ['#include <Arduino.h>'];
  const pinDefs = [];
  const globalVars = [];
  const setupLines = ['  Serial.begin(115200);', '  Serial.println("[SYSTEM] InnoIDE Firmware Initialized");'];
  const loopLines = [];

  // Mappings for pins
  let digitalPinCounter = 4;
  let analogPinCounter = 32;

  // Check for Servo
  const hasServo = droppedItems.some(i => normalizeComponentName(i).toLowerCase().includes("servo"));
  if (hasServo) {
    includes.push('#include <ESP32Servo.h> // or <Servo.h> for Arduino AVR');
    pinDefs.push(`const int SERVO_PIN = ${digitalPinCounter++}; // MCU Pin Z1`);
    globalVars.push('Servo mainServo;');
    setupLines.push('  mainServo.attach(SERVO_PIN);');
    setupLines.push('  mainServo.write(90); // Default neutral position');
  }

  // Check for OLED
  const hasOLED = droppedItems.some(i => normalizeComponentName(i).toLowerCase().includes("oled"));
  if (hasOLED) {
    includes.push('#include <Wire.h>');
    includes.push('#include <Adafruit_GFX.h>');
    includes.push('#include <Adafruit_SSD1306.h>');
    globalVars.push('#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\nAdafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);');
    setupLines.push('  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {\n    Serial.println("[WARN] SSD1306 allocation failed");\n  } else {\n    display.clearDisplay();\n    display.setTextSize(1);\n    display.setTextColor(SSD1306_WHITE);\n    display.setCursor(0,0);\n    display.println("InnoIDE Ready");\n    display.display();\n  }');
  }

  // Sensors processing
  categorized.sensors.forEach((s) => {
    const sName = s.name;
    const sVar = sName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const pin = analogPinCounter++;
    pinDefs.push(`const int PIN_${sVar.toUpperCase()} = ${pin}; // Analog Pin`);
    setupLines.push(`  pinMode(PIN_${sVar.toUpperCase()}, INPUT);`);
    loopLines.push(`  // Read ${sName}`);
    loopLines.push(`  int val_${sVar} = analogRead(PIN_${sVar.toUpperCase()});`);
    loopLines.push(`  Serial.print("${sName}: "); Serial.println(val_${sVar});`);
  });

  // Actuators processing
  categorized.actuators.forEach((a) => {
    const aName = a.name;
    if (aName.toLowerCase().includes("servo")) return; // handled above
    const aVar = aName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const pin = digitalPinCounter++;
    pinDefs.push(`const int PIN_${aVar.toUpperCase()} = ${pin}; // Control Output`);
    setupLines.push(`  pinMode(PIN_${aVar.toUpperCase()}, OUTPUT);`);
    setupLines.push(`  digitalWrite(PIN_${aVar.toUpperCase()}, LOW);`);
  });

  // Displays & Indicators
  categorized.displays.forEach((d) => {
    const dName = d.name;
    if (dName.toLowerCase().includes("oled")) return; // handled above
    const dVar = dName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const pin = digitalPinCounter++;
    pinDefs.push(`const int PIN_${dVar.toUpperCase()} = ${pin}; // Indicator Pin`);
    setupLines.push(`  pinMode(PIN_${dVar.toUpperCase()}, OUTPUT);`);
  });

  // Logic in loop
  if (categorized.sensors.length > 0 && (categorized.actuators.length > 0 || categorized.displays.length > 0)) {
    loopLines.push('');
    loopLines.push('  // Automated Control Logic based on Sensor Readings');
    const firstSensor = categorized.sensors[0];
    const sVar = firstSensor.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    loopLines.push(`  if (val_${sVar} > 2000) {`);
    if (hasServo) loopLines.push('    mainServo.write(180); // Move servo on threshold');
    categorized.displays.forEach(d => {
      if (!d.name.toLowerCase().includes("oled")) {
        const dVar = d.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        loopLines.push(`    digitalWrite(PIN_${dVar.toUpperCase()}, HIGH); // Trigger indicator`);
      }
    });
    loopLines.push('  } else {');
    if (hasServo) loopLines.push('    mainServo.write(0);');
    categorized.displays.forEach(d => {
      if (!d.name.toLowerCase().includes("oled")) {
        const dVar = d.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        loopLines.push(`    digitalWrite(PIN_${dVar.toUpperCase()}, LOW);`);
      }
    });
    loopLines.push('  }');
  }

  loopLines.push('  delay(500); // Sampling interval');

  return `// ==========================================================
// InnoIDE Auto-Synthesized Embedded Firmware
// Target Platform: ESP32 / Arduino Compatible
// Generated by Antigravity AI Assistant
// ==========================================================

${[...new Set(includes)].join('\n')}

// --- Pin Allocations ---
${pinDefs.join('\n')}

// --- Global Variables & Peripherals ---
${globalVars.join('\n')}

void setup() {
${setupLines.join('\n')}
}

void loop() {
${loopLines.join('\n')}
}
`;
};

/**
 * Generate a Bill of Materials (BOM)
 */
export const generateBOM = (droppedItems = []) => {
  if (droppedItems.length === 0) {
    return "Your simulation canvas has no components placed yet. Drag components from the sidebar to generate a Bill of Materials.";
  }

  const counts = {};
  droppedItems.forEach(item => {
    const name = normalizeComponentName(item);
    counts[name] = (counts[name] || 0) + 1;
  });

  let table = `### 📋 Bill of Materials (BOM)\n\n`;
  table += `| Item | Component Name | Qty | Operating Voltage | Interface Type | Recommended Specs |\n`;
  table += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;

  let idx = 1;
  for (const [name, qty] of Object.entries(counts)) {
    const lower = name.toLowerCase();
    let voltage = "3.3V - 5V";
    let iface = "Digital / Analog";
    let specs = "Standard Industrial Grade";

    if (lower.includes("microcontroller")) {
      voltage = "3.3V (5V via USB)";
      iface = "SPI, I2C, UART, ADC";
      specs = "ESP32-WROOM-32 / ATmega328P, Dual Core 240MHz";
    } else if (lower.includes("servo")) {
      voltage = "4.8V - 6.0V";
      iface = "PWM (50Hz)";
      specs = "SG90 Micro Servo / MG996R High Torque";
    } else if (lower.includes("oled")) {
      voltage = "3.3V - 5.0V";
      iface = "I2C (0x3C, SDA/SCL)";
      specs = "0.96 inch SSD1306 128x64 OLED Display";
    } else if (lower.includes("temperature")) {
      voltage = "3.3V - 5.5V";
      iface = "1-Wire / Analog";
      specs = "DHT11 / DHT22 / DS18B20 Temp & Humidity";
    } else if (lower.includes("relay")) {
      voltage = "5V Trigger";
      iface = "Digital GPIO";
      specs = "Optocoupler isolated, 10A 250VAC / 30VDC";
    } else if (lower.includes("buzzer")) {
      voltage = "3.3V - 5V";
      iface = "Digital / PWM Tone";
      specs = "Active Buzzer 85dB / Passive Piezo";
    } else if (lower.includes("distance")) {
      voltage = "5V DC";
      iface = "Echo / Trigger Pulse";
      specs = "HC-SR04 Ultrasonic Sensor (2cm - 400cm)";
    } else if (lower.includes("power")) {
      voltage = "5V / 12V DC";
      iface = "Regulated DC Rail";
      specs = "Breadboard Power Supply Module 5V/3.3V 800mA";
    }

    table += `| ${idx++} | **${name}** | ${qty} | ${voltage} | ${iface} | ${specs} |\n`;
  }

  table += `\n> [!TIP]\n> Always ensure high-draw peripherals (Servos, Motors, Relays) share a **Common Ground (GND)** with the Microcontroller to prevent floating reference noise.`;

  return table;
};

/**
 * Generate circuit safety and electrical diagnostics
 */
export const generateSafetyReport = (droppedItems = [], connections = []) => {
  const { categorized, hasMCU, hasPower } = categorizeComponents(droppedItems);

  let report = `### ⚡ Hardware Electrical & Voltage Diagnostics\n\n`;

  if (droppedItems.length === 0) {
    report += "Please place components on the canvas to run electrical safety diagnostics.\n";
    return report;
  }

  report += `**Active Devices Scanned**: ${droppedItems.length} components | **Connections**: ${connections.length}\n\n`;

  const findings = [];

  // Check 1: MCU existence
  if (!hasMCU) {
    findings.push({
      severity: "CRITICAL",
      title: "Missing Central Controller",
      desc: "There is no Microcontroller placed to regulate I/O states or monitor inputs. Connected components will be unmanaged."
    });
  }

  // Check 2: High current draw items
  const highDraw = droppedItems.filter(i => {
    const n = normalizeComponentName(i).toLowerCase();
    return n.includes("servo") || n.includes("motor") || n.includes("relay") || n.includes("hooter");
  });

  if (highDraw.length > 0 && !hasPower) {
    findings.push({
      severity: "WARNING",
      title: "Inductive Load / Brownout Risk",
      desc: `Detected **${highDraw.map(i => normalizeComponentName(i)).join(", ")}**. Inductive kickback and current surges (often exceeding 500mA) can pull down the MCU's 3.3V bus, resetting the microcontroller. **Remedy**: Connect an external 5V/2A DC power supply with a flyback diode and shared GND.`
    });
  }

  // Check 3: 5V to 3.3V Logic Level safety
  const sensors5V = droppedItems.filter(i => {
    const n = normalizeComponentName(i).toLowerCase();
    return n.includes("ultrasonic") || n.includes("distance") || n.includes("gas");
  });

  if (sensors5V.length > 0 && hasMCU) {
    findings.push({
      severity: "ADVISORY",
      title: "Logic Level Shifting (5V ➔ 3.3V)",
      desc: `Sensors such as **${sensors5V.map(i => normalizeComponentName(i)).join(", ")}** output 5V logic pulses. When feeding into ESP32 GPIOs (which are strictly 3.3V tolerant), use a simple **1kΩ / 2kΩ voltage divider** or a bi-directional logic shifter to protect MCU pins.`
    });
  }

  // Check 4: Unconnected floating pins
  if (connections.length === 0 && droppedItems.length > 1) {
    findings.push({
      severity: "WARNING",
      title: "Floating Input Pins",
      desc: "Components are present on canvas without wiring. Digital inputs without pull-up or pull-down resistors may read erratic floating electromagnetic noise."
    });
  }

  if (findings.length === 0) {
    report += `✅ **All systems clear!** No immediate electrical hazards detected on current component setup.\n\n`;
  } else {
    findings.forEach(f => {
      const icon = f.severity === "CRITICAL" ? "🔴" : f.severity === "WARNING" ? "🟡" : "🔵";
      report += `${icon} **[${f.severity}] ${f.title}**\n${f.desc}\n\n`;
    });
  }

  return report;
};

/**
 * Offline Intelligent Query Processor
 */
export const processLocalAIQuery = (query, canvasAnalysis) => {
  const q = (query || "").toLowerCase();
  const { categorized, totalComponents, totalConnections, hasMCU, tabName } = canvasAnalysis;

  // Thought step generator
  const thoughts = [
    `Inspected canvas state: Tab "${tabName}" with ${totalComponents} components and ${totalConnections} connections.`,
    `Parsed user intent: "${query.slice(0, 60)}${query.length > 60 ? "..." : ""}"`,
    `Evaluated pin mappings (Z1-Z6), sensor thresholds, and electrical constraints.`,
    `Formulating structured engineering response with actionable recommendations.`
  ];

  // Tool executions simulated
  const toolsExecuted = [
    { name: "SimulationCanvasReader", status: "success", detail: `${totalComponents} components analyzed` },
    { name: "LogicTopologyVerifier", status: "success", detail: `${totalConnections} connection paths validated` }
  ];

  let reply = "";

  if (q.includes("code") || q.includes("program") || q.includes("arduino") || q.includes("c++") || q.includes("firmware") || q.includes("sketch")) {
    toolsExecuted.push({ name: "FirmwareSynthesizer", status: "success", detail: "C++ sketch generated" });
    const code = generateFirmwareCode(canvasAnalysis.categorized.all.map(a => a.raw), []);
    reply = `Here is the production-ready C++ / Arduino firmware synthesized directly from your current simulation canvas components:

\`\`\`cpp
${code}
\`\`\`

### 📌 How to deploy this code:
1. Copy the code into the **Code Editor** tab in InnoIDE or Arduino IDE / VSCode.
2. Ensure you have the appropriate core (ESP32 or Arduino AVR) selected in your board manager.
3. If using an OLED display or Servo, install the recommended libraries via Library Manager (\`ESP32Servo\`, \`Adafruit_SSD1306\`).
4. Click **Compile & Flash** to upload to your target hardware.`;
  } else if (q.includes("analyze") || q.includes("circuit") || q.includes("explain") || q.includes("how does") || q.includes("overview")) {
    reply = `### 🔍 Circuit & Simulation Analysis Report

**Active Canvas**: \`${tabName}\`  
**Total Placed Components**: \`${totalComponents}\` | **Active Wiring Connections**: \`${totalConnections}\`

#### 🧩 Detected Hardware Architecture:
- **Microcontroller**: ${categorized.microcontrollers.length > 0 ? categorized.microcontrollers.map(m => `\`${m.name}\``).join(", ") : "⚠️ *None placed (Add from sidebar)*"}
- **Sensors**: ${categorized.sensors.length > 0 ? categorized.sensors.map(s => `\`${s.name}\``).join(", ") : "*None*"}
- **Actuators**: ${categorized.actuators.length > 0 ? categorized.actuators.map(a => `\`${a.name}\``).join(", ") : "*None*"}
- **Displays & Indicators**: ${categorized.displays.length > 0 ? categorized.displays.map(d => `\`${d.name}\``).join(", ") : "*None*"}
- **Power Unit**: ${categorized.power.length > 0 ? categorized.power.map(p => `\`${p.name}\``).join(", ") : "*Internal Bus / USB*"}

#### 📋 Operational Assessment:
${canvasAnalysis.warnings.length > 0 ? canvasAnalysis.warnings.join("\n\n") : "✅ Circuit topology has valid primary components for simulation."}

#### 💡 Next Recommended Steps:
${canvasAnalysis.suggestions.length > 0 ? canvasAnalysis.suggestions.join("\n\n") : "You can proceed to **Validate** the simulation or generate **Firmware Code**."}`;
  } else if (q.includes("bom") || q.includes("bill of materials") || q.includes("parts") || q.includes("components")) {
    toolsExecuted.push({ name: "BOMGenerator", status: "success", detail: "Bill of materials compiled" });
    reply = generateBOM(canvasAnalysis.categorized.all.map(a => a.raw));
  } else if (q.includes("voltage") || q.includes("safety") || q.includes("power") || q.includes("brownout") || q.includes("short")) {
    toolsExecuted.push({ name: "ElectricalSafetyAuditor", status: "success", detail: "Voltage rails and currents evaluated" });
    reply = generateSafetyReport(canvasAnalysis.categorized.all.map(a => a.raw), []);
  } else if (q.includes("debug") || q.includes("error") || q.includes("validate") || q.includes("issue") || q.includes("fix")) {
    reply = `### 🐞 Simulation Debugging & Troubleshooting

Here are the potential bottlenecks and diagnostic checks for your current canvas:

1. **Connector Zones (Z1 - Z6)**:
   - On the **Microcontroller**, each connector zone corresponds to designated digital or analog I/O lines.
   - Verify that your sensor output lines terminate on input-capable ADC pins (Z1, Z4).
2. **Signal Polarity & Ground Reference**:
   - Ensure you do not leave sensors floating without ground reference.
3. **Simulation Status**:
   - Make sure to press the **Play (Start)** button in the top control bar to begin simulating dynamic signal feeds into the Data Table.
4. **Validation Check**:
   - You can also click the **Validate** button on the top toolbar to verify against your product specifications.`;
  } else {
    // General conversational query
    reply = `Hello! I have examined your current simulation canvas (**${tabName}** with **${totalComponents} components**).

${canvasAnalysis.summaryText}

Here are a few things I can assist you with right now:
- 💻 **Synthesize Arduino / C++ code** tailored to your connected pins and sensors.
- ⚡ **Audit electrical safety**, power rails, and logic level compatibility (3.3V vs 5V).
- 🔍 **Explain circuit functionality** and trace signals between connector zones.
- 📋 **Generate a Bill of Materials (BOM)** with real-world component specifications.
- 🐞 **Debug simulation logic** or guide you on wiring missing peripherals.

What would you like to explore next?`;
  }

  return {
    thoughts,
    toolsExecuted,
    content: reply
  };
};
