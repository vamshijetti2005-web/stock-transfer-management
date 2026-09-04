export interface AppRuntimeConfig {
  apiUrl: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig;
  }
}

export const environment = {
  production: false,
  get apiUrl(): string {
    return window.__APP_CONFIG__?.apiUrl || 'http://localhost:5000/api';
  },
};
