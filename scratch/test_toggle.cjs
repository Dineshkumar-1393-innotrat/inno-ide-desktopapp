const { SerialPort } = require('serialport');

async function testToggle() {
  console.log('Connecting to COM9 at 115200 baud...');
  const port = new SerialPort({ path: 'COM9', baudRate: 115200 });

  port.on('data', (data) => {
    console.log('[ESP32-S3 RX]:', data.toString('utf-8').trim());
  });

  await new Promise((resolve) => port.on('open', resolve));
  console.log('Port COM9 opened!');

  // Wait 1.5s for boot banner
  await new Promise((r) => setTimeout(r, 1500));

  console.log('Sending: LED:0 (Turning LED OFF)...');
  port.write('LED:0\r\n');
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Sending: LED:1 (Turning LED ON / Blinking)...');
  port.write('LED:1\r\n');
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Sending: LED:0 (Turning LED OFF again)...');
  port.write('LED:0\r\n');
  await new Promise((r) => setTimeout(r, 1500));

  port.close(() => {
    console.log('Port closed cleanly. Test finished.');
  });
}

testToggle().catch(console.error);
