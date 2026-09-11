const { SerialPort } = require('serialport');

const p = new SerialPort({ path: 'COM9', baudRate: 115200, autoOpen: false });
p.open(err => {
  if (err) {
    console.error('OPEN_ERROR:', err.message);
  } else {
    console.log('SUCCESSFULLY OPENED COM9!');
    p.close(() => console.log('Closed successfully'));
  }
});
