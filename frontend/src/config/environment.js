export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://alovecino-api-gateway-dev.onrender.com';
export const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 90000);

export function isProduction() {
  return APP_ENV === 'prod';
}

export function isQa() {
  return APP_ENV === 'qa';
}

export function isDevelopment() {
  return APP_ENV === 'dev';
}
