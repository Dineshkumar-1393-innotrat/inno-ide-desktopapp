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

def find_idf_py_executable():
    """Locate idf.py executable or Python script."""
    global last_idf_lookup_error
    last_idf_lookup_error = ""

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

def write_project_files(code, project_dir):
    """Write main/main.c and main/CMakeLists.txt. Preserve existing root CMakeLists.txt."""
    send_event("writing_source", project_dir=project_dir)
    try:
        main_dir = os.path.join(project_dir, "main")
        os.makedirs(main_dir, exist_ok=True)
        
        main_c_path = os.path.join(main_dir, "main.c")
        main_cmake_path = os.path.join(main_dir, "CMakeLists.txt")
        root_cmake_path = os.path.join(project_dir, "CMakeLists.txt")

        # Write main.c
        normalized_code = code.replace("\r\n", "\n")
        with open(main_c_path, "w", encoding="utf-8") as f:
            f.write(normalized_code)
        send_event("log", stream="system", log=f"Updated {main_c_path}")

        # Check if code requires led_strip or other components
        requires_components = ["esp_driver_rmt", "esp_driver_gpio", "driver", "esp_driver_usb_serial_jtag", "esp_driver_uart", "vfs"]
        idf_component_path = os.path.join(main_dir, "idf_component.yml")
        if "led_strip.h" in normalized_code or "led_strip" in normalized_code:
            if "led_strip" not in requires_components:
                requires_components.insert(0, "led_strip")
            if not os.path.exists(idf_component_path):
                with open(idf_component_path, "w", encoding="utf-8") as f:
                    f.write('dependencies:\n  espressif/led_strip: "^3.0.0"\n')
                send_event("log", stream="system", log=f"Created {idf_component_path}")

        # Write main/CMakeLists.txt
        main_cmake_contents = (
            f'idf_component_register(SRCS "main.c"\n'
            f'                    INCLUDE_DIRS "."\n'
            f'                    REQUIRES {" ".join(requires_components)})\n'
        )
        with open(main_cmake_path, "w", encoding="utf-8") as f:
            f.write(main_cmake_contents)
        send_event("log", stream="system", log=f"Updated {main_cmake_path}")

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
    # Auto-detect chip from hardware if target is 'auto'
    if target.lower() == "auto":
        send_event("log", stream="system", log="[Pipeline] Target set to 'auto'. Detecting connected chip...")
        detected = detect_chip(port)
        if detected and detected in ALLOWED_TARGETS:
            send_event("log", stream="system", log=f"[Pipeline] Auto-detected chip: {detected}")
            target = detected
        else:
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
