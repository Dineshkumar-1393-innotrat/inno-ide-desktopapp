const { SerialPort } = require('serialport');

const port = new SerialPort({ path: 'COM9', baudRate: 115200 }, (err) => {
  if (err) {
    console.error('COM9 open error:', err.message);
    process.exit(1);
  }
  console.log('COM9 opened successfully!');

  setTimeout(() => {
    port.write('STATUS\r\n', () => {
      console.log('Sent: STATUS');
    });
  }, 1000);

  setTimeout(() => {
    port.write('LED:1\r\n', () => {
      console.log('Sent: LED:1');
    });
  }, 2500);

  setTimeout(() => {
    port.write('LED:0\r\n', () => {
      console.log('Sent: LED:0');
    });
  }, 4000);

  setTimeout(() => {
    port.close(() => {
      console.log('Test completed.');
      process.exit(0);
    });
  }, 5500);
});

port.on('data', (data) => {
  console.log('[ESP32-S3 RX]:', data.toString('utf8').trim());
});
