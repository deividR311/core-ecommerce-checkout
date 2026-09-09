/** Dependencias NestJS */
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

/** Módulos */
import { AppModule } from '../src/app.module';

/** HTTP */
import { applyBodySizeLimit } from '../src/infrastructure/http/body-size-limit';

/** Identificadores de la semilla de productos usados por las pruebas e2e */
export const LAPTOP_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
export const HEADPHONES_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
export const COFFEE_MAKER_ID = '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e';
export const DESK_LAMP_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

/** UUID v4 con formato válido que no existe en ningún repositorio */
export const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

/**
 * Función que levanta la aplicación real con el mismo parser de cuerpo limitado que usa main.ts
 * @returns {Promise<NestExpressApplication>}
 */
export const createTestingApp = async (): Promise<NestExpressApplication> => {
  const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = testingModule.createNestApplication<NestExpressApplication>({ bodyParser: false });
  applyBodySizeLimit(app);
  await app.init();
  return app;
};
