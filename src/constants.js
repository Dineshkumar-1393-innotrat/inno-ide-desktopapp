// export const LANGUAGE_VERSIONS = {
//     C11: "(ISO/IEC 9899:2011)",
//     C17: "(ISO/IEC 9899:2018)",
//    C18:"(ISO/IEC 9899:2018)"
// }


// export const CODE_SNIPPETS = {
// C: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, InnoPioneers!\\n");\n\treturn 0;\n}\n`,
// C11: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, InnoPioneers!\\n");\n\treturn 0;\n}\n`,
// C17: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, InnoPioneers!\\n");\n\treturn 0;\n}\n`,
// C18: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, InnoPioneers!\\n");\n\treturn 0;\n}\n`

// }

export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
  c: "10.2.0",
  arduino: "10.2.0",  // Arduino uses GCC, same as C
  esp32: "10.2.0",    // ESP32 uses GCC, same as C
};

// Map custom language names to Monaco Editor language IDs
export const MONACO_LANGUAGE_MAP = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  php: "php",
  c: "c",
  arduino: "cpp", // Arduino uses C++ syntax
  esp32: "cpp",   // ESP32 uses C++ syntax
};

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  csharp:
    'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",
  // c: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n`, 
  c: `#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "esp_log.h"\n#include "led_strip.h"\n#include "driver/usb_serial_jtag.h"\n#include "driver/uart.h"\n\nstatic const char *TAG = "INNO_REACTIVE_NODE";\n#define LED_GPIO_WS2812   GPIO_NUM_48\n#define LED_GPIO_STANDARD GPIO_NUM_2\n#define LED_COUNT 1\n\nstatic led_strip_handle_t s_led_strip = NULL;\nstatic volatile int s_led_state = 0;\n\nstatic void apply_led_hardware(int on) {\n    if (s_led_strip) {\n        if (on) {\n            led_strip_set_pixel(s_led_strip, 0, 0, 180, 255);\n            led_strip_refresh(s_led_strip);\n        } else {\n            led_strip_clear(s_led_strip);\n            led_strip_refresh(s_led_strip);\n        }\n    }\n    gpio_set_level(LED_GPIO_STANDARD, on ? 1 : 0);\n}\n\nstatic void led_controller_task(void *pvParameters) {\n    int phase = 0;\n    while (1) {\n        if (s_led_state == 1) {\n            phase = !phase;\n            apply_led_hardware(phase);\n            vTaskDelay(pdMS_TO_TICKS(350));\n        } else {\n            phase = 0;\n            apply_led_hardware(0);\n            vTaskDelay(pdMS_TO_TICKS(50));\n        }\n    }\n}\n\nstatic void process_cmd(const char *cmd) {\n    if (strstr(cmd, "LED:1") || strstr(cmd, "ON") || strcmp(cmd, "1") == 0) {\n        s_led_state = 1;\n    } else if (strstr(cmd, "LED:0") || strstr(cmd, "OFF") || strcmp(cmd, "0") == 0) {\n        s_led_state = 0;\n        apply_led_hardware(0);\n    }\n}\n\nvoid app_main(void) {\n    gpio_reset_pin(LED_GPIO_STANDARD);\n    gpio_set_direction(LED_GPIO_STANDARD, GPIO_MODE_OUTPUT);\n    gpio_set_level(LED_GPIO_STANDARD, 0);\n\n    led_strip_config_t strip_cfg = { .strip_gpio_num = LED_GPIO_WS2812, .max_leds = LED_COUNT, .led_model = LED_MODEL_WS2812, .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB };\n    led_strip_rmt_config_t rmt_cfg = { .resolution_hz = 10 * 1000 * 1000, .flags.with_dma = false };\n    led_strip_new_rmt_device(&strip_cfg, &rmt_cfg, &s_led_strip);\n    apply_led_hardware(0);\n\n    usb_serial_jtag_driver_config_t usb_cfg = { .rx_buffer_size = 512, .tx_buffer_size = 512 };\n    usb_serial_jtag_driver_install(&usb_cfg);\n    uart_config_t uart_cfg = { .baud_rate = 115200, .data_bits = UART_DATA_8_BITS, .parity = UART_PARITY_DISABLE, .stop_bits = UART_STOP_BITS_1, .flow_ctrl = UART_HW_FLOWCTRL_DISABLE, .source_clk = UART_SCLK_DEFAULT };\n    uart_driver_install(UART_NUM_0, 512, 512, 0, NULL, 0);\n    uart_param_config(UART_NUM_0, &uart_cfg);\n\n    xTaskCreate(led_controller_task, "led_controller", 2048, NULL, 5, NULL);\n\n    char buf[64]; int idx = 0;\n    while (1) {\n        uint8_t b = 0;\n        if (usb_serial_jtag_read_bytes(&b, 1, 0) > 0 || uart_read_bytes(UART_NUM_0, &b, 1, 0) > 0) {\n            if (b == '\\n' || b == '\\r') {\n                if (idx > 0) { buf[idx] = '\\0'; process_cmd(buf); idx = 0; }\n            } else if (idx < sizeof(buf) - 1) { buf[idx++] = (char)b; }\n        }\n        vTaskDelay(pdMS_TO_TICKS(10));\n    }\n}\n`,
  arduino: `#include <Arduino.h>\n\n// LED Blink Example for Arduino\n// Define the LED pin (built-in LED on most Arduino boards is pin 13)\nconst int ledPin = 13;\n\nvoid setup() {\n\t// Initialize the digital pin as an output\n\tpinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n\tdigitalWrite(ledPin, HIGH);   // Turn the LED on\n\tdelay(1000);                  // Wait for 1 second\n\tdigitalWrite(ledPin, LOW);    // Turn the LED off\n\tdelay(1000);                  // Wait for 1 second\n}\n`,
  esp32: `#include <Arduino.h>\n\n// LED Blink Example for ESP32\n// Define the LED pin (built-in LED on most ESP32 boards is GPIO 2)\nconst int ledPin = 2;\n\nvoid setup() {\n\t// Initialize the digital pin as an output\n\tpinMode(ledPin, OUTPUT);\n\tSerial.begin(115200);\n\tSerial.println("ESP32 LED Blink Started");\n}\n\nvoid loop() {\n\tdigitalWrite(ledPin, HIGH);   // Turn the LED on\n\tSerial.println("LED ON");\n\tdelay(1000);                  // Wait for 1 second\n\tdigitalWrite(ledPin, LOW);    // Turn the LED off\n\tSerial.println("LED OFF");\n\tdelay(1000);                  // Wait for 1 second\n}\n`,
};




