#!/usr/bin/env python3
import sys
import os
import json
import argparse
import subprocess
import shutil

# Allowed target chips for ESP-IDF
ALLOWED_TARGETS = {"esp32", "esp32c2", "esp32c3", "esp32c6", "esp32s2", "esp32s3"}
# Extended set that also accepts 'auto' for auto-detection
ALLOWED_TARGETS_WITH_AUTO = ALLOWED_TARGETS | {"auto"}
DEFAULT_URL = "http://localhost:5010/check-code"
last_idf_lookup_error = ""

def send_event(status, **kwargs):
    """Utility to print a JSON line to stdout and flush immediately."""
    payload = {"status": status}
    payload.update(kwargs)
    print(json.dumps(payload), flush=True)

def get_env(name, default=""):
    """Read an environment variable case-insensitively for Windows compatibility."""
    if name in os.environ:
        return os.environ.get(name, default)
    upper_name = name.upper()
    for key, value in os.environ.items():
        if key.upper() == upper_name:
            return value
    return default

def find_idf_python():
    """Locate the Python executable created by ESP-IDF install.bat/install.sh."""
    idf_python_env = get_env("IDF_PYTHON_ENV_PATH")
    if idf_python_env:
        if os.path.isfile(idf_python_env):
            return idf_python_env

        candidate = os.path.join(
            idf_python_env,
            "Scripts" if os.name == "nt" else "bin",
            "python.exe" if os.name == "nt" else "python"
        )
        if os.path.exists(candidate):
            return candidate

    # Search standard tools directories
    search_dirs = []
    env_tools = get_env("IDF_TOOLS_PATH")
    if env_tools:
        search_dirs.append(env_tools)
    search_dirs.extend([
        r"D:\esp-idf-tools",
        r"C:\esp-idf-tools",
        r"C:\Espressif\tools",
        r"D:\Espressif\tools",
        os.path.join(os.path.expanduser("~"), ".espressif")
    ])

    for idf_tools_path in search_dirs:
        python_env_dir = os.path.join(idf_tools_path, "python_env")
        if os.path.isdir(python_env_dir):
            for name in sorted(os.listdir(python_env_dir), reverse=True):
                candidate = os.path.join(
                    python_env_dir,
                    name,
                    "Scripts" if os.name == "nt" else "bin",
                    "python.exe" if os.name == "nt" else "python"
                )
                if os.path.exists(candidate):
                    return candidate

    # Check python in PATH as fallback
    py_in_path = shutil.which("python") or shutil.which("python3")
    return py_in_path

def describe_idf_lookup_error():
    """Provide a useful error for the UI when ESP-IDF is installed but not configured."""
    if last_idf_lookup_error:
        return last_idf_lookup_error

    idf_path = get_env("IDF_PATH")
    if idf_path:
        install_script = os.path.join(idf_path, "install.bat" if os.name == "nt" else "install.sh")
        return (
            "ESP-IDF Python environment was not found. "
            f"Run '{install_script}' once, then restart InnoIDE and try again."
        )

    return "'idf.py' executable not found. Ensure ESP-IDF is installed and export.bat has been run."

def get_idf_path():
    """Locate ESP-IDF installation directory."""
    p = get_env("IDF_PATH")
    if p and os.path.exists(p):
        return p
    candidates = [
        r"D:\ESP-IDF",
        r"D:\esp-idf",
        r"C:\Espressif\frameworks\esp-idf-v5.3",
        r"C:\Espressif\frameworks\esp-idf-v5.2.2",
        r"C:\Espressif\esp-idf",
        r"C:\esp-idf",
        os.path.join(os.path.expanduser("~"), "esp", "esp-idf")
    ]
    for cand in candidates:
        if os.path.isdir(cand) and (os.path.isfile(os.path.join(cand, "tools", "idf.py")) or os.path.isfile(os.path.join(cand, "export.bat"))):
            return cand
    return ""

def ensure_idf_environment():
    """Ensure ESP-IDF environment variables (PATH, IDF_PYTHON_ENV_PATH, etc.) are loaded."""
    idf_path = get_idf_path()
    if idf_path:
        os.environ["IDF_PATH"] = idf_path

    # Always ensure tools directories (cmake, ninja, compiler) are on PATH
    search_dirs = [
        get_env("IDF_TOOLS_PATH"),
        r"D:\esp-idf-tools",
        r"C:\esp-idf-tools",
        r"C:\Espressif\tools",
        r"D:\Espressif\tools",
        os.path.join(os.path.expanduser("~"), ".espressif")
    ]
    tools_base = next((d for d in search_dirs if d and os.path.isdir(d)), None)
    if tools_base:
        os.environ["IDF_TOOLS_PATH"] = tools_base
        extra_paths = []
        py_env_dir = os.path.join(tools_base, "python_env")
        if os.path.isdir(py_env_dir):
            for name in sorted(os.listdir(py_env_dir), reverse=True):
                candidate_dir = os.path.join(py_env_dir, name)
                scripts = os.path.join(candidate_dir, "Scripts" if os.name == "nt" else "bin")
                if os.path.isdir(scripts):
                    os.environ["IDF_PYTHON_ENV_PATH"] = candidate_dir
                    extra_paths.append(scripts)
                    break
        tools_sub = os.path.join(tools_base, "tools")
        if os.path.isdir(tools_sub):
            for root, dirs, files in os.walk(tools_sub):
                if any(f.endswith(".exe") for f in files) if os.name == "nt" else any(os.access(os.path.join(root, f), os.X_OK) for f in files):
                    extra_paths.append(root)
        if idf_path:
            extra_paths.append(os.path.join(idf_path, "tools"))
        if extra_paths:
            cur_path = os.environ.get("PATH", "")
            os.environ["PATH"] = os.pathsep.join(extra_paths) + os.pathsep + cur_path

    if shutil.which("cmake") is not None and get_env("IDF_PATH"):
        return

    if os.name == "nt" and idf_path:
        export_bat = os.path.join(idf_path, "export.bat")
        if os.path.isfile(export_bat):
            try:
                res = subprocess.run(
                    f'call "{export_bat}" > nul && set',
                    shell=True,
                    capture_output=True,
                    text=True,
                    cwd=idf_path,
                    timeout=30
                )
                if res.returncode == 0:
                    for line in res.stdout.splitlines():
                        if "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k] = v
            except Exception:
                pass

