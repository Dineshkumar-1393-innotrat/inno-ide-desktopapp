#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <string.h>
#include <ctype.h>
// sys/types.h and sys/param.h are intentionally omitted:
// lwIP / ESP-IDF provide their own ssize_t typedef (as long long).
// Including sys/types.h before lwIP headers causes a typedef redefinition error.

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"

#include "esp_system.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_wifi.h"
#include "nvs_flash.h"

#include "driver/gpio.h"
#include "driver/usb_serial_jtag.h"
#include "driver/uart.h"
#include "led_strip.h"

#include "lwip/err.h"
#include "lwip/sockets.h"
#include "lwip/sys.h"
#include "lwip/netdb.h"
#include "esp_http_server.h"

static const char *TAG = "INNO_REACTIVE_NODE";

// =============================================================================
// Wi-Fi Configuration
// You can edit these constants to match your local 2.4 GHz Wi-Fi router.
// If the router cannot be reached after 5 attempts, the ESP32 automatically
// spins up its own SoftAP hotspot ("InnoIDE-ESP32-S3") for direct connection.
// =============================================================================
#define DEFAULT_WIFI_SSID       "innotrat"
#define DEFAULT_WIFI_PASS       "Innovate@91761"
#define FALLBACK_AP_SSID        "InnoIDE-ESP32-S3"
#define FALLBACK_AP_PASS        "12345678"
#define TCP_SERVER_PORT         8888
#define UDP_BEACON_PORT         5056

// Hardware LED Pins for ESP32-S3 DevKit
#define LED_GPIO_WS2812         GPIO_NUM_48
#define LED_GPIO_STANDARD       GPIO_NUM_2
#define LED_COUNT               1

static led_strip_handle_t s_led_strip = NULL;
static volatile int s_led_state = 0; // 0 = OFF (STOPPED), 1 = ON (BLINKING)

// Network state variables
static volatile int s_wifi_connected = 0;
static char s_device_ip[32] = "0.0.0.0";
static char s_wifi_mode[16] = "DISCONNECTED";
static volatile int s_active_client_sock = -1;
static httpd_handle_t s_http_server = NULL;

static void send_serial_response(const char *msg)
{
    // 1. Send over USB-Serial/JTAG (Native USB CDC)
    if (usb_serial_jtag_is_connected()) {
        usb_serial_jtag_write_bytes(msg, strlen(msg), pdMS_TO_TICKS(100));
    }
    // 2. Send over standard UART0 (TX pin)
    uart_write_bytes(UART_NUM_0, msg, strlen(msg));
    printf("%s", msg);
    fflush(stdout);

    // 3. Send over active Wi-Fi TCP socket if connected
    int sock = s_active_client_sock;
    if (sock >= 0) {
        send(sock, msg, strlen(msg), 0);
    }
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
        char resp[96];
        snprintf(resp, sizeof(resp), "STATUS:LED=%d (STATE=%s) IP=%s MODE=%s\r\n",
                 s_led_state, s_led_state ? "ON" : "OFF", s_device_ip, s_wifi_mode);
        send_serial_response(resp);
    }
    // Ping / Heartbeat
    else if (strcmp(clean, "PING") == 0)
    {
        send_serial_response("PONG\r\n");
    }
    // Reboot
    else if (strcmp(clean, "REBOOT") == 0 || strcmp(clean, "RESET") == 0)
    {
        send_serial_response("REBOOTING...\r\n");
        vTaskDelay(pdMS_TO_TICKS(200));
        esp_restart();
    }
    // Wi-Fi Air Scanner
    else if (strcmp(clean, "SCAN") == 0 || strcmp(clean, "WIFI:SCAN") == 0)
    {
        wifi_scan_config_t scan_config = { 0 };
        esp_wifi_scan_start(&scan_config, true);
        uint16_t ap_count = 0;
        esp_wifi_scan_get_ap_num(&ap_count);
        if (ap_count > 0) {
            wifi_ap_record_t *ap_list = malloc(sizeof(wifi_ap_record_t) * ap_count);
            if (ap_list) {
                esp_wifi_scan_get_ap_records(&ap_count, ap_list);
                send_serial_response("--- WIFI NETWORKS DETECTED ---\r\n");
                for (int i = 0; i < ap_count && i < 15; i++) {
                    char scan_buf[96];
                    snprintf(scan_buf, sizeof(scan_buf), "SSID: %-22s RSSI:%d dBm\r\n",
                             (char *)ap_list[i].ssid, ap_list[i].rssi);
                    send_serial_response(scan_buf);
                }
                send_serial_response("--- END SCAN ---\r\n");
                free(ap_list);
            }
        } else {
            send_serial_response("SCAN: No Wi-Fi networks found\r\n");
        }
    }
    else
    {
        char resp[128];
        snprintf(resp, sizeof(resp), "ACK:%s (LED=%d, IP=%s)\r\n", clean, s_led_state, s_device_ip);
        send_serial_response(resp);
    }
}

