#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "led_strip.h"

// ============================================================
// ESP32-S3 RGB LED Configuration
// ============================================================

// GPIO 48 for ESP32-S3 DevKitC-1
// GPIO 47 for some ESP32-S3 DevKitM-1 boards
#define LED_GPIO GPIO_NUM_48

// Number of RGB LEDs
#define LED_COUNT 1

void app_main(void)
{
    // ========================================================
    // Configure WS2812 RGB LED
    // ========================================================

    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,

        // WS2812 uses GRB color order
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    };

    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000, // 10 MHz
        .flags.with_dma = false,
    };

    led_strip_handle_t strip;

    ESP_ERROR_CHECK(
        led_strip_new_rmt_device(
            &strip_config,
            &rmt_config,
            &strip
        )
    );

    while (1)
    {
        // ====================================================
        // RED
        // GRB = Green:0, Red:255, Blue:0
        // ====================================================
        led_strip_set_pixel(strip, 0, 0, 255, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // GREEN
        // GRB = Green:255, Red:0, Blue:0
        // ====================================================
        led_strip_set_pixel(strip, 0, 255, 0, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // BLUE
        // GRB = Green:0, Red:0, Blue:255
        // ====================================================
        led_strip_set_pixel(strip, 0, 0, 0, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // YELLOW
        // GRB = Green:255, Red:255, Blue:0
        // ====================================================
        led_strip_set_pixel(strip, 0, 255, 255, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // CYAN
        // GRB = Green:255, Red:0, Blue:255
        // ====================================================
        led_strip_set_pixel(strip, 0, 255, 0, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // MAGENTA
        // GRB = Green:0, Red:255, Blue:255
        // ====================================================
        led_strip_set_pixel(strip, 0, 0, 255, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // WHITE
        // GRB = Green:255, Red:255, Blue:255
        // ====================================================
        led_strip_set_pixel(strip, 0, 255, 255, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));

        // ====================================================
        // OFF
        // ====================================================
        led_strip_clear(strip);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(3000));
    }
}