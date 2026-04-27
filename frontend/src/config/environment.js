export const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'dev';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-dev.example.com';

export function isProduction() {
  return APP_ENV === 'prod';
}

export function isQa() {
  return APP_ENV === 'qa';
}

export function isDevelopment() {
  return APP_ENV === 'dev';
}