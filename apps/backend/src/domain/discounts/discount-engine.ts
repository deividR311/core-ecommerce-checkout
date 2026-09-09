/** Contratos compartidos */
import { DiscountTypeEnum, FLOAT_TOLERANCE, MAX_DISCOUNT_RATE, roundMoney, roundRate } from '@cec/shared';
import type { IDiscountBreakdown } from '@cec/shared';

/** Interfaces */
import type { IDiscountContext } from './discount-context.interface';
import type { IDiscountStrategy } from './discount-strategy.interface';

/** Utilidades */
import { findDiscountAmount } from './discount-context.util';

/** Tasa efectiva cuando no hay subtotal sobre el que calcular */
const ZERO_RATE = 0;

/**
 * @class DiscountEngine
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class DiscountEngine {
  /**
   * @constructor
   * @param {readonly IDiscountStrategy[]} strategies - cadena ordenada de estrategias; el motor no conoce clases concretas
   */
  constructor(private readonly _strategies: readonly IDiscountStrategy[]) {}

  /**
   * Función que recorre la cadena de estrategias sobre el contexto inicial y construye el desglose final redondeado
   * @param {IDiscountContext} context - contexto con ítems y cupón ya resueltos
   * @returns {IDiscountBreakdown}
   */
  calculate(context: IDiscountContext): IDiscountBreakdown {
    const finalContext = this._strategies.reduce((currentContext, strategy) => strategy.apply(currentContext), context);
    return this._buildBreakdown(finalContext);
  }

  /**
   * Función que construye el desglose a dos decimales a partir del contexto final; único punto donde se redondea
   * @private
   * @param {IDiscountContext} finalContext - contexto tras la última estrategia
   * @returns {IDiscountBreakdown}
   */
  private _buildBreakdown(finalContext: IDiscountContext): IDiscountBreakdown {
    const originalSubtotal = roundMoney(finalContext.originalSubtotal);
    const finalTotal = roundMoney(finalContext.currentTotal);
    const totalDiscount = roundMoney(originalSubtotal - finalTotal);
    const rawCapAdjustment = findDiscountAmount(finalContext, DiscountTypeEnum.CAP);
    const isMaxDiscountReached = rawCapAdjustment > FLOAT_TOLERANCE;
    return {
      originalSubtotal,
      categoryDiscount: roundMoney(findDiscountAmount(finalContext, DiscountTypeEnum.CATEGORY)),
      volumeDiscount: roundMoney(findDiscountAmount(finalContext, DiscountTypeEnum.VOLUME)),
      couponDiscount: roundMoney(findDiscountAmount(finalContext, DiscountTypeEnum.COUPON)),
      capAdjustment: roundMoney(rawCapAdjustment),
      totalDiscount,
      effectiveDiscountRate: this._resolveEffectiveRate(totalDiscount, originalSubtotal, isMaxDiscountReached),
      finalTotal,
      isMaxDiscountReached,
      isCouponValid: finalContext.couponCode === null || finalContext.coupon !== null,
    };
  }

  /**
   * Función que calcula la tasa efectiva de descuento; con tope alcanzado es exactamente la tasa máxima
   * @private
   * @param {number} totalDiscount - descuento total redondeado
   * @param {number} originalSubtotal - subtotal original redondeado
   * @param {boolean} isMaxDiscountReached - indica si el tope truncó el descuento
   * @returns {number}
   */
  private _resolveEffectiveRate(
    totalDiscount: number,
    originalSubtotal: number,
    isMaxDiscountReached: boolean,
  ): number {
    if (isMaxDiscountReached) {
      return MAX_DISCOUNT_RATE;
    }
    return originalSubtotal > ZERO_RATE ? roundRate(totalDiscount / originalSubtotal) : ZERO_RATE;
  }
}
