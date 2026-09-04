import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

function configUrl(): string {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return isLocal ? '/config.json' : '/config.production.json';
}

async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch(configUrl(), { cache: 'no-store' });
    if (response.ok) {
      window.__APP_CONFIG__ = await response.json();
    }
  } catch {
    // Fall back to environment defaults.
  }
}

loadRuntimeConfig()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
