# ESP32-S3 Standalone Wireless Operation Guide
## Operating Wirelessly Without Connecting to a Laptop

---

## 1. Executive Summary & Objective

The primary objective was to transition the **ESP32-S3** microcontroller from requiring a continuous wired USB connection with the laptop to operating **100% autonomously and wirelessly**, while strictly ensuring:
- **Zero regression on existing wired functionality**: Wired USB-Serial/JTAG CDC, UART0 console, serial monitoring, and `idf.py` / `esptool.py` flashing pipelines remain fully functional.
- **Dual-channel concurrent execution**: The board can be monitored or controlled over USB and Wi-Fi simultaneously without interference.
- **Autonomous power & operation**: The board can be disconnected from the laptop, connected to an external battery or 5V USB charger, and controlled remotely via a smartphone (iOS / Android) or the InnoIDE desktop application over the air.

---

## 2. Architecture Overview

To enable wireless remote control without breaking physical serial communication, a **multi-task FreeRTOS concurrency architecture** was implemented on the ESP32-S3:

```
                  +-------------------------------------------------------+
                  |                 ESP32-S3 Microcontroller             |
                  +-------------------------------------------------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
        [WIRED CHANNEL]                                       [WIRELESS DUAL-STACK]
  - Native USB-Serial/JTAG CDC                         - Wi-Fi Station (Router: 'innotrat')
  - Hardware UART0 (GPIO 43/44)                        - Fallback/Concurrent SoftAP Hotspot
  - Baud: 115200 bps                                     SSID: 'InnoIDE-ESP32-S3' (192.168.4.1)
  - Flashing & Debugging                                                 |
                   |                                                     |
                   +--------------------------+--------------------------+
                                              |
                              +---------------+---------------+
                              |                               |
                     [FREE-RTOS NETWORK TASKS]       [COMMAND ENGINE]
                     - HTTP Server (:80)             - LED:1 (Active/Blink)
                       * Mobile Web Dashboard        - LED:0 (Stop/Off)
                       * REST API (/api/action)      - STATUS / PING
                     - TCP Socket Server (:8888)     - SCAN (Wi-Fi Scanner)
                       * Wireless Streaming Link     - REBOOT / RESET
                     - UDP Beacon Broadcaster (:5056)         |
                       * Auto-Discovery for InnoIDE           |
                     - Captive Portal DNS (:53)               v
                       * Auto-launch on Smartphones    [HARDWARE ACTUATION]
                                                       - GPIO 48: WS2812 RGB LED
                                                       - GPIO 2: Standard LED
```

---

## 3. Files Modified & Created

