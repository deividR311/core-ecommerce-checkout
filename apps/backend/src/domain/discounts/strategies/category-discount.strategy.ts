/** Contratos compartidos */
import { CATEGORY_DISCOUNT_RATE, DISCOUNT_TARGET_CATEGORY, DiscountTypeEnum } from '@cec/shared';

/** Interfaces */
import type { IDiscountContext } from '../discount-context.interface';
import type { IDiscountStrategy } from '../discount-strategy.interface';

/** Utilidades */
import { registerDiscount, sumItemsSubtotal } from '../discount-context.util';

/**
 * @class CategoryDiscountStrategy
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class CategoryDiscountStrategy implements IDiscountStrategy {
  /**
   * Función que aplica el 10% únicamente sobre el valor de los ítems de la categoría objetivo
   * @param {IDiscountContext} context - contexto inicial del carrito
   * @returns {IDiscountContext}
   */
  apply(context: IDiscountContext): IDiscountContext {
    const targetCategoryItems = context.items.filter(
      discountableItem => discountableItem.category === DISCOUNT_TARGET_CATEGORY,
    );
    const categoryDiscount = sumItemsSubtotal(targetCategoryItems) * CATEGORY_DISCOUNT_RATE;
    return registerDiscount(context, DiscountTypeEnum.CATEGORY, categoryDiscount);
  }
}
