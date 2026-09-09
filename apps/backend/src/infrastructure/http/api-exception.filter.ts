/** Dependencias NestJS */
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

/** Errores */
import { BaseError } from '../../domain/errors/base.error';
import { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { InvalidCouponError } from '../../domain/errors/invalid-coupon.error';
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Interfaces */
import type { IHttpErrorResponse } from './http-error-response.interface';
import type { IResolvedApiError } from './resolved-api-error.interface';

/** Constructor de cualquier error de dominio, usado para mapear clase → estado HTTP */
type BaseErrorClass = abstract new (...args: never[]) => BaseError;

/** Mapeo clase de dominio → estado HTTP; el dominio no conoce estos códigos */
const DOMAIN_ERROR_STATUSES: ReadonlyArray<[BaseErrorClass, HttpStatus]> = [
  [ProductNotFoundError, HttpStatus.NOT_FOUND],
  [InvalidCouponError, HttpStatus.BAD_REQUEST],
  [InsufficientStockError, HttpStatus.CONFLICT],
  [OrderNotFoundError, HttpStatus.NOT_FOUND],
];

/** Mensajes genéricos que nunca exponen detalles internos */
const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
const PAYLOAD_TOO_LARGE_MESSAGE = 'El cuerpo de la petición supera el tamaño máximo permitido (100 KB).';
const GENERIC_HTTP_ERROR_MESSAGE = 'La solicitud no pudo procesarse.';

/**
 * @class ApiExceptionFilter
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  /** Logger del filtro; registra únicamente error.message, nunca el objeto completo ni el payload */
  private readonly _logger = new Logger(ApiExceptionFilter.name);

  /**
   * Función que traduce cualquier excepción al formato IApiError y la envía con el estado HTTP correspondiente
   * @param {unknown} exception - excepción capturada
   * @param {ArgumentsHost} host - contexto de la petición
   * @returns {void}
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const resolvedApiError = this._resolveApiError(exception);
    response.status(resolvedApiError.status).json(resolvedApiError.body);
  }

  /**
   * Función que decide el mapeo según el tipo de excepción: dominio, HTTP de Nest, cuerpo excesivo o no controlada
   * @private
   * @param {unknown} exception - excepción capturada
   * @returns {IResolvedApiError}
   */
  private _resolveApiError(exception: unknown): IResolvedApiError {
    if (exception instanceof BaseError) {
      return this._fromDomainError(exception);
    }
    if (exception instanceof HttpException) {
      return this._fromHttpException(exception);
    }
    if (this._isPayloadTooLarge(exception)) {
      return this._fromPayloadTooLarge();
    }
    return this._fromUnexpectedError(exception);
  }

  /**
   * Función que mapea un error de dominio a su estado HTTP; los conflictos de stock viajan en details
   * @private
   * @param {BaseError} domainError - error lanzado por dominio o aplicación
   * @returns {IResolvedApiError}
   */
  private _fromDomainError(domainError: BaseError): IResolvedApiError {
    const statusEntry = DOMAIN_ERROR_STATUSES.find(([errorClass]) => domainError instanceof errorClass);
    if (!statusEntry) {
      return this._fromUnexpectedError(domainError);
    }
    this._logger.warn(`ApiExceptionFilter > catch - error de dominio ${domainError.code}. ${domainError.message}`);
    const details = domainError instanceof InsufficientStockError ? [...domainError.conflicts] : undefined;
    return {
      status: statusEntry[1],
      body: { error: { code: domainError.code, message: domainError.message, ...(details ? { details } : {}) } },
    };
  }

  /**
   * Función que conserva el estado de una HttpException de Nest; si trae código propio lo respeta, si no usa uno genérico
   * @private
   * @param {HttpException} httpException - excepción de pipes o del enrutador de Nest
   * @returns {IResolvedApiError}
   */
  private _fromHttpException(httpException: HttpException): IResolvedApiError {
    const status = httpException.getStatus();
    const exceptionResponse = httpException.getResponse();
    const errorResponse = this._isHttpErrorResponse(exceptionResponse)
      ? exceptionResponse
      : { code: ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR, message: GENERIC_HTTP_ERROR_MESSAGE };
    this._logger.warn(`ApiExceptionFilter > catch - error HTTP ${status}. ${errorResponse.message}`);
    return { status, body: { error: errorResponse } };
  }

  /**
   * Función que responde 400 cuando el parser de cuerpo rechaza una petición por tamaño (decisión de la HU-04)
   * @private
   * @returns {IResolvedApiError}
   */
  private _fromPayloadTooLarge(): IResolvedApiError {
    this._logger.warn(`ApiExceptionFilter > catch - cuerpo de la petición rechazado por tamaño`);
    return {
      status: HttpStatus.BAD_REQUEST,
      body: { error: { code: ErrorCodeEnum.CHECKOUT_PAYLOAD_TOO_LARGE, message: PAYLOAD_TOO_LARGE_MESSAGE } },
    };
  }

  /**
   * Función que responde 500 con mensaje genérico y registra solo el mensaje del error
   * @private
   * @param {unknown} exception - error no controlado
   * @returns {IResolvedApiError}
   */
  private _fromUnexpectedError(exception: unknown): IResolvedApiError {
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    this._logger.error(`ApiExceptionFilter > catch - error no controlado. ${errorMessage}`);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: ErrorCodeEnum.CHECKOUT_UNEXPECTED_ERROR, message: UNEXPECTED_ERROR_MESSAGE } },
    };
  }

  /**
   * Función que reconoce el error que body-parser emite cuando el cuerpo supera el límite configurado
   * @private
   * @param {unknown} exception - excepción capturada
   * @returns {boolean}
   */
  private _isPayloadTooLarge(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception &&
      exception.status === HttpStatus.PAYLOAD_TOO_LARGE
    );
  }

  /**
   * Función que verifica si la respuesta de una HttpException trae el código y mensaje de nuestras fábricas
   * @private
   * @param {string | object} exceptionResponse - respuesta interna de la HttpException
   * @returns {boolean}
   */
  private _isHttpErrorResponse(exceptionResponse: string | object): exceptionResponse is IHttpErrorResponse {
    return (
      typeof exceptionResponse === 'object' &&
      'code' in exceptionResponse &&
      typeof exceptionResponse.code === 'string' &&
      'message' in exceptionResponse &&
      typeof exceptionResponse.message === 'string'
    );
  }
}