def find_idf_py_executable():
    """Locate idf.py executable or Python script."""
    global last_idf_lookup_error
    last_idf_lookup_error = ""

    ensure_idf_environment()

    # Prefer the selected ESP-IDF installation and its own Python virtualenv.
    idf_path = get_idf_path()
    if idf_path:
        script_path = os.path.join(idf_path, "tools", "idf.py")
        if os.path.exists(script_path):
            idf_python = find_idf_python()
            if idf_python:
                return [idf_python, script_path]

            install_script = os.path.join(idf_path, "install.bat" if os.name == "nt" else "install.sh")
            last_idf_lookup_error = (
                "ESP-IDF is installed, but its Python virtual environment is missing. "
                f"Run '{install_script}' once, then restart InnoIDE and try again."
            )
            return None

    # Fall back to PATH only when no explicit IDF_PATH script is available.
    idf_in_path = shutil.which("idf.py") or shutil.which("idf.py.exe") or shutil.which("idf.py.bat")
    if idf_in_path:
        return [idf_in_path]

    return None

def detect_chip(port):
    """Auto-detect the ESP32 chip variant connected on the given serial port.

    Uses `esptool.py chip_id` with --chip auto to identify the chip.
    Returns a lowercase target string like 'esp32', 'esp32s3', 'esp32c3', etc.
    Returns None if detection fails.
    """
    if not port:
        return None

    idf_python = find_idf_python()
    if not idf_python:
        return None

    idf_path = get_idf_path()
    esptool_script = ""
    if idf_path:
        cand_script = os.path.join(idf_path, "components", "esptool_py", "esptool", "esptool.py")
        if os.path.isfile(cand_script):
            esptool_script = cand_script

    try:
        # Prefer python -m esptool
        cmd = [
            idf_python, "-m", "esptool",
            "--chip", "auto",
            "--port", port,
            "chip_id"
        ]
        send_event("log", stream="system", log=f"[AutoDetect] Detecting chip on {port}...")
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        output = (proc.stdout or "") + (proc.stderr or "")

        # Fallback to direct script if -m esptool failed
        if proc.returncode != 0 and esptool_script:
            cmd2 = [idf_python, esptool_script, "--chip", "auto", "--port", port, "chip_id"]
            proc2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=15)
            if proc2.returncode == 0:
                output = (proc2.stdout or "") + (proc2.stderr or "")

        # Parse the chip type from esptool output
        chip_map = {
            "esp32-s3": "esp32s3",
            "esp32-s2": "esp32s2",
            "esp32-c3": "esp32c3",
            "esp32-c2": "esp32c2",
            "esp32-c6": "esp32c6",
            "esp32-h2": "esp32h2",
            "esp32": "esp32",
        }

        output_lower = output.lower()
        # Check most specific first (e.g. esp32-s3 before esp32)
        for pattern, target in sorted(chip_map.items(), key=lambda x: -len(x[0])):
            if pattern in output_lower:
                send_event("log", stream="system", log=f"[AutoDetect] Detected chip: {target}")
                return target

        send_event("log", stream="system", log=f"[AutoDetect] Could not parse chip type from output: {output[:200]}")
        return None
    except subprocess.TimeoutExpired:
        send_event("log", stream="system", log=f"[AutoDetect] Chip detection timed out on {port}")
        return None
    except Exception as e:
        send_event("log", stream="system", log=f"[AutoDetect] Chip detection error: {e}")
        return None


def check_env(target="esp32c6"):
    """Check Python environment, ESP-IDF installation, idf.py, CMake, Ninja, esptool."""
    idf_exec = find_idf_py_executable()
    
    result = {
        "python": True,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "idf": False,
        "idf_path": get_env("IDF_PATH"),
        "idf_version": "",
        "cmake": shutil.which("cmake") is not None,
        "ninja": shutil.which("ninja") is not None,
        "esptool": shutil.which("esptool.py") is not None or idf_exec is not None,
        "target_supported": target.lower() in ALLOWED_TARGETS,
        "target": target
    }

    if idf_exec:
        try:
            cmd = idf_exec + ["--version"]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if proc.returncode == 0:
                result["idf"] = True
                result["idf_version"] = proc.stdout.strip()
        except Exception as e:
            result["idf_error"] = str(e)
    else:
        result["idf_error"] = describe_idf_lookup_error()

    send_event("env_checked", env=result)
    return result

