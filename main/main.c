#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "led_strip.h"
#include "driver/usb_serial_jtag.h"
#include "driver/uart.h"

static const char *TAG = "INNO_REACTIVE_NODE";

// Hardware LED Pins for ESP32-S3 DevKit
#define LED_GPIO_WS2812   GPIO_NUM_48
#define LED_GPIO_STANDARD GPIO_NUM_2
#define LED_COUNT 1

static led_strip_handle_t s_led_strip = NULL;
static volatile int s_led_state = 0; // 0 = OFF (STOPPED), 1 = ON (BLINKING)

static void send_serial_response(const char *msg)
{
    // Send over USB-Serial/JTAG (Native USB CDC)
    if (usb_serial_jtag_is_connected()) {
        usb_serial_jtag_write_bytes(msg, strlen(msg), pdMS_TO_TICKS(100));
    }
    // Also send over standard UART0 (TX pin)
    uart_write_bytes(UART_NUM_0, msg, strlen(msg));
    printf("%s", msg);
    fflush(stdout);
}

static void apply_led_hardware(int on)
{
    if (s_led_strip) {
        if (on) {
            // Vibrant Cyan-Blue (RGB = 0, 180, 255)
            led_strip_set_pixel(s_led_strip, 0, 0, 180, 255);
            led_strip_refresh(s_led_strip);
        } else {
            // Completely OFF
            led_strip_clear(s_led_strip);
            led_strip_refresh(s_led_strip);
        }
    }
    gpio_set_level(LED_GPIO_STANDARD, on ? 1 : 0);
}

// Background task to blink the LED rhythmically when s_led_state == 1
static void led_controller_task(void *pvParameters)
{
    int blink_phase = 0;

    while (1) {
        if (s_led_state == 1) {
            // Active / Blinking state (350ms ON, 350ms OFF)
            blink_phase = !blink_phase;
            apply_led_hardware(blink_phase);
            vTaskDelay(pdMS_TO_TICKS(350));
        } else {
            // Stopped / Completely OFF
            blink_phase = 0;
            apply_led_hardware(0);
            vTaskDelay(pdMS_TO_TICKS(50));
        }
    }
}

static void set_hardware_led_state(int on)
{
    s_led_state = on ? 1 : 0;
    if (!s_led_state) {
        // Immediate turn-off for snappy response
        apply_led_hardware(0);
    }
    ESP_LOGI(TAG, "Hardware LED state set to: %s", s_led_state ? "BLINKING (ON)" : "STOPPED (OFF)");
}

static void process_incoming_command(const char *raw_cmd)
{
    char clean[64];
    int j = 0;
    for (int i = 0; raw_cmd[i] != '\0' && j < sizeof(clean) - 1; i++) {
        char c = raw_cmd[i];
        if (c != '\r' && c != '\n' && c != ' ' && c != '\t') {
            clean[j++] = toupper((unsigned char)c);
        }
    }
    clean[j] = '\0';

    if (strlen(clean) == 0) return;

    ESP_LOGI(TAG, "Received command: '%s'", clean);

    // Turn ON commands: LED:1, 1, ON, BLINK:1, HIGH, TRUE
    if (strcmp(clean, "LED:1") == 0 ||
        strcmp(clean, "1") == 0 ||
        strcmp(clean, "ON") == 0 ||
        strcmp(clean, "BLINK:1") == 0 ||
        strcmp(clean, "HIGH") == 0 ||
        strcmp(clean, "TRUE") == 0 ||
        strstr(clean, "LED:1") != NULL)
    {
        set_hardware_led_state(1);
        send_serial_response("[HARDWARE] LED BLINKING (ON)\r\nOK:1\r\n");
    }
    // Turn OFF commands: LED:0, 0, OFF, BLINK:0, LOW, FALSE
    else if (strcmp(clean, "LED:0") == 0 ||
             strcmp(clean, "0") == 0 ||
             strcmp(clean, "OFF") == 0 ||
             strcmp(clean, "BLINK:0") == 0 ||
             strcmp(clean, "LOW") == 0 ||
             strcmp(clean, "FALSE") == 0 ||
             strstr(clean, "LED:0") != NULL)
    {
        set_hardware_led_state(0);
        send_serial_response("[HARDWARE] LED STOPPED (OFF)\r\nOK:0\r\n");
    }
    // Status Query
    else if (strcmp(clean, "STATUS") == 0 || strcmp(clean, "GET") == 0)
    {
        char resp[64];
        snprintf(resp, sizeof(resp), "STATUS:LED=%d (STATE=%s)\r\n", s_led_state, s_led_state ? "ON" : "OFF");
        send_serial_response(resp);
    }
    // Ping / Heartbeat
    else if (strcmp(clean, "PING") == 0)
    {
        send_serial_response("PONG\r\n");
    }
    else
    {
        char resp[128];
        snprintf(resp, sizeof(resp), "ACK:%s (LED=%d)\r\n", clean, s_led_state);
        send_serial_response(resp);
    }
}

