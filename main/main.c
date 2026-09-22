#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_err.h"
#include "esp_log.h"
#include "led_strip.h"

#define LED_GPIO GPIO_NUM_48
#define LED_COUNT 1

void app_main(void)
{
    // WS2812 RGB LED configuration
    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,
        // WS2812 driver handles GRB format internally
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    };

    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000,
        .flags.with_dma = false,
    };

    led_strip_handle_t strip = NULL;

    ESP_ERROR_CHECK(
        led_strip_new_rmt_device(
            &strip_config,
            &rmt_config,
            &strip
        )
    );

    led_strip_clear(strip);

    while (1)
    {
        // 1. RED (red=255, green=0, blue=0)
        led_strip_set_pixel(strip, 0, 255, 0, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 2. GREEN (red=0, green=255, blue=0)
        led_strip_set_pixel(strip, 0, 0, 255, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 3. BLUE (red=0, green=0, blue=255)
        led_strip_set_pixel(strip, 0, 0, 0, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 4. YELLOW (red=255, green=255, blue=0)
        led_strip_set_pixel(strip, 0, 255, 255, 0);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 5. CYAN (red=0, green=255, blue=255)
        led_strip_set_pixel(strip, 0, 0, 255, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 6. MAGENTA (red=255, green=0, blue=255)
        led_strip_set_pixel(strip, 0, 255, 0, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 7. WHITE (red=255, green=255, blue=255)
        led_strip_set_pixel(strip, 0, 255, 255, 255);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));

        // 8. OFF
        led_strip_clear(strip);
        led_strip_refresh(strip);
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}