// =============================================================================
// Embedded HTTP REST Server Handlers
// =============================================================================
static esp_err_t http_action_handler(httpd_req_t *req)
{
    char buf[128] = {0};
    int ret = 0;

    // Check if GET query string provided (?payload=LED:1)
    if (req->method == HTTP_GET) {
        if (httpd_req_get_url_query_str(req, buf, sizeof(buf)) == ESP_OK) {
            char param[64] = {0};
            if (httpd_query_key_value(buf, "payload", param, sizeof(param)) == ESP_OK) {
                process_incoming_command(param);
            } else if (httpd_query_key_value(buf, "cmd", param, sizeof(param)) == ESP_OK) {
                process_incoming_command(param);
            }
        }
    } else if (req->method == HTTP_POST) {
        int total_len = req->content_len;
        if (total_len > 0 && total_len < sizeof(buf)) {
            ret = httpd_req_recv(req, buf, total_len);
            if (ret > 0) {
                buf[ret] = '\0';
                // Look for "payload":"LED:1" in JSON or raw string
                char *p = strstr(buf, "LED:1");
                if (p) {
                    process_incoming_command("LED:1");
                } else if ((p = strstr(buf, "LED:0")) != NULL) {
                    process_incoming_command("LED:0");
                } else {
                    process_incoming_command(buf);
                }
            }
        }
    }

    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    char resp[128];
    snprintf(resp, sizeof(resp), "{\"success\":true,\"led\":%d,\"state\":\"%s\"}",
             s_led_state, s_led_state ? "ON" : "OFF");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

static esp_err_t http_status_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    char resp[160];
    snprintf(resp, sizeof(resp),
             "{\"device\":\"ESP32-S3\",\"ip\":\"%s\",\"mode\":\"%s\",\"led\":%d,\"port\":%d}",
             s_device_ip, s_wifi_mode, s_led_state, TCP_SERVER_PORT);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

static const char INDEX_HTML[] =
    "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>ESP32-S3 Wireless</title><style>"
    "body{font-family:system-ui,-apple-system,sans-serif;background:#0d1117;color:#c9d1d9;text-align:center;padding:20px;margin:0}"
    ".card{background:#161b22;border:1px solid #30363d;border-radius:16px;max-width:380px;margin:auto;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,0.5)}"
    "h2{color:#58a6ff;margin:0 0 12px 0;font-size:22px}"
    ".badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:14px;font-weight:700;margin-bottom:20px}"
    ".on{background:rgba(46,160,67,0.25);color:#3fb950;border:1px solid #2ea043}"
    ".off{background:rgba(248,81,73,0.25);color:#f85149;border:1px solid #da3633}"
    ".btn{display:block;width:100%;padding:16px;margin:12px 0;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:all 0.15s}"
    ".btn:active{transform:scale(0.97)}"
    ".btn-on{background:#238636;color:#fff}"
    ".btn-off{background:#da3633;color:#fff}"
    ".btn-ref{background:#21262d;color:#8b949e;border:1px solid #30363d;font-size:14px;padding:10px}"
    ".info{font-size:12px;color:#8b949e;margin-top:20px;line-height:1.6}"
    "</style></head><body><div class='card'>"
    "<h2>ESP32-S3 Remote</h2>"
    "<div id='st' class='badge off'>LED: OFF</div>"
    "<button class='btn btn-on' onclick='send(\"LED:1\")'>&#x25B6; TURN ON</button>"
    "<button class='btn btn-off' onclick='send(\"LED:0\")'>&#x25A0; TURN OFF</button>"
    "<button class='btn btn-ref' onclick='fetchSt()'>&#x21bb; Refresh</button>"
    "<div class='info' id='inf'>Connecting...</div>"
    "</div><script>"
    "function send(c){fetch('/api/action?payload='+c).then(r=>r.json()).then(d=>update(d)).catch(e=>alert(e));}"
    "function fetchSt(){fetch('/api/status').then(r=>r.json()).then(d=>update(d)).catch(e=>{});}"
    "function update(d){"
    "var s=document.getElementById('st');"
    "var on=d.led==1;"
    "s.innerText=on?'LED: ACTIVE (ON)':'LED: STOPPED (OFF)';"
    "s.className='badge '+(on?'on':'off');"
    "if(d.ip)document.getElementById('inf').innerHTML='Device IP: <b>'+d.ip+'</b><br>Mode: '+d.mode+'<br>TCP Port: '+d.port;"
    "}"
    "fetchSt();"
    "</script></body></html>";

static esp_err_t http_root_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, INDEX_HTML, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

static void start_webserver(void)
{
    if (s_http_server) return;

    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;
    config.ctrl_port = 32768;
    config.max_uri_handlers = 12;

    if (httpd_start(&s_http_server, &config) == ESP_OK) {
        httpd_uri_t root_uri = {
            .uri = "/",
            .method = HTTP_GET,
            .handler = http_root_handler,
            .user_ctx = NULL
        };
        httpd_uri_t index_uri = {
            .uri = "/index.html",
            .method = HTTP_GET,
            .handler = http_root_handler,
            .user_ctx = NULL
        };
        httpd_uri_t apple_uri = {
            .uri = "/hotspot-detect.html",
            .method = HTTP_GET,
            .handler = http_root_handler,
            .user_ctx = NULL
        };
        httpd_uri_t android_uri = {
            .uri = "/generate_204",
            .method = HTTP_GET,
            .handler = http_root_handler,
            .user_ctx = NULL
        };
        httpd_uri_t action_post = {
            .uri = "/api/action",
            .method = HTTP_POST,
            .handler = http_action_handler,
            .user_ctx = NULL
        };
        httpd_uri_t action_get = {
            .uri = "/api/action",
            .method = HTTP_GET,
            .handler = http_action_handler,
            .user_ctx = NULL
        };
        httpd_uri_t status_get = {
            .uri = "/api/status",
            .method = HTTP_GET,
            .handler = http_status_handler,
            .user_ctx = NULL
        };
        httpd_register_uri_handler(s_http_server, &root_uri);
        httpd_register_uri_handler(s_http_server, &index_uri);
        httpd_register_uri_handler(s_http_server, &apple_uri);
        httpd_register_uri_handler(s_http_server, &android_uri);
        httpd_register_uri_handler(s_http_server, &action_post);
        httpd_register_uri_handler(s_http_server, &action_get);
        httpd_register_uri_handler(s_http_server, &status_get);
        ESP_LOGI(TAG, "Embedded HTTP Server listening on port 80 (Web UI & Captive Portal)");
    }
}

// =============================================================================
// TCP Socket Server (Port 8888) - Transparent Wireless Serial Link
// =============================================================================
static void tcp_server_task(void *pvParameters)
{
    char rx_buffer[128];
    int addr_family = AF_INET;
    int ip_protocol = IPPROTO_IP;

    struct sockaddr_in dest_addr;
    dest_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(TCP_SERVER_PORT);

    int listen_sock = socket(addr_family, SOCK_STREAM, ip_protocol);
    if (listen_sock < 0) {
        ESP_LOGE(TAG, "Unable to create TCP socket: errno %d", errno);
        vTaskDelete(NULL);
        return;
    }

    int opt = 1;
    setsockopt(listen_sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    int err = bind(listen_sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr));
    if (err != 0) {
        ESP_LOGE(TAG, "TCP socket bind failed: errno %d", errno);
        close(listen_sock);
        vTaskDelete(NULL);
        return;
    }

    err = listen(listen_sock, 2);
    if (err != 0) {
        ESP_LOGE(TAG, "TCP socket listen error: errno %d", errno);
        close(listen_sock);
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI(TAG, "TCP Wireless Serial Server started on port %d", TCP_SERVER_PORT);

    while (1) {
        struct sockaddr_storage source_addr;
        socklen_t addr_len = sizeof(source_addr);
        int sock = accept(listen_sock, (struct sockaddr *)&source_addr, &addr_len);
        if (sock < 0) {
            ESP_LOGW(TAG, "Unable to accept connection: errno %d", errno);
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }

        s_active_client_sock = sock;
        ESP_LOGI(TAG, "InnoIDE Client connected via TCP Socket!");

        const char *welcome = "READY: InnoIDE Wireless Node Connected\r\n";
        send(sock, welcome, strlen(welcome), 0);

        char line_accum[128];
        int accum_idx = 0;

        while (1) {
            int len = recv(sock, rx_buffer, sizeof(rx_buffer) - 1, 0);
            if (len < 0) {
                ESP_LOGW(TAG, "TCP recv error: errno %d", errno);
                break;
            } else if (len == 0) {
                ESP_LOGI(TAG, "TCP connection closed by client");
                break;
            }

            for (int i = 0; i < len; i++) {
                char c = rx_buffer[i];
                if (c == '\n' || c == '\r') {
                    if (accum_idx > 0) {
                        line_accum[accum_idx] = '\0';
                        process_incoming_command(line_accum);
                        accum_idx = 0;
                    }
                } else if (accum_idx < sizeof(line_accum) - 1) {
                    line_accum[accum_idx++] = c;
                }
            }
        }

        if (s_active_client_sock == sock) {
            s_active_client_sock = -1;
        }
        shutdown(sock, 0);
        close(sock);
    }

    close(listen_sock);
    vTaskDelete(NULL);
}

// =============================================================================
// UDP Discovery Beacon (Port 5056)
// Broadcasts an announcement so InnoIDE discovers this device automatically
// =============================================================================
static void udp_beacon_task(void *pvParameters)
{
    struct sockaddr_in dest_addr;
    dest_addr.sin_addr.s_addr = htonl(INADDR_BROADCAST);
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(UDP_BEACON_PORT);

    int sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_IP);
    if (sock < 0) {
        ESP_LOGE(TAG, "Unable to create UDP broadcast socket: errno %d", errno);
        vTaskDelete(NULL);
        return;
    }

    int broadcast_perm = 1;
    setsockopt(sock, SOL_SOCKET, SO_BROADCAST, &broadcast_perm, sizeof(broadcast_perm));

    while (1) {
        if (s_wifi_connected) {
            char beacon_msg[192];
            snprintf(beacon_msg, sizeof(beacon_msg),
                     "{\"device\":\"ESP32-S3\",\"name\":\"ESP32-S3 Wireless Node\",\"ip\":\"%s\",\"port\":%d,\"mode\":\"%s\",\"led\":%d}",
                     s_device_ip, TCP_SERVER_PORT, s_wifi_mode, s_led_state);

            sendto(sock, beacon_msg, strlen(beacon_msg), 0, (struct sockaddr *)&dest_addr, sizeof(dest_addr));
        }
        vTaskDelay(pdMS_TO_TICKS(3000));
    }

    close(sock);
    vTaskDelete(NULL);
}

// =============================================================================
// Captive Portal DNS Server (UDP Port 53)
// Resolves ALL domain names to 192.168.4.1 for instant mobile detection
// =============================================================================
static void dns_server_task(void *pvParameters)
{
    uint8_t rx_buffer[128];
    struct sockaddr_in dest_addr;
    dest_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(53);

    int sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_IP);
    if (sock < 0) {
        vTaskDelete(NULL);
        return;
    }

    if (bind(sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr)) < 0) {
        close(sock);
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI(TAG, "Captive Portal DNS Server started on UDP port 53");

    while (1) {
        struct sockaddr_storage source_addr;
        socklen_t socklen = sizeof(source_addr);
        int len = recvfrom(sock, rx_buffer, sizeof(rx_buffer), 0, (struct sockaddr *)&source_addr, &socklen);
        if (len > 12) {
            // Standard DNS Query -> Construct Answer pointing to 192.168.4.1
            rx_buffer[2] |= 0x80; // QR = 1 (response)
            rx_buffer[3] |= 0x80; // RA = 1 (recursion available)
            rx_buffer[7] = 1;     // ANCOUNT = 1

            int resp_len = len;
            rx_buffer[resp_len++] = 0xc0; // Name pointer
            rx_buffer[resp_len++] = 0x0c;
            rx_buffer[resp_len++] = 0x00; rx_buffer[resp_len++] = 0x01; // TYPE A
            rx_buffer[resp_len++] = 0x00; rx_buffer[resp_len++] = 0x01; // CLASS IN
            rx_buffer[resp_len++] = 0x00; rx_buffer[resp_len++] = 0x00; // TTL
            rx_buffer[resp_len++] = 0x00; rx_buffer[resp_len++] = 0x3c;
            rx_buffer[resp_len++] = 0x00; rx_buffer[resp_len++] = 0x04; // RDLENGTH = 4
            rx_buffer[resp_len++] = 192;
            rx_buffer[resp_len++] = 168;
            rx_buffer[resp_len++] = 4;
            rx_buffer[resp_len++] = 1;

            sendto(sock, rx_buffer, resp_len, 0, (struct sockaddr *)&source_addr, socklen);
        }
    }
    close(sock);
    vTaskDelete(NULL);
}

