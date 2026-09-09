/** Contratos compartidos */
import type { ICartItem, IProduct, IStockConflict } from '@cec/shared';

/** Disponibilidad que se reporta cuando el producto no está entre los resueltos */
const UNAVAILABLE_STOCK = 0;

/**
 * @class StockValidator
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class StockValidator {
  /**
   * Función que compara la cantidad solicitada de cada ítem consolidado con el stock del producto y devuelve todos los
   * conflictos; una lista vacía significa que el carrito completo puede atenderse
   * @param {readonly ICartItem[]} consolidatedItems - ítems ya consolidados por producto
   * @param {readonly IProduct[]} products - productos resueltos desde el catálogo
   * @returns {IStockConflict[]}
   */
  validate(consolidatedItems: readonly ICartItem[], products: readonly IProduct[]): IStockConflict[] {
    const stockByProductId = new Map(products.map(product => [product.id, product.stock]));
    return consolidatedItems
      .map(consolidatedItem => ({
        productId: consolidatedItem.productId,
        requested: consolidatedItem.quantity,
        available: stockByProductId.get(consolidatedItem.productId) ?? UNAVAILABLE_STOCK,
      }))
      .filter(stockConflict => stockConflict.requested > stockConflict.available);
  }
}
