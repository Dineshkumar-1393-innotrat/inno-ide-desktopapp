import { Menu } from 'electron';
import { logger } from './utils/logger.js';

export function setupApplicationMenu(getMainWindow) {
  Menu.setApplicationMenu(null);
  logger.info('Native application menu disabled.');
}