// =============================================================================
// Wi-Fi Connection Supervisor
// =============================================================================
static int s_sta_retry_count = 0;
#define MAX_RETRY_ATTEMPTS 4

static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
        ESP_LOGI(TAG, "Attempting connection to router SSID '%s'...", DEFAULT_WIFI_SSID);
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        wifi_event_sta_disconnected_t *disconn = (wifi_event_sta_disconnected_t *)event_data;
        s_wifi_connected = 0;
        int reason = disconn ? disconn->reason : 0;
        if (s_sta_retry_count < MAX_RETRY_ATTEMPTS) {
            s_sta_retry_count++;
            ESP_LOGW(TAG, "STA reconnect attempt %d/%d (reason %d)...", s_sta_retry_count, MAX_RETRY_ATTEMPTS, reason);
            esp_wifi_connect();
        } else {
            ESP_LOGI(TAG, "STA retries halted. SoftAP hotspot is 100%% active at 192.168.4.1");
        }
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        snprintf(s_device_ip, sizeof(s_device_ip), IPSTR, IP2STR(&event->ip_info.ip));
        s_wifi_connected = 1;
        s_sta_retry_count = 0;
        strncpy(s_wifi_mode, "STA+AP_ACTIVE", sizeof(s_wifi_mode));
        ESP_LOGI(TAG, "==================================================");
        ESP_LOGI(TAG, "  Wi-Fi Station Connected! IP: %s", s_device_ip);
        ESP_LOGI(TAG, "  Direct Hotspot IP: 192.168.4.1");
        ESP_LOGI(TAG, "  TCP Port: %d | HTTP Web UI Port: 80", TCP_SERVER_PORT);
        ESP_LOGI(TAG, "==================================================");

        char notify[96];
        snprintf(notify, sizeof(notify), "WIFI:CONNECTED IP=%s PORT=%d\r\n", s_device_ip, TCP_SERVER_PORT);
        send_serial_response(notify);
    }
}

