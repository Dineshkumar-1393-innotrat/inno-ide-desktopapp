import './env';
import { isElectron } from '../platform';

const defaultMainHost = 'http://localhost:5004';
const defaultAdminHost = 'http://localhost:5010';

export const API = {
  MAIN: import.meta.env.VITE_API_BASE_URL || (isElectron ? defaultMainHost : ''),
  ADMIN: import.meta.env.VITE_ADMIN_API_BASE_URL || (isElectron ? defaultAdminHost : ''),
  FLASHER: 'http://localhost:5010',
  GITHUB: import.meta.env.VITE_GITHUB_API_BASE_URL || 'https://api.github.com',
  CLOUDINARY: import.meta.env.VITE_CLOUDINARY_URL || '',
};
