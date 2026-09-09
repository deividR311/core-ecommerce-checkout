/** Contratos compartidos */
import { DiscountTypeEnum, VOLUME_DISCOUNT_RATE, VOLUME_THRESHOLD } from '@cec/shared';

/** Interfaces */
import type { IDiscountContext } from '../discount-context.interface';
import type { IDiscountStrategy } from '../discount-strategy.interface';

/** Utilidades */
import { NO_DISCOUNT_AMOUNT, registerDiscount } from '../discount-context.util';

/**
 * @class VolumeDiscountStrategy
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class VolumeDiscountStrategy implements IDiscountStrategy {
  /**
   * Función que aplica el 5% sobre todo el carrito cuando el total acumulado supera estrictamente el umbral
   * @param {IDiscountContext} context - contexto tras la regla por categoría
   * @returns {IDiscountContext}
   */
  apply(context: IDiscountContext): IDiscountContext {
    const isAboveThreshold = context.currentTotal > VOLUME_THRESHOLD;
    const volumeDiscount = isAboveThreshold ? context.currentTotal * VOLUME_DISCOUNT_RATE : NO_DISCOUNT_AMOUNT;
    return registerDiscount(context, DiscountTypeEnum.VOLUME, volumeDiscount);
  }
}