static void wifi_init_system(void)
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    esp_netif_create_default_wifi_sta();
    esp_netif_create_default_wifi_ap();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &wifi_event_handler,
                                                        NULL,
                                                        &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
                                                        IP_EVENT_STA_GOT_IP,
                                                        &wifi_event_handler,
                                                        NULL,
                                                        &instance_got_ip));

    wifi_config_t sta_config = {
        .sta = {
            .ssid = DEFAULT_WIFI_SSID,
            .password = DEFAULT_WIFI_PASS,
            .threshold.authmode = WIFI_AUTH_OPEN,
            .sae_pwe_h2e = WPA3_SAE_PWE_BOTH,
        },
    };

    wifi_config_t ap_config = {
        .ap = {
            .ssid = FALLBACK_AP_SSID,
            .ssid_len = strlen(FALLBACK_AP_SSID),
            .channel = 1,
            .password = FALLBACK_AP_PASS,
            .max_connection = 4,
            .authmode = WIFI_AUTH_WPA2_PSK
        }
    };

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &sta_config));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &ap_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    strncpy(s_device_ip, "192.168.4.1", sizeof(s_device_ip));
    strncpy(s_wifi_mode, "AP_HOTSPOT", sizeof(s_wifi_mode));

    // Immediately launch HTTP server and DNS Captive Portal server
    start_webserver();
    xTaskCreate(dns_server_task, "dns_server", 2560, NULL, 5, NULL);

    // Spin up background network tasks
    xTaskCreate(tcp_server_task, "tcp_server", 4096, NULL, 5, NULL);
    xTaskCreate(udp_beacon_task, "udp_beacon", 2560, NULL, 4, NULL);
}