def fetch_firmware_code(url=DEFAULT_URL):
    """Fetch C source code from backend API."""
    send_event("fetching_code", url=url)
    try:
        import requests

        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        code = data.get("code")

        if not code or not code.strip():
            send_event("error", stage="fetch", message="Backend returned empty firmware code.")
            return None

        send_event("code_fetched", code_length=len(code), preview=code[:120])
        return code
    except Exception as e:
        send_event("error", stage="fetch", message=f"Failed to fetch firmware from backend: {str(e)}")
        return None

def ensure_reactive_firmware(code):
    """Keep user's firmware code 100% intact."""
    return code

    import re
    led_gpio = "GPIO_NUM_48"
    gpio_match = re.search(r"strip_gpio_num\s*=\s*(GPIO_NUM_\d+|\d+)", code, re.I) or re.search(r"#define\s+LED_GPIO\s+(GPIO_NUM_\d+|\d+)", code, re.I)
    if gpio_match:
        led_gpio = gpio_match.group(1)

    r, g, b = 0, 0, 255
    pixel_match = re.search(r"led_strip_set_pixel\s*\([^,]+,\s*\d+,\s*(\d+),\s*(\d+),\s*(\d+)\)", code)
    if pixel_match:
        pr, pg, pb = int(pixel_match.group(1)), int(pixel_match.group(2)), int(pixel_match.group(3))
        if pr > 0 or pg > 0 or pb > 0:
            r, g, b = pr, pg, pb

    delay_ms = 1000
    delay_match = re.search(r"vTaskDelay\s*\(\s*pdMS_TO_TICKS\s*\(\s*(\d+)\s*\)\s*\)", code)
    if delay_match:
        try:
            delay_ms = int(delay_match.group(1))
        except Exception:
            pass

    return f"""#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

#include "driver/gpio.h"
#include "driver/uart.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "led_strip.h"

// Hardware Pin Definitions & Target Architecture Compatibility
#if CONFIG_IDF_TARGET_ESP32S3
#include "driver/usb_serial_jtag.h"
#define HAS_USB_SERIAL_JTAG 1
#define LED_GPIO {led_gpio}
#define LED_GPIO_STANDARD GPIO_NUM_2
#elif CONFIG_IDF_TARGET_ESP32C3
#include "driver/usb_serial_jtag.h"
#define HAS_USB_SERIAL_JTAG 1
#define LED_GPIO GPIO_NUM_8
#define LED_GPIO_STANDARD GPIO_NUM_2
#else
#define HAS_USB_SERIAL_JTAG 0
#define LED_GPIO GPIO_NUM_2
#define LED_GPIO_STANDARD GPIO_NUM_2
#endif

#define LED_COUNT 1
#define COMMAND_BUFFER_SIZE 64

#define LED_COLOR_R {r}
#define LED_COLOR_G {g}
#define LED_COLOR_B {b}
#define BLINK_DELAY_MS {delay_ms}

static led_strip_handle_t s_strip = NULL;
static volatile bool s_blink_enabled = true;

static void send_serial_ack(const char *msg)
{{
    size_t len = strlen(msg);
#if HAS_USB_SERIAL_JTAG
    usb_serial_jtag_write_bytes(msg, len, pdMS_TO_TICKS(50));
#endif
    uart_write_bytes(UART_NUM_0, msg, len);
}}

static void apply_command(const char *cmd)
{{
    if (!cmd || strlen(cmd) == 0) return;

    if (strstr(cmd, "LED:0") != NULL ||
        strstr(cmd, "led:0") != NULL ||
        strstr(cmd, "LED:OFF") != NULL ||
        strstr(cmd, "led:off") != NULL ||
        strstr(cmd, "LED:LOW") != NULL ||
        strstr(cmd, "led:low") != NULL ||
        strstr(cmd, "GPIO:LOW") != NULL ||
        strstr(cmd, "gpio:low") != NULL ||
        strstr(cmd, "GPIO:0") != NULL ||
        strstr(cmd, "gpio:0") != NULL ||
        strstr(cmd, "RELAY:0") != NULL ||
        strcasecmp(cmd, "0") == 0 ||
        strcasecmp(cmd, "OFF") == 0 ||
        strcasecmp(cmd, "LOW") == 0 ||
        strcasecmp(cmd, "STOP") == 0) {{

        s_blink_enabled = false;
        if (s_strip) {{
            led_strip_clear(s_strip);
            led_strip_refresh(s_strip);
        }}
        gpio_set_level(LED_GPIO_STANDARD, 0);
        send_serial_ack("ACK:LED:0\\r\\n");
    }}
    else if (strstr(cmd, "LED:1") != NULL ||
             strstr(cmd, "led:1") != NULL ||
             strstr(cmd, "LED:ON") != NULL ||
             strstr(cmd, "led:on") != NULL ||
             strstr(cmd, "LED:HIGH") != NULL ||
             strstr(cmd, "led:high") != NULL ||
             strstr(cmd, "GPIO:HIGH") != NULL ||
             strstr(cmd, "gpio:high") != NULL ||
             strstr(cmd, "GPIO:1") != NULL ||
             strstr(cmd, "gpio:1") != NULL ||
             strstr(cmd, "RELAY:1") != NULL ||
             strcasecmp(cmd, "1") == 0 ||
             strcasecmp(cmd, "ON") == 0 ||
             strcasecmp(cmd, "HIGH") == 0 ||
             strcasecmp(cmd, "START") == 0 ||
             strcasecmp(cmd, "TRIGGER") == 0) {{

        s_blink_enabled = true;
        send_serial_ack("ACK:LED:1\\r\\n");
    }}
    else if (strcasecmp(cmd, "PING") == 0) {{
        send_serial_ack("PONG\\r\\n");
    }}
    else if (strcasecmp(cmd, "STATUS") == 0 || strcasecmp(cmd, "GET:STATE") == 0) {{
        send_serial_ack(s_blink_enabled ? "STATE:1\\r\\n" : "STATE:0\\r\\n");
    }}
}}

static void poll_serial(char *buf, size_t *idx, size_t max_len)
{{
    uint8_t byte = 0;
    while (true) {{
        int read_count = 0;
#if HAS_USB_SERIAL_JTAG
        if (usb_serial_jtag_read_bytes(&byte, 1, 0) > 0) {{
            read_count = 1;
        }} else
#endif
        if (uart_read_bytes(UART_NUM_0, &byte, 1, 0) > 0) {{
            read_count = 1;
        }}
        if (read_count == 0) break;

        char c = (char)byte;
        if (c == '\\r' || c == '\\n') {{
            if (*idx > 0) {{
                buf[*idx] = '\\0';
                apply_command(buf);
                *idx = 0;
            }}
        }} else if (*idx < max_len - 1) {{
            buf[(*idx)++] = c;
            buf[*idx] = '\\0';
            if (strcmp(buf, "LED:0") == 0 || strcmp(buf, "LED:1") == 0 ||
                strcasecmp(buf, "LED:OFF") == 0 || strcasecmp(buf, "LED:ON") == 0) {{
                apply_command(buf);
                *idx = 0;
            }}
        }} else {{
            *idx = 0;
        }}
    }}
}}

void app_main(void)
{{
    gpio_reset_pin(LED_GPIO_STANDARD);
    gpio_set_direction(LED_GPIO_STANDARD, GPIO_MODE_OUTPUT);
    gpio_set_level(LED_GPIO_STANDARD, 0);

    led_strip_config_t strip_config = {{
        .strip_gpio_num = LED_GPIO,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    }};
    led_strip_rmt_config_t rmt_config = {{
        .resolution_hz = 10 * 1000 * 1000,
        .flags.with_dma = false,
    }};
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_config, &rmt_config, &s_strip));
    ESP_ERROR_CHECK(led_strip_clear(s_strip));
    ESP_ERROR_CHECK(led_strip_refresh(s_strip));

#if HAS_USB_SERIAL_JTAG
    usb_serial_jtag_driver_config_t usb_config = {{
        .tx_buffer_size = 1024,
        .rx_buffer_size = 1024,
    }};
    ESP_ERROR_CHECK(usb_serial_jtag_driver_install(&usb_config));
#endif

    uart_config_t uart_config = {{
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_DEFAULT,
    }};
    uart_param_config(UART_NUM_0, &uart_config);
    uart_driver_install(UART_NUM_0, 512, 512, 0, NULL, 0);

    char cmd_buf[COMMAND_BUFFER_SIZE] = {{0}};
    size_t cmd_idx = 0;

    send_serial_ack("BOOT:INNO_IDE_READY\\r\\n");

    while (1)
    {{
        poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));

        if (!s_blink_enabled) {{
            vTaskDelay(pdMS_TO_TICKS(25));
            continue;
        }}

        led_strip_set_pixel(s_strip, 0, LED_COLOR_R, LED_COLOR_G, LED_COLOR_B);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 1);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {{
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }}

        if (!s_blink_enabled) {{
            continue;
        }}

        led_strip_clear(s_strip);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 0);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {{
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }}
    }}
}}
"""

