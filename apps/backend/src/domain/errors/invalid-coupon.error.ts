/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

/** Mensaje único: no distingue entre cupón inexistente e inactivo para no dar pistas sobre cupones activos */
export const INVALID_COUPON_MESSAGE = 'El cupón ingresado no es válido.';

/**
 * @class InvalidCouponError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class InvalidCouponError extends BaseError {
  /**
   * @constructor
   */
  constructor() {
    super(ErrorCodeEnum.DISCOUNTS_INVALID_COUPON, INVALID_COUPON_MESSAGE);
  }
}
