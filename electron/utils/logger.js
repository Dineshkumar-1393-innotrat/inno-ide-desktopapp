import path from 'path';
import fs from 'fs';
import { app } from 'electron';

class Logger {
  constructor() {
    this.logDir = null;
    this.logFile = null;
  }

  init() {
    try {
      this.logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    } catch (e) {
      console.error('[Logger Init Error]:', e);
    }
  }

  formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  log(level, message, meta) {
    const formatted = this.formatMessage(level, message, meta);
    console.log(formatted.trim());
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, formatted, 'utf8');
      } catch (err) {
        console.error('Failed to write log:', err);
      }
    }
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }
}

export const logger = new Logger();