def write_project_files(code, project_dir):
    """Write main/main.c and main/CMakeLists.txt. Preserve existing root CMakeLists.txt."""
    send_event("writing_source", project_dir=project_dir)
    try:
        main_dir = os.path.join(project_dir, "main")
        os.makedirs(main_dir, exist_ok=True)
        
        main_c_path = os.path.join(main_dir, "main.c")
        main_cmake_path = os.path.join(main_dir, "CMakeLists.txt")
        root_cmake_path = os.path.join(project_dir, "CMakeLists.txt")

        # Sanitize Unicode characters (such as \u00a0 / \302 non-breaking spaces) that break GCC C compilers
        sanitized_code = (code or "")
        sanitized_code = sanitized_code.replace("\u00a0", " ").replace("\ufeff", "").replace("\u200b", " ").strip()
        import re
        if sanitized_code.startswith("```"):
            sanitized_code = re.sub(r'^```[a-zA-Z0-9_-]*\r?\n', '', sanitized_code)
        if sanitized_code.endswith("```"):
            sanitized_code = re.sub(r'\r?\n```$', '', sanitized_code)
        if "ESP_RETURN_ON_ERROR" in sanitized_code and "esp_check.h" not in sanitized_code:
            sanitized_code = re.sub(r'#include\s+["<]esp_log\.h[">]', '#include "esp_log.h"\n#include "esp_check.h"', sanitized_code)

        # Ensure reactive Automation & Hardware Rules support is preserved
        processed_code = ensure_reactive_firmware(sanitized_code)
        normalized_code = processed_code.replace("\r\n", "\n")
        with open(main_c_path, "w", encoding="utf-8") as f:
            f.write(normalized_code)
        send_event("log", stream="system", log=f"Updated {main_c_path}")

        # Check if code requires led_strip or other components
        is_led_needed = ("led_strip.h" in normalized_code or "led_strip" in normalized_code)
        requires_components = ["driver"]
        idf_component_path = os.path.join(main_dir, "idf_component.yml")
        if is_led_needed:
            requires_components = ["led_strip", "esp_driver_rmt", "esp_driver_gpio", "driver", "esp_driver_usb_serial_jtag", "esp_driver_uart", "vfs"]
            with open(idf_component_path, "w", encoding="utf-8") as f:
                f.write('dependencies:\n  espressif/led_strip: "^3.0.0"\n')
            send_event("log", stream="system", log=f"Configured {idf_component_path}")
        else:
            if os.path.exists(idf_component_path):
                try:
                    os.remove(idf_component_path)
                except Exception:
                    pass

        # Check if code requires I2S audio components
        if "driver/i2s" in normalized_code or "i2s_std.h" in normalized_code:
            for comp in ["esp_driver_i2s", "driver"]:
                if comp not in requires_components:
                    requires_components.append(comp)

        # Check if code requires UART components
        if "driver/uart.h" in normalized_code:
            if "esp_driver_uart" not in requires_components:
                requires_components.append("esp_driver_uart")

        # Check if code requires Wi-Fi / Networking components
        if "esp_wifi.h" in normalized_code or "esp_wifi" in normalized_code:
            for comp in ["esp_wifi", "esp_netif", "esp_event", "nvs_flash", "lwip", "esp_http_server"]:
                if comp not in requires_components:
                    requires_components.append(comp)

        # Synchronize main/CMakeLists.txt to ALWAYS match the exact required components
        main_cmake_contents = (
            f'idf_component_register(SRCS "main.c"\n'
            f'                    INCLUDE_DIRS "."\n'
            f'                    REQUIRES {" ".join(requires_components)})\n'
        )
        with open(main_cmake_path, "w", encoding="utf-8") as f:
            f.write(main_cmake_contents)
        send_event("log", stream="system", log=f"Configured {main_cmake_path} with: {' '.join(requires_components)}")

        # Preserve existing root CMakeLists.txt if present
        if not os.path.exists(root_cmake_path):
            root_cmake_contents = (
                "cmake_minimum_required(VERSION 3.16)\n"
                "include($ENV{IDF_PATH}/tools/cmake/project.cmake)\n"
                "project(ESP32_Firmware_Project)\n"
            )
            with open(root_cmake_path, "w", encoding="utf-8") as f:
                f.write(root_cmake_contents)
            send_event("log", stream="system", log=f"Created {root_cmake_path}")
        else:
            send_event("log", stream="system", log=f"Preserved existing {root_cmake_path}")

        send_event("source_written")
        return True
    except Exception as e:
        send_event("error", stage="write", message=f"Failed writing project files: {str(e)}")
        return False

