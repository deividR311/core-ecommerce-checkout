/** Dependencias NestJS */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/** Módulos */
import { AppModule } from './app.module';

/** Valores por defecto de desarrollo cuando no hay variables de entorno */
const DEFAULT_PORT = 3000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:4200';
const ENV_FILE_NAME = '.env';
const CORS_WILDCARD = '*';

/**
 * Función que carga el archivo .env con la API nativa de Node; si no existe conserva las variables ya presentes
 * @param {Logger} logger - logger de arranque
 * @returns {void}
 */
const loadEnvironmentFile = (logger: Logger): void => {
  try {
    process.loadEnvFile(ENV_FILE_NAME);
  } catch (error) {
    logger.warn(
      `main > loadEnvironmentFile - no se pudo leer ${ENV_FILE_NAME}; se usan valores por defecto de desarrollo. ${(error as Error).message}`,
    );
  }
};

/**
 * Función que resuelve el origen permitido para CORS; rechaza el comodín y aplica el origen de desarrollo si falta
 * @param {Logger} logger - logger de arranque
 * @returns {string}
 */
const resolveCorsOrigin = (logger: Logger): string => {
  const configuredOrigin = process.env.CORS_ORIGIN?.trim();
  if (!configuredOrigin || configuredOrigin === CORS_WILDCARD) {
    logger.warn(`main > resolveCorsOrigin - CORS_ORIGIN ausente o con comodín; se usa ${DEFAULT_CORS_ORIGIN}`);
    return DEFAULT_CORS_ORIGIN;
  }
  return configuredOrigin;
};

/**
 * Función que arranca la aplicación NestJS con CORS restringido al origen del frontend
 * @returns {Promise<void>}
 */
const bootstrap = async (): Promise<void> => {
  const logger = new Logger('Bootstrap');
  loadEnvironmentFile(logger);
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const corsOrigin = resolveCorsOrigin(logger);
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: corsOrigin });
  await app.listen(port);
  logger.log(`main > bootstrap - servicio escuchando en el puerto ${port} con CORS para ${corsOrigin}`);
};

void bootstrap();
