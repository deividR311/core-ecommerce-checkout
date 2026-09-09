/** Dependencias Angular */
import { bootstrapApplication } from '@angular/platform-browser';

/** Configuración de la aplicación */
import { appConfig } from './app/app.config';

/** Componentes */
import { AppComponent } from './app/app.component';

/**
 * Función que arranca la aplicación Angular standalone con la configuración global
 * @returns {Promise<void>}
 */
const bootstrap = async (): Promise<void> => {
  try {
    await bootstrapApplication(AppComponent, appConfig);
  } catch (error) {
    console.error('main > bootstrap - error al arrancar la aplicación', (error as Error).message);
  }
};

void bootstrap();
