/** Contratos compartidos */
import { FLOAT_TOLERANCE, MAX_DISCOUNT_RATE } from '@cec/shared';

/** Interfaces */
import type { IDiscountContext } from '../discount-context.interface';
import type { IDiscountStrategy } from '../discount-strategy.interface';

/** Utilidades */
import { registerCapAdjustment } from '../discount-context.util';

/** Ajuste que se registra cuando el descuento acumulado no supera el tope */
const NO_CAP_ADJUSTMENT = 0;

/** Fracción del subtotal original que el cliente paga como mínimo (65%) */
const MIN_PAYABLE_RATE = 1 - MAX_DISCOUNT_RATE;

/**
 * @class MaxDiscountCapStrategy
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class MaxDiscountCapStrategy implements IDiscountStrategy {
  /**
   * Función que trunca el descuento acumulado exactamente al tope cuando lo supera; un tope exacto no se altera
   * @param {IDiscountContext} context - contexto tras la regla de cupón
   * @returns {IDiscountContext}
   */
  apply(context: IDiscountContext): IDiscountContext {
    const maxDiscountAmount = context.originalSubtotal * MAX_DISCOUNT_RATE;
    const accumulatedDiscount = context.originalSubtotal - context.currentTotal;
    const isCapExceeded = accumulatedDiscount > maxDiscountAmount + FLOAT_TOLERANCE;
    if (!isCapExceeded) {
      return registerCapAdjustment(context, NO_CAP_ADJUSTMENT);
    }
    const cappedTotal = context.originalSubtotal * MIN_PAYABLE_RATE;
    return registerCapAdjustment(context, cappedTotal - context.currentTotal);
  }
}
