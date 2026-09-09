/** Dependencias NestJS */
import { BadRequestException, HttpStatus } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';

/** Fábricas bajo prueba */
import {
  collectValidationMessages,
  createInvalidOrderIdException,
  createValidationException,
} from './validation-exception.factory';

/** Enumerables */
import { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';

/** Interfaces */
import type { IHttpErrorResponse } from './http-error-response.interface';

/** Error plano reportado sobre el arreglo de ítems */
const emptyCartValidationError: ValidationError = {
  property: 'items',
  constraints: { arrayMinSize: 'El carrito debe tener al menos un ítem.' },
  children: [],
};

/** Error anidado: el primer ítem trae un precio no permitido y una cantidad inválida */
const nestedValidationError: ValidationError = {
  property: 'items',
  children: [
    {
      property: '0',
      children: [
        { property: 'unitPrice', constraints: { whitelistValidation: 'property unitPrice should not exist' } },
        { property: 'quantity', constraints: { isInt: 'El campo quantity debe ser un número entero.' } },
      ],
    },
  ],
};

describe('validationExceptionFactory: construcción de excepciones 400 con formato estándar', () => {
  it('debería devolver el mensaje del decorador cuando el error es plano', () => {
    expect(collectValidationMessages([emptyCartValidationError])).toEqual(['El carrito debe tener al menos un ítem.']);
  });

  it('debería recorrer los hijos y traducir la propiedad no permitida cuando el error es anidado', () => {
    expect(collectValidationMessages([nestedValidationError])).toEqual([
      'El campo unitPrice no está permitido.',
      'El campo quantity debe ser un número entero.',
    ]);
  });

  it('debería devolver una lista vacía cuando el error no trae restricciones ni hijos', () => {
    expect(collectValidationMessages([{ property: 'items' }])).toEqual([]);
  });

  it('debería construir una BadRequestException con el código de payload inválido y todos los mensajes cuando hay errores de validación', () => {
    const validationException = createValidationException([emptyCartValidationError, nestedValidationError]);
    expect(validationException).toBeInstanceOf(BadRequestException);
    expect(validationException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    const errorResponse = validationException.getResponse() as IHttpErrorResponse;
    expect(errorResponse.code).toBe(ErrorCodeEnum.CHECKOUT_INVALID_PAYLOAD);
    expect(errorResponse.message).toBe(
      'La petición no es válida. El carrito debe tener al menos un ítem. El campo unitPrice no está permitido. El campo quantity debe ser un número entero.',
    );
  });

  it('debería construir una BadRequestException con el código de identificador inválido cuando el id de la orden no es UUID', () => {
    const invalidOrderIdException = createInvalidOrderIdException();
    expect(invalidOrderIdException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(invalidOrderIdException.getResponse()).toEqual({
      code: ErrorCodeEnum.ORDERS_INVALID_ID,
      message: 'El identificador de la orden debe ser un UUID válido.',
    });
  });
});
