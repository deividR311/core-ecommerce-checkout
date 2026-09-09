/** Dependencias Angular */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

/** Rutas */
import { routes } from './app.routes';

/** Configuración global de la aplicación standalone */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