// =============================================================================
// Application Entry Point
// Dual-Stack: USB CDC + Hardware UART0 + Wi-Fi operate concurrently!
// =============================================================================
void app_main(void)
{
    ESP_LOGI(TAG, "==================================================");
    ESP_LOGI(TAG, "  InnoView Reactive Node Starting up...");
    ESP_LOGI(TAG, "  Channels: USB-CDC + UART0 + Wi-Fi TCP :8888 + HTTP :80");
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

    // 3. Initialize USB-Serial-JTAG driver for direct CDC serial commands (100% UNTOUCHED)
    usb_serial_jtag_driver_config_t usb_config = {
        .rx_buffer_size = 512,
        .tx_buffer_size = 512,
    };
    usb_serial_jtag_driver_install(&usb_config);

    // 4. Initialize UART0 driver for hardware UART serial commands (100% UNTOUCHED)
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

    // 5. Start background LED controller task (100% UNTOUCHED)
    xTaskCreate(led_controller_task, "led_controller", 2048, NULL, 5, NULL);

    // 6. Initialize Wi-Fi and Networking in background
    wifi_init_system();

    send_serial_response("READY: InnoIDE Reactive Firmware Ready (LED=OFF)\r\n");

    char usb_buf[64];
    int usb_idx = 0;
    char uart_buf[64];
    int uart_idx = 0;

    // Continuous poll loop for wired USB CDC & UART0 (100% UNTOUCHED)
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