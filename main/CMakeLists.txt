idf_component_register(SRCS "main.c"
                    INCLUDE_DIRS "."
                    REQUIRES led_strip esp_driver_rmt esp_driver_gpio driver esp_driver_usb_serial_jtag esp_driver_uart vfs esp_wifi esp_netif esp_event nvs_flash lwip esp_http_server)
