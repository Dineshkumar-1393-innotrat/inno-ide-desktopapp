// Updated at 2026-05-08 17:55
const getUserInfo = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

import { isElectron } from './platform';

const defaultBackendHost = 'http://localhost:5004';
const baseURL = import.meta.env.VITE_API_BASE_URL || (isElectron ? defaultBackendHost : "");
const productAPIBase = import.meta.env.VITE_PRODUCT_API_BASE_URL || (isElectron ? defaultBackendHost : "/product-api");

export { getUserInfo, baseURL, productAPIBase };
