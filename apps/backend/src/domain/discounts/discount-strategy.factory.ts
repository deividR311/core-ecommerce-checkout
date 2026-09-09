/** Interfaces */
import type { IDiscountStrategy } from './discount-strategy.interface';

/** Estrategias */
import { CategoryDiscountStrategy } from './strategies/category-discount.strategy';
import { CouponDiscountStrategy } from './strategies/coupon-discount.strategy';
import { MaxDiscountCapStrategy } from './strategies/max-discount-cap.strategy';
import { VolumeDiscountStrategy } from './strategies/volume-discount.strategy';

/**
 * @class DiscountStrategyFactory
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class DiscountStrategyFactory {
  /**
   * Función que construye la cadena de estrategias en su orden de precedencia; el tope es siempre la última
   * @returns {IDiscountStrategy[]}
   */
  static createChain(): IDiscountStrategy[] {
    return [
      new CategoryDiscountStrategy(),
      new VolumeDiscountStrategy(),
      new CouponDiscountStrategy(),
      new MaxDiscountCapStrategy(),
    ];
  }
}
