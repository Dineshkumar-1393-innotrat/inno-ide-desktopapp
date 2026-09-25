with open('src/components/ESP32Flasher.jsx', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if any(k in line for k in ['devices.map', 'wizardStep === "devices"', 'wizardStep === \'devices\'', 'isScanning', 'detected']):
            print(f'{i}: {line.strip()[:100]}')
