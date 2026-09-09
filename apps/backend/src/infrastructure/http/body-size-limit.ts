/** Dependencias NestJS */
import type { NestExpressApplication } from '@nestjs/platform-express';

/** Tamaño máximo del cuerpo JSON aceptado (decisión cerrada en CLAUDE.md §8) */
export const BODY_SIZE_LIMIT = '100kb';

/**
 * Función que registra el parser JSON con el límite de tamaño acordado; la aplicación debe crearse con
 * bodyParser: false para que este sea el único parser activo. La reutilizan main.ts y las pruebas e2e
 * @param {NestExpressApplication} app - aplicación Express de Nest ya creada
 * @returns {void}
 */
export const applyBodySizeLimit = (app: NestExpressApplication): void => {
  app.useBodyParser('json', { limit: BODY_SIZE_LIMIT });
};
