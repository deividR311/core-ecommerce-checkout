/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

/**
 * @class ProductNotFoundError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class ProductNotFoundError extends BaseError {
  /**
   * @constructor
   * @param {readonly string[]} missingProductIds - identificadores que no existen en el catálogo
   */
  constructor(readonly missingProductIds: readonly string[]) {
    super(
      ErrorCodeEnum.PRODUCTS_NOT_FOUND,
      `Los siguientes productos no existen en el catálogo: ${missingProductIds.join(', ')}.`,
    );
  }
}
