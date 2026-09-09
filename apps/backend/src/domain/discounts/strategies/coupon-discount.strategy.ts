/** Contratos compartidos */
import { DiscountTypeEnum } from '@cec/shared';

/** Interfaces */
import type { IDiscountContext } from '../discount-context.interface';
import type { IDiscountStrategy } from '../discount-strategy.interface';

/** Utilidades */
import { NO_DISCOUNT_AMOUNT, registerDiscount } from '../discount-context.util';

/**
 * @class CouponDiscountStrategy
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class CouponDiscountStrategy implements IDiscountStrategy {
  /**
   * Función que aplica el porcentaje del cupón resuelto sobre el total acumulado; sin cupón activo no descuenta nada
   * @param {IDiscountContext} context - contexto tras la regla por volumen
   * @returns {IDiscountContext}
   */
  apply(context: IDiscountContext): IDiscountContext {
    const hasActiveCoupon = context.coupon !== null && context.coupon.isActive;
    const couponDiscount = hasActiveCoupon ? context.currentTotal * context.coupon.discountRate : NO_DISCOUNT_AMOUNT;
    return registerDiscount(context, DiscountTypeEnum.COUPON, couponDiscount);
  }
}
