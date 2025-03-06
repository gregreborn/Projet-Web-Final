import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ Ensure HTTP client is provided

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      ...routes,
      { path: '**', redirectTo: '/home' }
    ], withHashLocation()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(), // ✅ Ensure HttpClient is provided
  ]
};
