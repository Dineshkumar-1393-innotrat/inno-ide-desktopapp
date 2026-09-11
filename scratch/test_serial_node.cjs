const { SerialPort } = require('serialport');

const port = new SerialPort({
  path: 'COM9',
  baudRate: 115200,
  autoOpen: false
});

port.open((err) => {
  if (err) {
    console.error('Failed to open COM9:', err.message);
    process.exit(1);
  }
  console.log('Successfully opened COM9!');

  port.on('data', (data) => {
    console.log('[RX FROM ESP32]:', data.toString());
  });

  // After 1 second, send LED:1
  setTimeout(() => {
    console.log('\n--> SENDING: LED:1\\r\\n');
    port.write('LED:1\r\n', (err) => {
      if (err) console.error('Write error:', err.message);
      port.drain(() => console.log('--> Drained LED:1'));
    });
  }, 1500);

  // After 3.5 seconds, send LED:0
  setTimeout(() => {
    console.log('\n--> SENDING: LED:0\\r\\n');
    port.write('LED:0\r\n', (err) => {
      if (err) console.error('Write error:', err.message);
      port.drain(() => console.log('--> Drained LED:0'));
    });
  }, 4000);

  // Close after 6 seconds
  setTimeout(() => {
    console.log('\nClosing port...');
    port.close(() => {
      console.log('Port closed cleanly. Test passed!');
      process.exit(0);
    });
  }, 6500);
});
