# InnoIDE Desktop Application — System Prerequisites & Hardware Setup Guide

This guide details all hardware, software, and driver requirements needed on any Windows computer to run **InnoIDE**, compile firmware, and flash code directly to ESP32 microcontrollers.

---

## 📋 Table of Contents
1. [System Compatibility & Specifications](#1-system-compatibility--specifications)
2. [Hardware Requirements](#2-hardware-requirements)
3. [USB-to-Serial Drivers Installation](#3-usb-to-serial-drivers-installation)
4. [ESP-IDF Toolchain Installation (Compiler & Flasher)](#4-esp-idf-toolchain-installation-compiler--flasher)
5. [InnoIDE Configuration (Auto vs. Manual Setup)](#5-innoide-configuration-auto-vs-manual-setup)
6. [Step-by-Step Verification Guide](#6-step-by-step-verification-guide)
7. [Troubleshooting Common Issues](#7-troubleshooting-common-issues)

---

## 1. System Compatibility & Specifications

| Specification | Minimum Requirement | Recommended |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 (64-bit) Version 1903+ | Windows 11 (64-bit) |
| **Architecture** | x86_64 (x64) | x86_64 (x64) |
| **Processor** | Intel Core i3 / AMD Ryzen 3 (Dual-core) | Intel Core i5 / AMD Ryzen 5 or higher |
| **RAM** | 4 GB | 8 GB or higher |
| **Disk Space** | 1 GB (App only) / ~12 GB (with ESP-IDF) | 20 GB free space on SSD |
| **USB Ports** | 1x Available USB 2.0 or 3.0 Type-A/Type-C | Direct motherboard USB port |

> [!NOTE]
> The packaged `InnoIDE.exe` is completely self-contained. **You do NOT need to install Node.js, npm, or web development dependencies.**

---

## 2. Hardware Requirements

### A. Supported ESP32 Microcontrollers
InnoIDE natively supports compiling and flashing for all major Espressif target chips:
- **ESP32-S3** (e.g., ESP32-S3 DevKitC-1, ESP32-S3-WROOM-1/2, Freenove ESP32-S3)
- **ESP32** (Classic ESP32, ESP32-WROOM-32, ESP32-WROVER, DOIT DevKit V1)
- **ESP32-C3** (RISC-V architecture, ESP32-C3-DevKitM-1, Xiao ESP32C3)
- **ESP32-C6** (Wi-Fi 6 + Bluetooth 5 LE + Zigbee/Thread)
- **ESP32-S2** (Single-core Xtensa with USB-OTG)

### B. USB Data Cable (CRITICAL)
- You **MUST use a high-quality USB Data Cable** capable of transmitting both power and data.
- **Many cheap cables included with consumer devices are "Charge-Only" cables** that only have +5V and GND wires connected. If you use a charge-only cable, the ESP32 will power on and light up, but **no COM port will appear in Device Manager or InnoIDE**.

---

## 3. USB-to-Serial Drivers Installation

ESP32 boards communicate with your PC through a USB-to-UART bridge chip or via the chip's native USB CDC interface. Depending on your board model, you must ensure the corresponding driver is installed.

### Identifying Your Board's USB Chip
Look closely at the rectangular chip next to the USB connector on your ESP32 board:

```
+-------------------------------------------------------------------+
|  [ESP32 Board]                                                    |
|                                                                   |
|   +-------------------+    +------------+        +------------+   |
|   |   ESP32 SoC       |    | UART Chip  | <====> |  USB Port  |   |
|   |  (Espressif Chip) |    | (CH340 etc)|        | (To PC)    |   |
|   +-------------------+    +------------+        +------------+   |
+-------------------------------------------------------------------+
```

### Download Links & Instructions:

#### 1. WCH CH340 / CH341 (Most Common on NodeMCU / DevKit Boards)
- **Identifier**: Small IC marked `CH340G`, `CH340C`, or `CH341`.
- **Download**: [Official WCH Windows CH341SER Driver (ZIP / EXE)](http://www.wch-ic.com/downloads/CH341SER_EXE.html)
- **Installation**: Run `CH341SER.EXE` &rarr; Click **"Install"** &rarr; Wait for the "Driver install success" dialog.

#### 2. Silicon Labs CP2102 / CP2104 / CP210x
- **Identifier**: Square IC marked `SILABS CP2102` or `CP2104`.
- **Download**: [Official Silicon Labs CP210x Universal Windows Driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
- **Installation**: Extract the ZIP &rarr; Right-click `silabser.inf` &rarr; Select **"Install"**, or run `CP210xVCPInstaller_x64.exe`.

#### 3. FTDI FT232R / FT2232H
- **Download**: [Official FTDI VCP Windows Drivers](https://ftdichip.com/drivers/vcp-drivers/)
- **Installation**: Run the setup executable and follow the wizard.

#### 4. Native USB (ESP32-S3 / ESP32-C3 Direct USB)
- If your board connects directly to the ESP32-S3 USB D+/D- pins (often labeled **"USB"** as opposed to **"UART"**):
- Windows 10/11 automatically installs the generic **USB Serial Device (COMx)** driver.
- If yellow warning icons appear in Device Manager, run the Espressif USB Driver installer from `C:\Espressif\tools\idf-driver-install` or the ESP-IDF All-In-One installer.

---

## 4. ESP-IDF Toolchain Installation (Compiler & Flasher)

InnoIDE compiles embedded C/C++ source code directly on your local machine using the official **Espressif IoT Development Framework (ESP-IDF)** toolchain.

### Recommended Method: Espressif All-In-One Windows Installer

Download and run the official Espressif setup wizard:

> **Installer Download Link:**
> [👉 Espressif Official ESP-IDF Windows Installer (Offline / Online)](https://dl.espressif.com/dl/esp-idf/)
> *(Recommended Version: **ESP-IDF v5.3.x** or **v5.5.x**)*

### What the Installer Sets Up Automatically:
When you run the installer, it configures everything without manual intervention:
1. **ESP-IDF Framework**: Placed into `C:\Espressif\frameworks\esp-idf-v5.x`
2. **Dedicated Python Environment**: Contains `esptool.py`, `pyserial`, and build utilities
3. **Cross-Compilers**: `xtensa-esp32-elf-gcc`, `xtensa-esp32s3-elf-gcc`, `riscv32-esp-elf-gcc`
4. **Build Tools**: `CMake` (v3.16+) and `Ninja`
5. **Git for Windows**
6. **Espressif USB Drivers**

### Installation Walkthrough:
1. Run `esp-idf-tools-setup-offline.exe`.
2. Accept the license agreement.
3. Keep the default installation directory:
   - Framework: `C:\Espressif\frameworks\esp-idf-v5.x`
   - Tools: `C:\Espressif\tools`
4. On the component selection screen, keep all default checkmarks.
5. Click **Install** and allow the installer to complete (typically takes 5–10 minutes).
6. Once finished, you do **not** need to keep command prompts open; InnoIDE will interface with the tools automatically.

---

## 5. InnoIDE Configuration (Auto vs. Manual Setup)

InnoIDE includes an intelligent discovery engine that scans your system for ESP-IDF.

### Automatic Detection (Zero Configuration)
If you installed ESP-IDF using the standard path above, **InnoIDE detects it automatically** on launch by searching:
- `C:\Espressif\frameworks\esp-idf-v5.x`
- `C:\esp-idf`
- `D:\Espressif\frameworks\esp-idf-v5.x`
- System environment variable `IDF_PATH`

### Manual Configuration (If Installed in a Custom Folder or Drive)
If you installed ESP-IDF into a custom location (e.g., `D:\ESP-IDF` or `E:\Embedded\esp-idf`):
1. Launch **InnoIDE**.
2. Open the **Flash to Device** modal.
3. Click the **"ESP-IDF Setup"** button in the top right.
4. Click **"Browse"** and select the folder containing your `export.bat` file (for example: `D:\ESP-IDF`).
5. InnoIDE will validate the path and save it to your user configuration.

---

## 6. Step-by-Step Verification Guide

Follow this 3-step checklist to confirm your system is ready:

### Step 1: Verify USB Connection in Windows Device Manager
1. Press `Win + X` and select **Device Manager** (or press `Win + R`, type `devmgmt.msc`, and press Enter).
2. Expand the **Ports (COM & LPT)** section.
3. Plug in your ESP32 board.
4. You should see a new entry appear without any yellow warning triangles:
   - Example: `Silicon Labs CP210x USB to UART Bridge (COM3)`
   - Or: `USB-SERIAL CH340 (COM7)`
   - Or: `USB Serial Device (COM11)`
5. If no new device appears or an "Unknown Device" appears under *Other Devices*, revisit [Section 3: USB Drivers](#3-usb-to-serial-drivers-installation).

### Step 2: Open InnoIDE
1. Double-click `InnoIDE.exe`.
2. Notice the COM port pill in the navigation bar automatically selects your connected port (e.g., `COM3` or `COM11`).

### Step 3: Test a Quick Flash
1. Write or select a simple LED blink or Alert Sound script in the Code Editor.
2. Click **Start / Flash**.
3. InnoIDE will automatically:
   - Strip any accidental markdown formatting
   - Detect required hardware components (`driver`, `led_strip`, `i2s`)
   - Compile via Ninja
   - Upload firmware at 460,800 baud
4. The board will reboot and run your code immediately!

---

## 7. Troubleshooting Common Issues

### Issue 1: "No Serial Devices Detected" / Port Dropdown is Empty
- **Cause**: Using a charge-only cable or missing USB drivers.
- **Solution**:
  1. Swap the USB cable for one known to transfer data (e.g., a phone data cable).
  2. Try a different USB port directly on your computer (avoid unpowered USB hubs).
  3. Install the CH340 or CP210x driver from [Section 3](#3-usb-to-serial-drivers-installation).

### Issue 2: "Access Denied (COM Port Busy)"
- **Cause**: Another program (e.g., Arduino IDE Serial Monitor, PuTTY, VS Code Serial Monitor) is currently holding the COM port open.
- **Solution**:
  1. Close any external serial terminals.
  2. If the InnoIDE Serial Monitor is active, InnoIDE will close it automatically before flashing; however, if locked by Windows, unplug and replug the USB cable.

### Issue 3: "A fatal error occurred: Failed to connect to ESP32: Timed out waiting for packet header"
- **Cause**: The board's auto-reset circuit failed to pull GPIO 0 low to enter serial bootloader mode.
- **Solution (Manual Bootloader Entry)**:
  1. Press and **HOLD** the physical **BOOT** (or `IO0`) button on your ESP32 board.
  2. While holding **BOOT**, click the **RESET** (or `EN`) button once.
  3. Release the **BOOT** button after 1 second.
  4. Click **Flash / Continue** in InnoIDE.

### Issue 4: "idf.py build failed with exit code 2"
- **Cause**: Missing component dependencies or syntax errors (such as markdown code block backticks ` ```c `).
- **Solution**:
  - InnoIDE automatically strips markdown fences and synchronizes `CMakeLists.txt` requirements on save. Ensure you save your code (`Ctrl + S`) in InnoIDE before flashing.

---

## 📞 Support & Resources
- **Official InnoIDE Desktop Releases**: [GitHub Releases Page](https://github.com/Dineshkumar-1393-innotrat/inno-ide-desktopapp/releases)
- **Espressif Official ESP-IDF Docs**: [docs.espressif.com](https://docs.espressif.com/projects/esp-idf/en/latest/)
- **Espressif Component Registry**: [components.espressif.com](https://components.espressif.com/)