# Keywords that indicate an esptool serial connection / reset failure
_SERIAL_FAIL_KEYWORDS = (
    "Write timeout",
    "Failed to get PID",
    "Serial exception error",
    "No serial data received",
    "Failed to connect",
    "Timed out waiting",
)

# Keywords that indicate a chip type mismatch (wrong --chip argument)
_CHIP_MISMATCH_KEYWORDS = (
    "Wrong --chip argument",
    "not ESP32-S3",
    "not ESP32-S2",
    "not ESP32-C3",
    "not ESP32-C2",
    "not ESP32-C6",
    "not ESP32",
)

def _is_chip_mismatch(output_lines):
    """Return True if collected output lines indicate a chip type mismatch."""
    combined = "\n".join(output_lines)
    return any(kw in combined for kw in _CHIP_MISMATCH_KEYWORDS)

def run_idf_command(idf_args, stage_name, stream_name, cwd, collect_output=False):
    """Run an idf.py command and stream lines to stdout via JSON lines.
    
    Args:
        collect_output: if True, also return the accumulated output lines so the
                        caller can inspect them for error patterns.
    Returns:
        bool or (bool, list[str]) depending on collect_output.
    """
    idf_exec = find_idf_py_executable()
    if not idf_exec:
        send_event("error", stage=stage_name, message=describe_idf_lookup_error())
        return (False, []) if collect_output else False

    full_cmd = idf_exec + idf_args
    send_event(stage_name, command=" ".join(full_cmd))
    collected = []
    try:
        process = subprocess.Popen(
            full_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=cwd
        )

        for line in iter(process.stdout.readline, ''):
            if line:
                stripped = line.rstrip()
                send_event(f"{stream_name}_stdout", log=stripped)
                collected.append(stripped)

        process.stdout.close()
        return_code = process.wait()

        if return_code != 0:
            send_event("error", stage=stage_name, message=f"Command '{' '.join(full_cmd)}' failed with exit code {return_code}")
            return (False, collected) if collect_output else False

        send_event(f"{stage_name}_success")
        return (True, collected) if collect_output else True
    except Exception as e:
        send_event("error", stage=stage_name, message=f"Execution error during {stage_name}: {str(e)}")
        return (False, collected) if collect_output else False


def _is_serial_reset_failure(output_lines):
    """Return True if collected output lines indicate an esptool auto-reset failure."""
    combined = "\n".join(output_lines)
    return any(kw in combined for kw in _SERIAL_FAIL_KEYWORDS)


