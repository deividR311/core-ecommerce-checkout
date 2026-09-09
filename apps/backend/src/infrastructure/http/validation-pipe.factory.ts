/** Dependencias NestJS */
import { ValidationPipe } from '@nestjs/common';

/** Fábricas de excepciones */
import { createValidationException } from './validation-exception.factory';

/**
 * Función que crea el pipe global de validación: rechaza propiedades no declaradas, transforma el cuerpo al DTO y
 * responde con el formato estándar de error
 * @returns {ValidationPipe}
 */
export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: createValidationException,
  });
