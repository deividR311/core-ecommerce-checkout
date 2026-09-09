/** Dependencias NestJS */
import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';

/** Enumerables */
import { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';

/** Interfaces */
import type { IHttpErrorResponse } from './http-error-response.interface';

/** Clave con la que class-validator reporta una propiedad no declarada en el DTO */
const WHITELIST_CONSTRAINT_KEY = 'whitelistValidation';

/** Prefijo del mensaje de validación estructural */
const INVALID_PAYLOAD_PREFIX = 'La petición no es válida.';

/**
 * Función que recorre los errores de validación y sus hijos anidados y devuelve los mensajes en español; las
 * propiedades no permitidas se reportan por nombre sin exponer el mensaje en inglés de la librería
 * @param {ValidationError[]} validationErrors - errores reportados por class-validator
 * @returns {string[]}
 */
export const collectValidationMessages = (validationErrors: ValidationError[]): string[] =>
  validationErrors.flatMap(validationError => {
    const constraintMessages = Object.entries(validationError.constraints ?? {}).map(
      ([constraintKey, constraintMessage]) =>
        constraintKey === WHITELIST_CONSTRAINT_KEY
          ? `El campo ${validationError.property} no está permitido.`
          : constraintMessage,
    );
    return [...constraintMessages, ...collectValidationMessages(validationError.children ?? [])];
  });

/**
 * Función que construye la excepción 400 de validación estructural con código y mensaje en español
 * @param {ValidationError[]} validationErrors - errores reportados por class-validator
 * @returns {BadRequestException}
 */
export const createValidationException = (validationErrors: ValidationError[]): BadRequestException => {
  const validationMessages = collectValidationMessages(validationErrors);
  const errorResponse: IHttpErrorResponse = {
    code: ErrorCodeEnum.CHECKOUT_INVALID_PAYLOAD,
    message: [INVALID_PAYLOAD_PREFIX, ...validationMessages].join(' '),
  };
  return new BadRequestException(errorResponse);
};

/**
 * Función que construye la excepción 400 para un identificador de orden sin formato UUID
 * @returns {BadRequestException}
 */
export const createInvalidOrderIdException = (): BadRequestException => {
  const errorResponse: IHttpErrorResponse = {
    code: ErrorCodeEnum.ORDERS_INVALID_ID,
    message: 'El identificador de la orden debe ser un UUID válido.',
  };
  return new BadRequestException(errorResponse);
};