def flash_firmware(port, project_dir, target="auto"):
    """Flash firmware to ESP32 using direct esptool.py (bypassing CMake/ninja).

    Attempt 1: Direct esptool flash at 460800 baud with default_reset (auto-reset).
    Attempt 2: If auto-reset times out, prompt user to hold BOOT + tap EN,
               then flash at 115200 baud with --before no_reset.
    """
    if not port:
        send_event("error", stage="flash", message="No serial port specified for flashing.")
        return False

    # -- Attempt 1: Direct esptool with auto-reset --------------------------
    send_event("log", stream="system",
               log=f"[Flash] Attempt 1/2 - flashing on {port} (460800 baud, auto-reset)...")
    success, output = _flash_with_esptool_direct(
        port, project_dir, target=target, baud="460800", before_reset="default_reset", collect_output=True
    )
    if success:
        return True

    # -- Handle chip mismatch: re-detect and retry --------------------------
    if _is_chip_mismatch(output):
        send_event("log", stream="system", log=(
            f"[Flash] Chip type mismatch detected on {port}. Auto-detecting correct chip..."
        ))
        detected = detect_chip(port)
        if detected and detected != target:
            send_event("log", stream="system", log=(
                f"[Flash] Retrying flash with detected chip type: {detected}"
            ))
            success_retry, output_retry = _flash_with_esptool_direct(
                port, project_dir, target=detected, baud="460800", before_reset="default_reset", collect_output=True
            )
            if success_retry:
                return True
            output = output_retry  # Use retry output for further error handling

    # -- Attempt 2: Direct esptool with manual bootloader mode ---------------
    if _is_serial_reset_failure(output):
        send_event("log", stream="system", log=(
            f"[Flash] Auto-reset failed on {port} (Write timeout / PID error)."
        ))
        send_event("log", stream="system", log="=" * 60)
        send_event("log", stream="system", log="ACTION REQUIRED - Put ESP32 into bootloader mode:")
        send_event("log", stream="system", log="  1. Press and hold the BOOT (IO0) button on your board")
        send_event("log", stream="system", log="  2. While holding BOOT, press and release the EN/RST button")
        send_event("log", stream="system", log="  3. Release the BOOT button")
        send_event("log", stream="system", log="  Board is now in download mode. Retrying in 5 seconds...")
        send_event("log", stream="system", log="=" * 60)

        import time
        for i in range(5, 0, -1):
            send_event("log", stream="system", log=f"  Flashing in {i}...")
            time.sleep(1)

        send_event("log", stream="system", log=(
            f"[Flash] Attempt 2/2 - flashing on {port} (115200 baud, manual bootloader mode)..."
        ))
        success2, _ = _flash_with_esptool_direct(
            port, project_dir, target=target, baud="115200", before_reset="no_reset", collect_output=False
        )
        if success2:
            return True

        send_event("error", stage="flashing", message=(
            f"Flash failed on {port}.\n"
            "Troubleshooting checklist:\n"
            "1. Connect ESP32 using a USB Data Cable (not charge-only).\n"
            "2. In Windows Device Manager, ensure a 'USB Serial Device' appears under Ports.\n"
            "3. Put board in bootloader mode (Hold BOOT, tap EN/RST, release BOOT).\n"
            "4. Ensure no serial monitor or other program is connected to the port."
        ))
        return False

    # Other failure already emitted during attempt 1
    send_event("error", stage="flashing", message=f"Flashing on {port} failed.")
    return False


def _flash_with_esptool_direct(port, project_dir, target="auto", baud="460800", before_reset="default_reset", collect_output=False):
    """Invoke esptool.py directly, bypassing idf.py/cmake entirely.

    This avoids the ESP-IDF 5.5 double-semicolon CMake bug and lets us
    control --before/--after/--baud independently.

    Reads flasher_args.json (generated by `idf.py build`) for accurate
    chip type, flash write arguments, and binary file offsets.
    """
    build_dir = os.path.join(project_dir, "build")

    # -- Locate esptool and the IDF Python interpreter ---------------------
    idf_python = find_idf_python()
    idf_path = get_env("IDF_PATH")
    if not idf_python or not idf_path:
        send_event("error", stage="flashing",
                   message="Cannot locate ESP-IDF Python env for direct esptool invocation.")
        return (False, []) if collect_output else False

    # Prefer the bundled esptool inside ESP-IDF components
    esptool_script = os.path.join(
        idf_path, "components", "esptool_py", "esptool", "esptool.py"
    )
    if not os.path.isfile(esptool_script):
        found = shutil.which("esptool.py")
        esptool_script = found if found else ""
    if not esptool_script:
        send_event("error", stage="flashing", message="esptool.py not found in ESP-IDF or PATH.")
        return (False, []) if collect_output else False

    # -- Build the esptool argument list from flasher_args.json ------------
    flasher_json_path = os.path.join(build_dir, "flasher_args.json")
    # Use flasher_args.json chip if available; fall back to target param; use 'auto' as last resort
    chip = target if target != "auto" else "auto"  # default; overridden by JSON if available
    write_flash_args = []
    file_args = []

    if os.path.isfile(flasher_json_path):
        try:
            with open(flasher_json_path, "r", encoding="utf-8") as fj:
                fdata = json.load(fj)

            chip = fdata.get("target", target)
            write_flash_args = fdata.get("write_flash_args", [])
            flash_files = fdata.get("flash_files", {})

            # Sort by address so binaries are written in order
            for offset, rel_path in sorted(
                flash_files.items(), key=lambda kv: int(kv[0], 16)
            ):
                abs_path = os.path.join(build_dir, rel_path.replace("/", os.sep))
                if os.path.isfile(abs_path):
                    file_args.extend([offset, abs_path])
                else:
                    send_event("log", stream="system",
                               log=f"[Flash] Warning: binary not found at {abs_path}, skipping.")

            send_event("log", stream="system",
                       log=f"[Flash] Configuration: chip={chip}, baud={baud}, reset={before_reset}")
        except Exception as e:
            send_event("log", stream="system",
                       log=f"[Flash] Warning: could not parse flasher_args.json ({e}); falling back to flash_args.")
            flasher_json_path = None
    else:
        flasher_json_path = None

    # Fallback: plain flash_args text file
    if not flasher_json_path or not file_args:
        flash_args_file = os.path.join(build_dir, "flash_args")
        if not os.path.isfile(flash_args_file):
            send_event("error", stage="flashing",
                       message=f"Neither flasher_args.json nor flash_args found in {build_dir}.")
            return (False, []) if collect_output else False
        try:
            with open(flash_args_file, "r", encoding="utf-8") as fa:
                raw = fa.read().split()
            filtered = []
            skip = False
            for tok in raw:
                if skip:
                    skip = False
                    continue
                if tok in ("--before", "--after", "--chip", "--baud", "-b", "-p", "--port"):
                    skip = True
                    continue
                if any(tok.startswith(p) for p in
                       ("--before=", "--after=", "--chip=", "--baud=", "-b=", "-p=", "--port=")):
                    continue
                filtered.append(tok)
            write_flash_args = []
            file_args = filtered
        except Exception as e:
            send_event("error", stage="flashing", message=f"Could not read flash_args: {e}")
            return (False, []) if collect_output else False

    if not file_args:
        send_event("error", stage="flashing",
                   message="No binary files found to flash. Ensure the build completed successfully.")
        return (False, []) if collect_output else False

    # -- Assemble final esptool command ------------------------------------
    cmd = [
        idf_python, esptool_script,
        "--chip", chip,
        "--port", port,
        "--baud", str(baud),
        "--before", before_reset,
        "--after", "hard_reset",
        "write_flash",
    ] + write_flash_args + file_args

    send_event("flashing", command=" ".join(str(a) for a in cmd))
    collected = []

    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=build_dir
        )
        for line in iter(process.stdout.readline, ""):
            if line:
                stripped = line.rstrip()
                send_event("flash_stdout", log=stripped)
                collected.append(stripped)
        process.stdout.close()
        rc = process.wait()
        if rc == 0:
            send_event("flash_success",
                       message="Firmware flashed successfully!")
            return (True, collected) if collect_output else True
        return (False, collected) if collect_output else False
    except Exception as e:
        send_event("log", stream="system", log=f"esptool error: {e}")
        return (False, collected) if collect_output else False

