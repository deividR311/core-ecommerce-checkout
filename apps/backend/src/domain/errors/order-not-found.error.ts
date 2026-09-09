/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

/**
 * @class OrderNotFoundError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class OrderNotFoundError extends BaseError {
  /**
   * @constructor
   * @param {string} orderId - identificador de la orden consultada
   */
  constructor(readonly orderId: string) {
    super(ErrorCodeEnum.ORDERS_NOT_FOUND, `La orden ${orderId} no existe.`);
  }
}
