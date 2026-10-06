#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

#include "driver/gpio.h"
#include "driver/uart.h"
#include "driver/usb_serial_jtag.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "led_strip.h"

// Hardware Pin Definitions
#define LED_GPIO GPIO_NUM_48
#define LED_GPIO_STANDARD GPIO_NUM_2
#define LED_COUNT 1
#define COMMAND_BUFFER_SIZE 64

#define LED_COLOR_R 255
#define LED_COLOR_G 0
#define LED_COLOR_B 255
#define BLINK_DELAY_MS 1000

static led_strip_handle_t s_strip = NULL;
static volatile bool s_blink_enabled = true;

static void send_serial_ack(const char *msg)
{
    size_t len = strlen(msg);
    usb_serial_jtag_write_bytes(msg, len, pdMS_TO_TICKS(50));
    uart_write_bytes(UART_NUM_0, msg, len);
}

static void apply_command(const char *cmd)
{
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
        strcasecmp(cmd, "STOP") == 0) {

        s_blink_enabled = false;
        if (s_strip) {
            led_strip_clear(s_strip);
            led_strip_refresh(s_strip);
        }
        gpio_set_level(LED_GPIO_STANDARD, 0);
        send_serial_ack("ACK:LED:0\r\n");
    }
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
             strcasecmp(cmd, "TRIGGER") == 0) {

        s_blink_enabled = true;
        send_serial_ack("ACK:LED:1\r\n");
    }
    else if (strcasecmp(cmd, "PING") == 0) {
        send_serial_ack("PONG\r\n");
    }
    else if (strcasecmp(cmd, "STATUS") == 0 || strcasecmp(cmd, "GET:STATE") == 0) {
        send_serial_ack(s_blink_enabled ? "STATE:1\r\n" : "STATE:0\r\n");
    }
}

static void poll_serial(char *buf, size_t *idx, size_t max_len)
{
    uint8_t byte = 0;
    while (true) {
        int read_count = 0;
        if (usb_serial_jtag_read_bytes(&byte, 1, 0) > 0) {
            read_count = 1;
        } else if (uart_read_bytes(UART_NUM_0, &byte, 1, 0) > 0) {
            read_count = 1;
        }
        if (read_count == 0) break;

        char c = (char)byte;
        if (c == '\r' || c == '\n') {
            if (*idx > 0) {
                buf[*idx] = '\0';
                apply_command(buf);
                *idx = 0;
            }
        } else if (*idx < max_len - 1) {
            buf[(*idx)++] = c;
            buf[*idx] = '\0';
            if (strcmp(buf, "LED:0") == 0 || strcmp(buf, "LED:1") == 0 ||
                strcasecmp(buf, "LED:OFF") == 0 || strcasecmp(buf, "LED:ON") == 0) {
                apply_command(buf);
                *idx = 0;
            }
        } else {
            *idx = 0;
        }
    }
}

void app_main(void)
{
    gpio_reset_pin(LED_GPIO_STANDARD);
    gpio_set_direction(LED_GPIO_STANDARD, GPIO_MODE_OUTPUT);
    gpio_set_level(LED_GPIO_STANDARD, 0);

    led_strip_config_t strip_config = {
        .strip_gpio_num = LED_GPIO,
        .max_leds = LED_COUNT,
        .led_model = LED_MODEL_WS2812,
        .color_component_format = LED_STRIP_COLOR_COMPONENT_FMT_GRB,
    };
    led_strip_rmt_config_t rmt_config = {
        .resolution_hz = 10 * 1000 * 1000,
        .flags.with_dma = false,
    };
    ESP_ERROR_CHECK(led_strip_new_rmt_device(&strip_config, &rmt_config, &s_strip));
    ESP_ERROR_CHECK(led_strip_clear(s_strip));
    ESP_ERROR_CHECK(led_strip_refresh(s_strip));

    usb_serial_jtag_driver_config_t usb_config = {
        .tx_buffer_size = 1024,
        .rx_buffer_size = 1024,
    };
    ESP_ERROR_CHECK(usb_serial_jtag_driver_install(&usb_config));

    uart_config_t uart_config = {
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_DEFAULT,
    };
    uart_param_config(UART_NUM_0, &uart_config);
    uart_driver_install(UART_NUM_0, 512, 512, 0, NULL, 0);

    char cmd_buf[COMMAND_BUFFER_SIZE] = {0};
    size_t cmd_idx = 0;

    send_serial_ack("BOOT:INNO_IDE_READY\r\n");

    while (1)
    {
        poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));

        if (!s_blink_enabled) {
            vTaskDelay(pdMS_TO_TICKS(25));
            continue;
        }

        led_strip_set_pixel(s_strip, 0, LED_COLOR_R, LED_COLOR_G, LED_COLOR_B);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 1);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }

        if (!s_blink_enabled) {
            continue;
        }

        led_strip_clear(s_strip);
        led_strip_refresh(s_strip);
        gpio_set_level(LED_GPIO_STANDARD, 0);

        for (int elapsed = 0; elapsed < BLINK_DELAY_MS && s_blink_enabled; elapsed += 25) {
            vTaskDelay(pdMS_TO_TICKS(25));
            poll_serial(cmd_buf, &cmd_idx, sizeof(cmd_buf));
        }
    }
}
