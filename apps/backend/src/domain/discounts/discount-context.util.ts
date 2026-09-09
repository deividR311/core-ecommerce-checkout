/** Contratos compartidos */
import { DiscountTypeEnum } from '@cec/shared';

/** Entidades */
import type { ICoupon } from '../entities/coupon.interface';

/** Interfaces */
import type { IDiscountableItem, IDiscountContext } from './discount-context.interface';

/** Monto que registra una regla cuando no aplica; compartido por las estrategias */
export const NO_DISCOUNT_AMOUNT = 0;

/**
 * Función que suma el precio unitario por cantidad de los ítems recibidos con precisión completa
 * @param {readonly IDiscountableItem[]} discountableItems - ítems a sumar
 * @returns {number}
 */
export const sumItemsSubtotal = (discountableItems: readonly IDiscountableItem[]): number =>
  discountableItems.reduce(
    (subtotal, discountableItem) => subtotal + discountableItem.unitPrice * discountableItem.quantity,
    NO_DISCOUNT_AMOUNT,
  );

/**
 * Función que construye el contexto inicial del motor a partir de los ítems y el cupón ya resueltos por el caso de uso
 * @param {readonly IDiscountableItem[]} discountableItems - ítems resueltos desde el catálogo
 * @param {string | null} couponCode - código normalizado enviado por el cliente, o null
 * @param {ICoupon | null} coupon - cupón resuelto desde el repositorio, o null
 * @returns {IDiscountContext}
 */
export const createDiscountContext = (
  discountableItems: readonly IDiscountableItem[],
  couponCode: string | null,
  coupon: ICoupon | null,
): IDiscountContext => {
  const originalSubtotal = sumItemsSubtotal(discountableItems);
  return {
    items: discountableItems.map(discountableItem => ({ ...discountableItem })),
    couponCode,
    coupon,
    originalSubtotal,
    currentTotal: originalSubtotal,
    appliedDiscounts: [],
  };
};

/**
 * Función que devuelve un contexto nuevo con un descuento registrado y restado del total acumulado
 * @param {IDiscountContext} context - contexto acumulado
 * @param {DiscountTypeEnum} discountType - regla que registra el descuento
 * @param {number} discountAmount - monto a descontar con precisión completa
 * @returns {IDiscountContext}
 */
export const registerDiscount = (
  context: IDiscountContext,
  discountType: DiscountTypeEnum,
  discountAmount: number,
): IDiscountContext => ({
  ...context,
  currentTotal: context.currentTotal - discountAmount,
  appliedDiscounts: [...context.appliedDiscounts, { type: discountType, amount: discountAmount }],
});

/**
 * Función que devuelve un contexto nuevo con el ajuste del tope registrado y sumado al total acumulado
 * @param {IDiscountContext} context - contexto acumulado
 * @param {number} capAdjustment - monto que el tope devuelve al total, con precisión completa
 * @returns {IDiscountContext}
 */
export const registerCapAdjustment = (context: IDiscountContext, capAdjustment: number): IDiscountContext => ({
  ...context,
  currentTotal: context.currentTotal + capAdjustment,
  appliedDiscounts: [...context.appliedDiscounts, { type: DiscountTypeEnum.CAP, amount: capAdjustment }],
});

/**
 * Función que obtiene el monto registrado por una regla, o cero si la regla no dejó registro
 * @param {IDiscountContext} context - contexto final de la cadena
 * @param {DiscountTypeEnum} discountType - regla consultada
 * @returns {number}
 */
export const findDiscountAmount = (context: IDiscountContext, discountType: DiscountTypeEnum): number => {
  const appliedDiscount = context.appliedDiscounts.find(discount => discount.type === discountType);
  return appliedDiscount ? appliedDiscount.amount : NO_DISCOUNT_AMOUNT;
};