void app_main(void)
{
    ESP_LOGI(TAG, "==================================================");
    ESP_LOGI(TAG, "  InnoView Reactive Node Starting up...");
    ESP_LOGI(TAG, "  Supports: USB-Serial/JTAG CDC + UART0 + WS2812");
    ESP_LOGI(TAG, "==================================================");

    // 1. Initialize Standard GPIO 2 Output
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << LED_GPIO_STANDARD),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    gpio_config(&io_conf);
    gpio_set_level(LED_GPIO_STANDARD, 0);

    // 2. Initialize WS2812 RGB LED Strip on GPIO 48
    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO_WS2812,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    };
    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000,
        .flags.with_dma = false,
    };
    esp_err_t err = led_strip_new_rmt_device(&strip_config, &rmt_config, &s_led_strip);
    if (err != ESP_OK) {
        ESP_LOGW(TAG, "WS2812 init warning: %s. Standard GPIO will still function.", esp_err_to_name(err));
        s_led_strip = NULL;
    }

    // Explicitly ensure LED starts completely OFF on boot
    set_hardware_led_state(0);

    // 3. Initialize USB-Serial-JTAG driver for direct CDC serial commands
    usb_serial_jtag_driver_config_t usb_config = {
        .rx_buffer_size = 512,
        .tx_buffer_size = 512,
    };
    usb_serial_jtag_driver_install(&usb_config);

    // 4. Initialize UART0 driver for hardware UART serial commands
    uart_config_t uart_config = {
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_DEFAULT,
    };
    uart_driver_install(UART_NUM_0, 512, 512, 0, NULL, 0);
    uart_param_config(UART_NUM_0, &uart_config);

    // 5. Start background LED controller task
    xTaskCreate(led_controller_task, "led_controller", 2048, NULL, 5, NULL);

    send_serial_response("READY: InnoIDE Reactive Firmware Ready (LED=OFF)\r\n");

    char usb_buf[64];
    int usb_idx = 0;
    char uart_buf[64];
    int uart_idx = 0;

    while (1)
    {
        // Check USB-Serial/JTAG stream
        uint8_t byte_in = 0;
        int n_usb = usb_serial_jtag_read_bytes(&byte_in, 1, 0);
        if (n_usb > 0) {
            if (byte_in == '\n' || byte_in == '\r') {
                if (usb_idx > 0) {
                    usb_buf[usb_idx] = '\0';
                    process_incoming_command(usb_buf);
                    usb_idx = 0;
                }
            } else if (usb_idx < sizeof(usb_buf) - 1) {
                usb_buf[usb_idx++] = (char)byte_in;
            }
        }

        // Check UART0 stream
        int n_uart = uart_read_bytes(UART_NUM_0, &byte_in, 1, 0);
        if (n_uart > 0) {
            if (byte_in == '\n' || byte_in == '\r') {
                if (uart_idx > 0) {
                    uart_buf[uart_idx] = '\0';
                    process_incoming_command(uart_buf);
                    uart_idx = 0;
                }
            } else if (uart_idx < sizeof(uart_buf) - 1) {
                uart_buf[uart_idx++] = (char)byte_in;
            }
        }

        vTaskDelay(pdMS_TO_TICKS(10));
    }
}