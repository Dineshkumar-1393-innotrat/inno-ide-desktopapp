#include <math.h>
#include <stdint.h>
#include <stddef.h>

#include "freertos/FreeRTOS.h"
#include "driver/i2s_std.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_err.h"

#define I2S_BCLK GPIO_NUM_6
#define I2S_LRC  GPIO_NUM_7
#define I2S_DOUT GPIO_NUM_8
#define AMP_SD   GPIO_NUM_10

#define SAMPLE_RATE       16000
#define VOLUME             10000
#define BEEP_HZ            3000.0f
#define BEEP_DURATION_MS   1000
#define BEEP_GAP_MS         300
#define PAUSE_MS           1000
#define FRAMES_PER_BUFFER   256

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static const char *TAG = "ALERT";
static i2s_chan_handle_t tx = NULL;

static esp_err_t play_tone(float freq, int duration_ms)
{
    static float phase = 0.0f;
    static int16_t buffer[FRAMES_PER_BUFFER * 2];

    if (tx == NULL || duration_ms <= 0 ||
        freq < 0.0f || freq >= SAMPLE_RATE / 2.0f) {
        return ESP_ERR_INVALID_ARG;
    }

    int total_frames = SAMPLE_RATE * duration_ms / 1000;
    float step = 2.0f * (float)M_PI * freq / SAMPLE_RATE;

    while (total_frames > 0) {
        int frames = total_frames > FRAMES_PER_BUFFER
                         ? FRAMES_PER_BUFFER
                         : total_frames;

        for (int i = 0; i < frames; i++) {
            int16_t sample = 0;

            if (freq > 0.0f) {
                sample = (int16_t)(VOLUME * sinf(phase));
                phase += step;

                if (phase >= 2.0f * (float)M_PI) {
                    phase -= 2.0f * (float)M_PI;
                }
            }

            buffer[2 * i] = sample;
            buffer[2 * i + 1] = sample;
        }

        size_t bytes_written = 0;

        esp_err_t err = i2s_channel_write(
            tx,
            buffer,
            (size_t)frames * 2 * sizeof(int16_t),
            &bytes_written,
            portMAX_DELAY
        );

        if (err != ESP_OK) {
            ESP_LOGE(TAG, "I2S write failed: %s",
                     esp_err_to_name(err));
            return err;
        }

        if (bytes_written == 0 ||
            bytes_written % (2 * sizeof(int16_t)) != 0) {
            ESP_LOGE(TAG, "Invalid I2S write length");
            return ESP_FAIL;
        }

        int written_frames =
            (int)(bytes_written / (2 * sizeof(int16_t)));

        total_frames -= written_frames;
    }

    return ESP_OK;
}

static esp_err_t alert_sound(void)
{
    esp_err_t err;

    err = play_tone(BEEP_HZ, BEEP_DURATION_MS);
    if (err != ESP_OK) return err;

    err = play_tone(0.0f, BEEP_GAP_MS);
    if (err != ESP_OK) return err;

    err = play_tone(BEEP_HZ, BEEP_DURATION_MS);
    if (err != ESP_OK) return err;

    err = play_tone(0.0f, BEEP_GAP_MS);
    if (err != ESP_OK) return err;

    return ESP_OK;
}

static esp_err_t speaker_init(void)
{
    gpio_config_t io = {
        .pin_bit_mask = 1ULL << AMP_SD,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };

    esp_err_t err = gpio_config(&io);
    if (err != ESP_OK) return err;

    err = gpio_set_level(AMP_SD, 1);
    if (err != ESP_OK) return err;

    i2s_chan_config_t chan_cfg =
        I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_AUTO, I2S_ROLE_MASTER);

    chan_cfg.auto_clear = true;

    err = i2s_new_channel(&chan_cfg, &tx, NULL);
    if (err != ESP_OK) return err;

    i2s_std_config_t std_cfg = {
        .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(SAMPLE_RATE),
        .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(
            I2S_DATA_BIT_WIDTH_16BIT,
            I2S_SLOT_MODE_STEREO
        ),
        .gpio_cfg = {
            .mclk = I2S_GPIO_UNUSED,
            .bclk = I2S_BCLK,
            .ws = I2S_LRC,
            .dout = I2S_DOUT,
            .din = I2S_GPIO_UNUSED,
            .invert_flags = {
                .mclk_inv = false,
                .bclk_inv = false,
                .ws_inv = false
            }
        }
    };

    err = i2s_channel_init_std_mode(tx, &std_cfg);
    if (err != ESP_OK) return err;

    err = i2s_channel_enable(tx);
    if (err != ESP_OK) return err;

    ESP_LOGI(TAG, "Speaker initialized successfully");
    return ESP_OK;
}

void app_main(void)
{
    ESP_LOGI(TAG, "Starting alert speaker");

    ESP_ERROR_CHECK(speaker_init());

    uint32_t count = 0;

    while (1) {
        ESP_ERROR_CHECK(alert_sound());

        ESP_ERROR_CHECK(play_tone(0.0f, PAUSE_MS));

        ESP_LOGI(TAG, "Alert sound #%lu",
                 (unsigned long)++count);
    }
}