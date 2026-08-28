import os
import subprocess
import requests

# === CONFIGURATION ===
PROJECT_PATH = os.getcwd()  # Must be inside your ESP-IDF project folder
MAIN_DIR = os.path.join(PROJECT_PATH, "main")
MAIN_C_PATH = os.path.join(MAIN_DIR, "main.c")
MAIN_CMAKE_PATH = os.path.join(MAIN_DIR, "CMakeLists.txt")
ROOT_CMAKE_PATH = os.path.join(PROJECT_PATH, "CMakeLists.txt")
CODE_API_URL = "http://localhost:5010/check-code"

# === STEP 1: Fetch Code from Backend ===
try:
    response = requests.get(CODE_API_URL)
    response.raise_for_status()
    code_json = response.json()
    code = code_json.get("code")

    if not code or code.strip() == "":
        print("❌ Code is empty or null. Aborting flash.")
        exit(1)

    print("✅ Code fetched from backend.")
except Exception as e:
    print(f"❌ Failed to fetch code: {e}")
    exit(1)

# === STEP 2: Write to main.c ===
os.makedirs(MAIN_DIR, exist_ok=True)
with open(MAIN_C_PATH, "w") as f:
    f.write(code.replace('\r\n', '\n'))
print("📁 Code written to main.c")

# === STEP 3: Create main/CMakeLists.txt ===
main_cmake_contents = 'idf_component_register(SRCS "main.c"\n                    INCLUDE_DIRS ".")\n'
with open(MAIN_CMAKE_PATH, "w") as f:
    f.write(main_cmake_contents)
print("🛠️ main/CMakeLists.txt updated")

# === STEP 4: Create root CMakeLists.txt ===
if not os.path.exists(ROOT_CMAKE_PATH):
    root_cmake_contents = """cmake_minimum_required(VERSION 3.16)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(Dht11sensor)
"""
    with open(ROOT_CMAKE_PATH, "w") as f:
        f.write(root_cmake_contents)
    print("🛠️ Root CMakeLists.txt created")
else:
    print("ℹ️ Root CMakeLists.txt already exists")

# === STEP 5: Build and Flash ===
subprocess.run(["idf.py", "set-target", "esp32c6"])
subprocess.run(["idf.py", "build"])
subprocess.run(["idf.py", "flash"])
subprocess.run(["idf.py", "monitor"])

