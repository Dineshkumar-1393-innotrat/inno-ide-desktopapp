# Cloud Remote Tunneling Architecture (`lhr.life`)

## Overview

InnoIDE provides an **IoT Companion Studio** that allows users to instantly control, monitor, and automate physical ESP32 microcontrollers from any smartphone. 

To bridge the gap between a desktop application connected via USB Serial and an external smartphone, InnoIDE incorporates an automated **Cloud Remote Tunneling System** using **`localhost.run`** (domain **`lhr.life`**) and native **OpenSSH**.

```mermaid
graph LR
    subgraph Mobile["📱 Smartphone (Any Network)"]
        Browser["Mobile Web App / APK"]
    end

    subgraph Cloud["🌐 Public Internet & Cloud Relay"]
        Tunnel["HTTPS Relay (0368e1ad64365b.lhr.life)"]
    end

    subgraph Host["💻 Developer PC (InnoIDE Desktop)"]
        SSH["OpenSSH Reverse Tunnel (Client)"]
        Server["Local Companion Server (Port 5055)"]
        Bridge["Serial Bridge Service"]
    end

    subgraph Embedded["⚡ Embedded Hardware"]
        ESP32["ESP32 Microcontroller (COM Port)"]
    end

    Browser -->|Encrypted HTTPS API Requests| Tunnel
    Tunnel <==>|Encrypted SSH Reverse Forward| SSH
    SSH --> Server
    Server --> Bridge
    Bridge -->|UART Serial (115200 Baud)| ESP32
```

---

## Why InnoIDE Uses `lhr.life` (localhost.run)

### 1. Cellular 4G/5G & WAN Remote Access
* **The Problem**: Without cloud tunneling, a smartphone can only communicate with the developer PC if both devices share the exact same Wi-Fi router subnet (e.g., `http://192.168.1.102:5055`). Most corporate, university, and public Wi-Fi networks enforce **Client Isolation**, blocking peer-to-peer communication between devices. Furthermore, phones on cellular data (4G/5G) have no direct route to local LAN IP addresses.
* **The Solution**: The reverse SSH tunnel assigns a publicly resolvable hostname (e.g., `https://413dc497e1a783.lhr.life`). The mobile phone connects directly through standard internet infrastructure, completely bypassing NAT, router firewalls, and subnet restrictions.

### 2. Zero-Installation & Zero-Setup (OpenSSH)
* **The Problem**: Traditional tunneling tools (like standard Ngrok or Cloudflare Tunnels) require developers or end users to download dedicated binaries, create accounts, generate auth tokens, and configure daemon files.
* **The Solution**: Windows 10 and 11 come pre-installed with the official Microsoft OpenSSH client (`C:\Windows\System32\OpenSSH\ssh.exe`). InnoIDE utilizes anonymous SSH forwarding (`ssh nokey@localhost.run`), allowing instant tunnel generation with:
  * **No software installation**
  * **No user registration or account creation**
  * **No API keys or auth tokens**
  * **Zero configuration on the user's part**

### 3. Instant HTTPS / TLS Encryption
* **The Problem**: Modern mobile operating systems (iOS and Android) and web browsers (Chrome, Safari) strictly enforce secure contexts:
  * Camera permissions for QR scanners require HTTPS.
  * Chrome enforces **Private Network Access (PNA)** policies that block public websites from dispatching unencrypted HTTP requests to private IP addresses.
  * Mixed-content security policies block non-SSL API requests.
* **The Solution**: `localhost.run` automatically provisions valid, trusted TLS/SSL certificates for every ephemeral subdomain. Mobile phones interact with a fully compliant `https://` endpoint.

---

## Technical Architecture & Lifecycle

### 1. Execution Flow

```
1. InnoIDE Starts Companion Server
   └─► Node.js HTTP Server listens on http://127.0.0.1:5055
       │
2. Tunnel Daemon Spawns OpenSSH
   └─► ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:5055 nokey@localhost.run
       │
3. Tunnel Handshake & URL Allocation
   └─► localhost.run assigns https://<subdomain>.lhr.life
       │
4. State Synchronization
   ├─► active_tunnel.json updated with live URL
   ├─► Desktop UI dynamically generates QR Code
   └─► Push event: companion:tunnel-status sent to Renderer
       │
5. User Scans QR Code
   └─► Smartphone loads Web Companion from https://<subdomain>.lhr.life
       │
6. User Toggles Switch / Automation Rule Fires
   ├─► Mobile sends POST /api/action {"payload": "LED:1"}
   ├─► localhost.run forwards payload through SSH tunnel to Port 5055
   ├─► Companion Server dispatches serial message to COM port
   └─► ESP32 receives command and toggles GPIO 2 (LED turns ON)
```

---

## Network Modes Comparison

In the **Publish Companion App** modal, InnoIDE allows switching between two distinct operational modes:

| Feature | Cloud Remote (4G/5G) | Local Wi-Fi Mode |
| :--- | :--- | :--- |
| **Endpoint URL** | `https://<hash>.lhr.life` | `http://192.168.x.x:5055` |
| **Network Reach** | Global (Internet / 4G / 5G / WAN) | Same Local Wi-Fi Router Only |
| **Setup Required** | None (Automatic SSH tunnel) | Devices must share same Wi-Fi |
| **Protocol** | HTTPS (TLS Encrypted) | HTTP (Plaintext LAN) |
| **Firewall / NAT Traversal** | Automatic (Bypasses all routers) | Blocked by Client Isolation routers |
| **Speed / Latency** | ~60ms - 150ms (Cloud hop) | ~2ms - 10ms (Direct LAN) |

---

## Codebase Implementation Map

| File | Role |
| :--- | :--- |
| **[`electron/ipc/index.js`](file:///d:/ide-desktop-app/electron/ipc/index.js)** | Primary IPC handler managing tunnel startup, shutdown, fallback providers (Serveo), and status file synchronization. |
| **[`scratch/cloud_tunnel_daemon.cjs`](file:///d:/ide-desktop-app/scratch/cloud_tunnel_daemon.cjs)** | Background supervisor script that ensures SSH tunnel auto-restart on network drop. |
| **[`scratch/active_tunnel.json`](file:///d:/ide-desktop-app/scratch/active_tunnel.json)** | On-disk lockfile storing the active public URL, timestamp, and active boolean flag. |
| **[`electron/dev-runner.js`](file:///d:/ide-desktop-app/electron/dev-runner.js)** | Development supervisor that automatically launches and terminates the tunnel daemon alongside Vite and Electron. |
| **[`src/components/ESP32Flasher.jsx`](file:///d:/ide-desktop-app/src/components/ESP32Flasher.jsx)** | Frontend React component generating dynamic QR codes, handling network toggles, and dispatching multi-device sync. |
| **[`main/main.c`](file:///d:/ide-desktop-app/main/main.c)** | ESP32 C firmware running FreeRTOS, parsing incoming UART commands (`LED:1`, `LED:0`), and driving physical GPIOs. |

---

## Redundancy & Fault Tolerance

1. **Serveo Fallback (`serveo.net`)**:
   If `localhost.run` experiences server outages or network rate limits, the system automatically falls back to an alternative SSH tunnel provider (`serveo.net`), returning a `*.serveousercontent.com` address without requiring user intervention.
2. **Auto-Reconnection**:
   If an SSH connection drops due to laptop sleep or Wi-Fi change, the daemon automatically catches exit codes and initiates a fresh handshake within 2 seconds.
3. **Stale Lock Invalidation**:
   Lockfiles older than 15 minutes or with inactive statuses are automatically discarded, preventing stale URLs from displaying in the UI.
