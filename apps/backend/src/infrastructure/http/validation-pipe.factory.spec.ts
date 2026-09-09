/** Dependencias NestJS */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ArgumentMetadata } from '@nestjs/common';

/** Fábrica bajo prueba */
import { createValidationPipe } from './validation-pipe.factory';

/** Enumerables */
import { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';

/** DTOs */
import { CheckoutRequestDto } from '../../presentation/dto/checkout-request.dto';

/** Interfaces */
import type { IHttpErrorResponse } from './http-error-response.interface';

/** Metadatos con los que Nest invoca el pipe para el cuerpo de checkout */
const bodyMetadata: ArgumentMetadata = { type: 'body', metatype: CheckoutRequestDto };

/** Identificador de la Laptop Pro 14 en la semilla */
const LAPTOP_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

describe('createValidationPipe: pipe global de validación del borde HTTP', () => {
  let validationPipe: ValidationPipe;

  beforeEach(() => {
    validationPipe = createValidationPipe();
  });

  it('debería devolver una instancia de ValidationPipe cuando se crea', () => {
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
  });

  it('debería transformar el cuerpo al DTO con el cupón normalizado cuando el payload es válido', async () => {
    const payload = { items: [{ productId: LAPTOP_ID, quantity: 2 }], couponCode: ' demo30 ' };
    const checkoutRequest = (await validationPipe.transform(payload, bodyMetadata)) as CheckoutRequestDto;
    expect(checkoutRequest).toBeInstanceOf(CheckoutRequestDto);
    expect(checkoutRequest.couponCode).toBe('DEMO30');
    expect(checkoutRequest.items[0].quantity).toBe(2);
  });

  it('debería rechazar con código de payload inválido cuando el cliente envía un precio', async () => {
    const payload = { items: [{ productId: LAPTOP_ID, quantity: 1, unitPrice: 1 }] };
    let caughtException: unknown;
    try {
      await validationPipe.transform(payload, bodyMetadata);
    } catch (error) {
      caughtException = error;
    }
    expect(caughtException).toBeInstanceOf(BadRequestException);
    const errorResponse = (caughtException as BadRequestException).getResponse() as IHttpErrorResponse;
    expect(errorResponse.code).toBe(ErrorCodeEnum.CHECKOUT_INVALID_PAYLOAD);
    expect(errorResponse.message).toContain('unitPrice');
  });

  it('debería rechazar cuando el cuerpo llega vacío', async () => {
    await expect(validationPipe.transform(undefined, bodyMetadata)).rejects.toBeInstanceOf(BadRequestException);
  });
});
