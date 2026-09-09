/** Contratos compartidos */
import type { IStockConflict } from '@cec/shared';

/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

/**
 * @class InsufficientStockError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class InsufficientStockError extends BaseError {
  /**
   * @constructor
   * @param {readonly IStockConflict[]} conflicts - todos los productos cuya cantidad solicitada supera el stock
   */
  constructor(readonly conflicts: readonly IStockConflict[]) {
    super(ErrorCodeEnum.CHECKOUT_INSUFFICIENT_STOCK, 'No hay stock suficiente para uno o más productos del carrito.');
  }
}
