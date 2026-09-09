/** Contratos compartidos */
import type { DiscountTypeEnum, ProductCategoryEnum } from '@cec/shared';

/** Entidades */
import type { ICoupon } from '../entities/coupon.interface';

/** Ítem del carrito ya resuelto desde el catálogo del servidor; el motor nunca recibe identificadores crudos */
export interface IDiscountableItem {
  /** Precio unitario vigente en el catálogo */
  unitPrice: number;

  /** Categoría del producto; determina si aplica la regla por categoría */
  category: ProductCategoryEnum;

  /** Unidades solicitadas */
  quantity: number;
}

/** Descuento registrado por una estrategia; para el tope, el monto es el ajuste que devuelve al total */
export interface IAppliedDiscount {
  /** Regla que registró el descuento */
  type: DiscountTypeEnum;

  /** Monto con precisión completa */
  amount: number;
}

/**
 * Contexto inmutable que recorre la cadena de estrategias.
 * Cada estrategia devuelve un contexto nuevo con su descuento registrado y el total actualizado.
 */
export interface IDiscountContext {
  /** Ítems resueltos sobre los que se calcula el descuento */
  readonly items: readonly IDiscountableItem[];

  /** Código normalizado enviado por el cliente, o null si no envió cupón */
  readonly couponCode: string | null;

  /** Cupón resuelto desde el repositorio, o null si el código no corresponde a un cupón activo */
  readonly coupon: ICoupon | null;

  /** Suma de precio unitario por cantidad de todos los ítems, antes de descuentos */
  readonly originalSubtotal: number;

  /** Total acumulado tras la última regla aplicada, con precisión completa */
  readonly currentTotal: number;

  /** Descuentos registrados en orden de aplicación */
  readonly appliedDiscounts: readonly IAppliedDiscount[];
}
