/** Interfaces */
import type { IDiscountContext } from './discount-context.interface';

/** Regla de descuento de la cadena; recibe el contexto acumulado y devuelve uno nuevo con su descuento registrado */
export interface IDiscountStrategy {
  /**
   * Función que aplica la regla sobre el contexto recibido sin mutarlo
   * @param {IDiscountContext} context - contexto acumulado hasta la regla anterior
   * @returns {IDiscountContext}
   */
  apply(context: IDiscountContext): IDiscountContext;
}