| Component | File Path | Key Changes Implemented |
| :--- | :--- | :--- |
| **Firmware Core** | [main/main.c](file:///d:/ide-desktop-app/main/main.c) | - Concurrent APSTA Wi-Fi mode (SoftAP + Station)<br>- Embedded HTTP server with mobile Web Control UI<br>- TCP streaming socket server on port 8888<br>- Captive portal DNS server on UDP port 53<br>- UDP beacon announcer on port 5056<br>- Unified hardware actuation engine (GPIO 48 & GPIO 2)<br>- USB CDC + UART0 non-blocking serial loops |
| **Firmware Build** | [main/CMakeLists.txt](file:///d:/ide-desktop-app/main/CMakeLists.txt) | - Linked `esp_http_server`, `esp_wifi`, `lwip`, `nvs_flash`, `esp_netif` |
| **IDE Tooling** | [.clangd](file:///d:/ide-desktop-app/.clangd) & [.vscode/c_cpp_properties.json](file:///d:/ide-desktop-app/.vscode/c_cpp_properties.json) | - Added ESP-IDF component include paths (`esp_http_server`, `esp_wifi`, `lwip`)<br>- Suppressed unknown compiler flag diagnostics |
| **Desktop Backend** | [electron/services/serial.service.js](file:///d:/ide-desktop-app/electron/services/serial.service.js) | - Transparent `net.Socket` support for `TCP:<IP>:<PORT>` targets alongside physical COM ports (`COM9`, `COM3`, etc.) |
| **Network Discovery** | [electron/services/network_discovery.service.js](file:///d:/ide-desktop-app/electron/services/network_discovery.service.js) | - Listens for UDP beacon announcements on port 5056 and reports discovered Wi-Fi ESP32 devices |
| **Desktop IPC** | [electron/ipc/device.ipc.js](file:///d:/ide-desktop-app/electron/ipc/device.ipc.js) & [electron/preload.cjs](file:///d:/ide-desktop-app/electron/preload.cjs) | - Exposed `device:discover-wifi` handler to the Electron UI |
| **Frontend UI** | [src/components/ESP32Flasher.jsx](file:///d:/ide-desktop-app/src/components/ESP32Flasher.jsx) | - Added Manual Wi-Fi connection bar (`TCP:<IP>:<PORT>`)<br>- Added filter toggles (All / USB Only / Wi-Fi Only)<br>- Integrated wireless telemetry badge and actuation |

---

## 4. How to Power the ESP32-S3 Without a Laptop

Once flashed, the ESP32-S3 does **not** need the laptop:

1. **Unplug** the USB-C cable from the laptop.
2. **Connect the ESP32-S3 to any standard 5V power source**:
   - Any mobile phone USB wall charger adapter (5V, 1A or 2A).
   - A portable USB power bank.
   - An external battery pack connected to the **VIN / 5V** and **GND** pins of the ESP32-S3 board.
3. The board will boot autonomously in **less than 2 seconds**.

---

## 5. How to Operate from Mobile Phone

### Step 1: Connect Phone to ESP32 Wi-Fi
1. Open **Settings $\rightarrow$ Wi-Fi** on your mobile phone (iPhone or Android).
2. Look for the network:
   - **Wi-Fi Name (SSID):** `InnoIDE-ESP32-S3`
   - **Password:** `12345678`
3. Tap **Connect**.

> [!IMPORTANT]
> **Mobile Data / Cellular Data Notice**:
> Because the ESP32 hotspot provides local hardware control and does not provide public internet access, modern smartphones may attempt to route browser traffic through your 4G/5G mobile data.
> - If prompted: *"This network has no internet. Stay connected?"* $\rightarrow$ Tap **"YES" / "Keep Connected"**.
> - If the page fails to load, **temporarily turn OFF Mobile Data (Cellular Data)** on your phone.

---

### Step 2: Open the Mobile Control Dashboard
Open **Chrome** or **Safari** on your phone and type in the address bar:
```text
http://192.168.4.1
```
*(Ensure you type `http://` and NOT `https://`)*.

You will see an embedded dark-mode control interface:
- **▶ TURN ON Button**: Turns on the hardware LED (blinking sequence).
- **■ TURN OFF Button**: Turns off the hardware LED.
- **↻ Refresh Button**: Retrieves real-time device telemetry (IP, mode, LED status).

---

### Step 3: Direct HTTP REST Endpoints (For Shortcuts / Automation)
You can trigger commands directly via browser URLs or automation apps (such as Apple Shortcuts, Android Tasker, or Postman):

| Action | HTTP Request / Browser URL | Response Format |
| :--- | :--- | :--- |
| **Turn LED ON** | `GET http://192.168.4.1/api/action?payload=LED:1` | `{"success":true,"led":1,"state":"ON"}` |
| **Turn LED OFF** | `GET http://192.168.4.1/api/action?payload=LED:0` | `{"success":true,"led":0,"state":"OFF"}` |
| **Query Status** | `GET http://192.168.4.1/api/status` | `{"device":"ESP32-S3","ip":"192.168.4.1","mode":"AP_HOTSPOT","led":0,"port":8888}` |

---

### Step 4: Using a Mobile Serial / TCP Terminal App
If you want an interactive serial terminal on your phone:
1. Install any free TCP terminal app (e.g. **Serial WiFi Terminal** on Android, or **TCP Console** on iOS).
2. Configure the connection:
   - **Host:** `192.168.4.1`
   - **Port:** `8888`
   - **Protocol:** `TCP`
3. Tap connect and send commands:
   - `LED:1` $\rightarrow$ Turns LED ON
   - `LED:0` $\rightarrow$ Turns LED OFF
   - `STATUS` $\rightarrow$ Returns board telemetry
   - `PING` $\rightarrow$ Returns `PONG`
   - `REBOOT` $\rightarrow$ Restarts the ESP32-S3

---

## 6. How to Operate from InnoIDE Desktop App Over Wi-Fi

The InnoIDE desktop application can monitor and actuate the ESP32-S3 wirelessly without requiring a USB cable:

1. Connect your laptop's Wi-Fi to **`InnoIDE-ESP32-S3`** (or have both on your office router).
2. In InnoIDE, navigate to the **ESP32 Flasher / Monitor** view.
3. In the Device Selection dropdown, you can:
   - Click **"Scan Wi-Fi"** to let UDP auto-discovery locate the board, OR
   - Enter `TCP:192.168.4.1:8888` in the manual connection bar and click **Connect**.
4. All serial monitors, terminal streams, and actuation buttons in InnoIDE function identically over Wi-Fi as they did over USB.

---

## 7. Troubleshooting & Frequently Asked Questions

### Q1: Why does Chrome on my phone say "Site can't be reached" when typing `192.168.4.1`?
- **Root Cause**: Your phone has **Mobile Data (4G/5G)** enabled. When your phone sees that `InnoIDE-ESP32-S3` has no public internet, it routes all web requests through the cellular network instead of Wi-Fi.
- **Solution**: Turn **OFF Mobile Data / Cellular Data** in your phone settings while controlling the ESP32.

### Q2: Why did `innotrat` show "Reason 201: NO_AP_FOUND"?
- **Root Cause**: ESP32-S3 microcontrollers only possess a **2.4 GHz** Wi-Fi antenna. If `innotrat` is configured as **5 GHz only**, the ESP32 cannot see it.
- **Solution**:
  - If using a **Phone Hotspot**: On iPhone, turn on **"Maximize Compatibility"**. On Android, set AP Band to **"2.4 GHz"**.
  - If using an **Office Router**: Verify if your router broadcasts a separate 2.4 GHz SSID (e.g., `innotrat_2.4G`).

### Q3: How do I flash new firmware if the board is running on battery?
- Simply reconnect the USB cable to your laptop. The wired USB-Serial/JTAG CDC port (`COM9`) takes over instantly, allowing standard `idf.py -p COM9 flash` without changing any settings.
