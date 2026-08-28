/**
 * STM32 HAL/LL Libraries
 * Common STM32 libraries for various microcontroller families
 */

export const STM32_LIBRARIES = [
  {
    id: 'stm32-hal',
    name: 'STM32 HAL',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'STM32 Hardware Abstraction Layer',
    category: 'Core',
    includes: ['stm32XXxx_hal.h'],
    examples: []
  },
  {
    id: 'stm32-gpio',
    name: 'STM32 GPIO',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'GPIO (General Purpose Input/Output) control',
    category: 'Signal Input/Output',
    includes: ['stm32XXxx_hal_gpio.h'],
    examples: [
      {
        name: 'GPIO_Blink',
        code: `#include "stm32f4xx_hal.h"

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void) {
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  
  while (1) {
    HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);
    HAL_Delay(1000);
  }
}

static void MX_GPIO_Init(void) {
  GPIO_InitTypeDef GPIO_InitStruct = {0};
  __HAL_RCC_GPIOA_CLK_ENABLE();
  
  GPIO_InitStruct.Pin = GPIO_PIN_5;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
}`
      }
    ]
  },
  {
    id: 'stm32-uart',
    name: 'STM32 UART',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'UART/USART communication',
    category: 'Communication',
    includes: ['stm32XXxx_hal_uart.h'],
    examples: [
      {
        name: 'UART_Transmit',
        code: `#include "stm32f4xx_hal.h"

UART_HandleTypeDef huart2;

void MX_USART2_UART_Init(void) {
  huart2.Instance = USART2;
  huart2.Init.BaudRate = 115200;
  huart2.Init.WordLength = UART_WORDLENGTH_8B;
  huart2.Init.StopBits = UART_STOPBITS_1;
  huart2.Init.Parity = UART_PARITY_NONE;
  huart2.Init.Mode = UART_MODE_TX_RX;
  HAL_UART_Init(&huart2);
}

int main(void) {
  HAL_Init();
  MX_USART2_UART_Init();
  
  char msg[] = "Hello STM32!\\r\\n";
  
  while (1) {
    HAL_UART_Transmit(&huart2, (uint8_t*)msg, strlen(msg), HAL_MAX_DELAY);
    HAL_Delay(1000);
  }
}`
      }
    ]
  },
  {
    id: 'stm32-i2c',
    name: 'STM32 I2C',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'I2C communication',
    category: 'Communication',
    includes: ['stm32XXxx_hal_i2c.h'],
    examples: []
  },
  {
    id: 'stm32-spi',
    name: 'STM32 SPI',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'SPI communication',
    category: 'Communication',
    includes: ['stm32XXxx_hal_spi.h'],
    examples: []
  },
  {
    id: 'stm32-adc',
    name: 'STM32 ADC',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Analog to Digital Converter',
    category: 'Signal Input/Output',
    includes: ['stm32XXxx_hal_adc.h'],
    examples: [
      {
        name: 'ADC_Read',
        code: `#include "stm32f4xx_hal.h"

ADC_HandleTypeDef hadc1;

void MX_ADC1_Init(void) {
  ADC_ChannelConfTypeDef sConfig = {0};
  
  hadc1.Instance = ADC1;
  hadc1.Init.Resolution = ADC_RESOLUTION_12B;
  HAL_ADC_Init(&hadc1);
  
  sConfig.Channel = ADC_CHANNEL_0;
  sConfig.Rank = 1;
  HAL_ADC_ConfigChannel(&hadc1, &sConfig);
}

int main(void) {
  HAL_Init();
  MX_ADC1_Init();
  
  while (1) {
    HAL_ADC_Start(&hadc1);
    HAL_ADC_PollForConversion(&hadc1, HAL_MAX_DELAY);
    uint32_t value = HAL_ADC_GetValue(&hadc1);
    HAL_Delay(100);
  }
}`
      }
    ]
  },
  {
    id: 'stm32-timer',
    name: 'STM32 Timer',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Timer/Counter peripherals',
    category: 'Timing',
    includes: ['stm32XXxx_hal_tim.h'],
    examples: []
  },
  {
    id: 'stm32-pwm',
    name: 'STM32 PWM',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Pulse Width Modulation',
    category: 'Signal Input/Output',
    includes: ['stm32XXxx_hal_tim.h'],
    examples: []
  },
  {
    id: 'stm32-dma',
    name: 'STM32 DMA',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Direct Memory Access',
    category: 'Core',
    includes: ['stm32XXxx_hal_dma.h'],
    examples: []
  },
  {
    id: 'stm32-rtc',
    name: 'STM32 RTC',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Real-Time Clock',
    category: 'Timing',
    includes: ['stm32XXxx_hal_rtc.h'],
    examples: []
  },
  {
    id: 'stm32-can',
    name: 'STM32 CAN',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Controller Area Network',
    category: 'Communication',
    includes: ['stm32XXxx_hal_can.h'],
    examples: []
  },
  {
    id: 'stm32-usb',
    name: 'STM32 USB',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'USB Device/Host',
    category: 'Communication',
    includes: ['stm32XXxx_hal_pcd.h', 'stm32XXxx_hal_hcd.h'],
    examples: []
  },
  {
    id: 'stm32-flash',
    name: 'STM32 Flash',
    version: '1.0.0',
    author: 'STMicroelectronics',
    description: 'Flash memory operations',
    category: 'Data Storage',
    includes: ['stm32XXxx_hal_flash.h'],
    examples: []
  }
];

export const STM32_CATEGORIES = [
  'All',
  'Core',
  'Communication',
  'Signal Input/Output',
  'Timing',
  'Data Storage'
];

export default STM32_LIBRARIES;
