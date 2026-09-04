export interface AppRuntimeConfig {
  apiUrl: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig;
  }
}

export const environment = {
  production: true,
  get apiUrl(): string {
    return window.__APP_CONFIG__?.apiUrl || '/api';
  },
};
