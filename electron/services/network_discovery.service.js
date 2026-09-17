import dgram from 'dgram';
import { logger } from '../utils/logger.js';

class NetworkDiscoveryService {
  constructor() {
    this.discoveredDevices = new Map();
    this.udpSocket = null;
    this.port = 5056;
    this.initSocket();
  }

  initSocket() {
    try {
      this.udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      this.udpSocket.on('message', (msg, rinfo) => {
        try {
          const raw = msg.toString('utf8');
          const data = JSON.parse(raw);

          if (data && (data.device === 'ESP32-S3' || data.device === 'ESP32')) {
            const ip = data.ip || rinfo.address;
            const tcpPort = data.port || 8888;
            const key = `TCP:${ip}:${tcpPort}`;

            this.discoveredDevices.set(key, {
              path: key,
              name: data.name || `ESP32-S3 (${ip})`,
              friendlyName: `ESP32-S3 Wireless Node (${ip})`,
              ip,
              port: key,
              tcpPort,
              mode: data.mode || 'STA',
              led: data.led || 0,
              lastSeen: Date.now(),
              isUsb: false,
              isNetwork: true
            });
          }
        } catch { }
      });

      this.udpSocket.on('error', (err) => {
        logger.warn(`Network discovery UDP socket warning:`, err.message);
      });

      this.udpSocket.bind(this.port, () => {
        logger.info(`Network Discovery Service listening on UDP port ${this.port}`);
      });
    } catch (e) {
      logger.warn(`Could not initialize UDP discovery:`, e.message);
    }
  }

  getDevices() {
    const now = Date.now();
    const active = [];
    for (const [key, dev] of this.discoveredDevices.entries()) {
      if (now - dev.lastSeen < 15000) {
        active.push(dev);
      } else {
        this.discoveredDevices.delete(key);
      }
    }
    return active;
  }
}

export const networkDiscoveryService = new NetworkDiscoveryService();
