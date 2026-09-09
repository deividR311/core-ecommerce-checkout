/** Dependencias NestJS */
import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

/** Contratos compartidos */
import type { IApiError, IStockConflict } from '@cec/shared';

/** Filtro bajo prueba */
import { ApiExceptionFilter } from './api-exception.filter';

/** Fábricas de excepciones */
import { createInvalidOrderIdException } from './validation-exception.factory';

/** Errores */
import { BaseError } from '../../domain/errors/base.error';
import { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { InvalidCouponError } from '../../domain/errors/invalid-coupon.error';
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Respuesta HTTP mockeada con los métodos encadenados que usa el filtro */
interface IResponseMock {
  status: jest.Mock<IResponseMock, [number]>;
  json: jest.Mock<void, [IApiError]>;
}

/**
 * @class UnmappedDomainError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
class UnmappedDomainError extends BaseError {
  /**
   * @constructor
   */
  constructor() {
    super(ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR, 'error de dominio sin mapeo');
  }
}

describe('ApiExceptionFilter: traducción de excepciones al formato estándar de error', () => {
  let apiExceptionFilter: ApiExceptionFilter;
  let responseMock: IResponseMock;
  let argumentsHostMock: ArgumentsHost;
  let warnSpy: jest.SpyInstance<void, [message: unknown, ...optionalParams: unknown[]]>;
  let errorSpy: jest.SpyInstance<void, [message: unknown, ...optionalParams: unknown[]]>;

  beforeEach(() => {
    apiExceptionFilter = new ApiExceptionFilter();
    responseMock = { status: jest.fn<IResponseMock, [number]>().mockReturnThis(), json: jest.fn<void, [IApiError]>() };
    argumentsHostMock = {
      switchToHttp: () => ({ getResponse: () => responseMock }),
    } as unknown as ArgumentsHost;
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Función que ejecuta el filtro y devuelve el estado y el cuerpo enviados
   * @param {unknown} exception - excepción a traducir
   * @returns {{ status: number; body: IApiError }}
   */
  const catchException = (exception: unknown): { status: number; body: IApiError } => {
    apiExceptionFilter.catch(exception, argumentsHostMock);
    return {
      status: responseMock.status.mock.calls[0][0],
      body: responseMock.json.mock.calls[0][0],
    };
  };

  it('debería responder 404 con el código de productos cuando el error es ProductNotFoundError', () => {
    const missingProductId = '00000000-0000-4000-8000-000000000000';
    const { status, body } = catchException(new ProductNotFoundError([missingProductId]));
    expect(status).toBe(HttpStatus.NOT_FOUND);
    expect(body.error.code).toBe(ErrorCodeEnum.PRODUCTS_NOT_FOUND);
    expect(body.error.message).toContain(missingProductId);
    expect(body.error.details).toBeUndefined();
  });

  it('debería responder 400 con el código de descuentos cuando el error es InvalidCouponError', () => {
    const { status, body } = catchException(new InvalidCouponError());
    expect(status).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: { code: ErrorCodeEnum.DISCOUNTS_INVALID_COUPON, message: new InvalidCouponError().message },
    });
  });

  it('debería responder 409 con los conflictos en details cuando el error es InsufficientStockError', () => {
    const stockConflicts: IStockConflict[] = [
      { productId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', requested: 6, available: 5 },
    ];
    const { status, body } = catchException(new InsufficientStockError(stockConflicts));
    expect(status).toBe(HttpStatus.CONFLICT);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_INSUFFICIENT_STOCK);
    expect(body.error.details).toEqual(stockConflicts);
  });

  it('debería responder 404 con el código de órdenes cuando el error es OrderNotFoundError', () => {
    const { status, body } = catchException(new OrderNotFoundError('c1a5d8e2-4b3f-4c6a-9d7e-2f8b1a0c3d4e'));
    expect(status).toBe(HttpStatus.NOT_FOUND);
    expect(body.error.code).toBe(ErrorCodeEnum.ORDERS_NOT_FOUND);
  });

  it('debería registrar solo el mensaje con nivel warn cuando el error es de dominio', () => {
    catchException(new InvalidCouponError());
    expect(warnSpy.mock.calls).toHaveLength(1);
    expect(warnSpy.mock.calls[0][0]).toContain('ApiExceptionFilter > catch');
    expect(warnSpy.mock.calls[0][0]).toContain(new InvalidCouponError().message);
    expect(errorSpy.mock.calls).toHaveLength(0);
  });

  it('debería responder 500 con mensaje genérico cuando el error de dominio no tiene mapeo', () => {
    const { status, body } = catchException(new UnmappedDomainError());
    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR);
    expect(body.error.message).not.toContain('sin mapeo');
  });

  it('debería conservar el estado, el código y el mensaje cuando la HttpException viene de nuestras fábricas', () => {
    const { status, body } = catchException(createInvalidOrderIdException());
    expect(status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.error.code).toBe(ErrorCodeEnum.ORDERS_INVALID_ID);
    expect(body.error.message).toContain('UUID');
  });

  it('debería conservar el estado con código y mensaje genéricos cuando la HttpException es de Nest', () => {
    const { status, body } = catchException(new NotFoundException('Cannot GET /desconocida'));
    expect(status).toBe(HttpStatus.NOT_FOUND);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR);
    expect(body.error.message).not.toContain('Cannot GET');
  });

  it('debería responder 400 con el código de cuerpo excesivo cuando el parser rechaza el tamaño', () => {
    const payloadTooLargeError = Object.assign(new Error('request entity too large'), {
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    });
    const { status, body } = catchException(payloadTooLargeError);
    expect(status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_PAYLOAD_TOO_LARGE);
    expect(body.error.message).toContain('100 KB');
  });

  it('debería responder 500 sin detalles internos y registrar solo error.message cuando el error no es controlado', () => {
    const unexpectedError = new Error('conexión perdida con el repositorio');
    const { status, body } = catchException(unexpectedError);
    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR);
    expect(body.error.message).not.toContain(unexpectedError.message);
    expect(body.error.details).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('stack');
    expect(errorSpy.mock.calls).toHaveLength(1);
    expect(errorSpy.mock.calls[0][0]).toContain(unexpectedError.message);
    expect(errorSpy.mock.calls[0]).toHaveLength(1);
  });

  it('debería responder 500 cuando lo lanzado no es una instancia de Error', () => {
    const { status, body } = catchException('fallo inesperado');
    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error.code).toBe(ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR);
    expect(errorSpy.mock.calls[0][0]).toContain('fallo inesperado');
  });
});