def clean_build_artifacts(project_dir):
    """Remove stale build directory and sdkconfig to avoid target mismatch errors."""
    build_dir = os.path.join(project_dir, "build")
    sdkconfig_path = os.path.join(project_dir, "sdkconfig")
    sdkconfig_old_path = os.path.join(project_dir, "sdkconfig.old")
    
    if os.path.isdir(build_dir):
        try:
            shutil.rmtree(build_dir)
            send_event("log", stream="system", log=f"Removed stale build directory: {build_dir}")
        except Exception as e:
            send_event("log", stream="system", log=f"Warning: Could not remove build dir: {e}")
    
    for cfg in [sdkconfig_path, sdkconfig_old_path]:
        if os.path.isfile(cfg):
            try:
                os.remove(cfg)
                send_event("log", stream="system", log=f"Removed stale config: {cfg}")
            except Exception as e:
                send_event("log", stream="system", log=f"Warning: Could not remove {cfg}: {e}")

def get_current_idf_target(project_dir):
    """Read the IDF_TARGET from the existing sdkconfig, if present."""
    sdkconfig_path = os.path.join(project_dir, "sdkconfig")
    if os.path.isfile(sdkconfig_path):
        try:
            with open(sdkconfig_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("CONFIG_IDF_TARGET="):
                        return line.split("=", 1)[1].strip().strip('"')
        except Exception:
            pass
    return None

def set_target(target, project_dir):
    """Configure target chip using idf.py set-target <target>."""
    if target.lower() not in ALLOWED_TARGETS:
        send_event("error", stage="target", message=f"Unsupported target '{target}'. Allowed targets: {sorted(list(ALLOWED_TARGETS))}")
        return False
    
    current_target = get_current_idf_target(project_dir)
    build_dir = os.path.join(project_dir, "build")

    # If the target is already configured and build directory exists, skip set-target
    if current_target and current_target.lower() == target.lower() and os.path.isdir(build_dir):
        send_event("log", stream="system", log=f"Target is already '{target}'. Reusing existing configuration.")
        return True

    # Target changed or project not yet configured: clean and set target
    if current_target and current_target.lower() != target.lower():
        send_event("log", stream="system", log=f"Target changed from '{current_target}' to '{target}' — cleaning build artifacts first.")
        clean_build_artifacts(project_dir)
    elif not current_target:
        clean_build_artifacts(project_dir)
    
    return run_idf_command(["set-target", target.lower()], "setting_target", "target", project_dir)

def build_firmware(project_dir):
    """Build project using idf.py build."""
    return run_idf_command(["build"], "building", "build", project_dir)


def start_monitor(port, project_dir):
    """Start serial monitor process using idf.py -p PORT monitor."""
    if not port:
        send_event("error", stage="monitor", message="No serial port specified for serial monitor.")
        return False

    idf_exec = find_idf_py_executable()
    if not idf_exec:
        send_event("error", stage="monitor", message="'idf.py' executable not found for serial monitor.")
        return False

    send_event("monitoring", port=port)
    full_cmd = idf_exec + ["-p", port, "monitor"]
    try:
        process = subprocess.Popen(
            full_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=project_dir
        )

        for line in iter(process.stdout.readline, ''):
            if line:
                send_event("monitor_stdout", log=line.rstrip())

        process.stdout.close()
        return_code = process.wait()
        send_event("monitor_stopped", exit_code=return_code)
    except Exception as e:
        send_event("error", stage="monitor", message=f"Serial monitor error: {str(e)}")

def run_pipeline(url, target, port, project_dir, code_file=""):
    """Run full pipeline: fetch/read -> write -> set_target -> build -> flash (and STOP)."""
    # Auto-detect chip from hardware if port is available and target is auto/esp32
    if port and target.lower() in ("auto", "esp32"):
        send_event("log", stream="system", log=f"[Pipeline] Checking connected hardware chip on {port}...")
        detected = detect_chip(port)
        if detected and detected in ALLOWED_TARGETS:
            if target.lower() != detected:
                send_event("log", stream="system", log=f"[Pipeline] Hardware chip on {port} is '{detected}' (overriding '{target}').")
            else:
                send_event("log", stream="system", log=f"[Pipeline] Auto-detected connected chip: {detected}")
            target = detected
        elif target.lower() == "auto":
            current = get_current_idf_target(project_dir)
            target = current if (current and current in ALLOWED_TARGETS) else "esp32s3"
            send_event("log", stream="system", log=f"[Pipeline] Could not auto-detect chip. Using '{target}'.")
    elif target.lower() == "auto":
        current = get_current_idf_target(project_dir)
        target = current if (current and current in ALLOWED_TARGETS) else "esp32s3"
        send_event("log", stream="system", log=f"[Pipeline] Could not auto-detect chip. Using '{target}'.")

    if target.lower() not in ALLOWED_TARGETS:
        send_event("error", stage="validation", message=f"Invalid target '{target}'. Allowed targets: {sorted(list(ALLOWED_TARGETS))}")
        return False

    send_event("pipeline_started", target=target, port=port, url=url)

    code = None
    # 1. Option A: Read from explicit local code_file if specified
    if code_file and os.path.exists(code_file):
        try:
            with open(code_file, "r", encoding="utf-8") as f:
                code = f.read()
            send_event("code_fetched", code_length=len(code), preview=code[:120], source="code_file")
        except Exception as e:
            send_event("error", stage="read_code_file", message=f"Failed reading code file {code_file}: {str(e)}")

    # 1. Option B: Check if main/main.c already exists with content
    main_c_path = os.path.join(project_dir, "main", "main.c")
    if not code and os.path.exists(main_c_path):
        try:
            with open(main_c_path, "r", encoding="utf-8") as f:
                existing_code = f.read()
            if existing_code and existing_code.strip():
                code = existing_code
                send_event("code_fetched", code_length=len(code), preview=code[:120], source="existing_main_c")
        except Exception:
            pass

    # 1. Option C: Fetch from backend URL
    if not code:
        code = fetch_firmware_code(url)

    if not code:
        send_event("error", stage="source", message="No valid firmware C source code available to build.")
        return False

    # 2. Write Source Files
    if not write_project_files(code, project_dir):
        return False

    # 3. Set Target Chip
    if not set_target(target, project_dir):
        return False

    # 4. Build Firmware
    if not build_firmware(project_dir):
        return False

    # 5. Flash Firmware
    if not flash_firmware(port, project_dir, target):
        return False

    # 6. Complete Pipeline
    send_event("pipeline_completed", message="Firmware built and flashed successfully to hardware device!")
    return True

def main():
    parser = argparse.ArgumentParser(description="ESP32 Firmware Flasher Worker")
    parser.add_argument("--action", required=True, choices=["pipeline", "fetch", "write", "set_target", "build", "flash", "monitor", "check_env"], help="Action to execute")
    parser.add_argument("--target", default="auto", help="ESP32 chip target (auto, esp32, esp32s2, esp32s3, esp32c3, esp32c6, etc.)")
    parser.add_argument("--port", default="", help="Serial COM port")
    parser.add_argument("--url", default=DEFAULT_URL, help="Backend API URL for firmware code")
    parser.add_argument("--project-dir", default=os.getcwd(), help="Root directory of ESP-IDF project")
    parser.add_argument("--code-file", default="", help="Path to local C file containing source code to flash")

    args = parser.parse_args()

    target = args.target.lower()
    if target not in ALLOWED_TARGETS_WITH_AUTO:
        send_event("error", stage="validation", message=f"Unsupported target '{target}'. Must be one of: {sorted(list(ALLOWED_TARGETS_WITH_AUTO))}")
        sys.exit(1)

    success = True

    if args.action == "check_env":
        env = check_env(target)
        success = bool(env.get("idf") and env.get("target_supported"))
    elif args.action == "fetch":
        success = fetch_firmware_code(args.url) is not None
    elif args.action == "write":
        code = fetch_firmware_code(args.url)
        if code:
            success = write_project_files(code, args.project_dir)
        else:
            success = False
    elif args.action == "set_target":
        success = set_target(target, args.project_dir)
    elif args.action == "build":
        success = build_firmware(args.project_dir)
    elif args.action == "flash":
        success = flash_firmware(args.port, args.project_dir, target)
    elif args.action == "monitor":
        start_monitor(args.port, args.project_dir)
    elif args.action == "pipeline":
        success = run_pipeline(args.url, target, args.port, args.project_dir, args.code_file)

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
