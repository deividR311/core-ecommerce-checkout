/** Dependencias de pruebas */
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

/** La aplicación es zoneless, por lo que el entorno de pruebas se inicializa sin zone.js */
setupZonelessTestEnv();
