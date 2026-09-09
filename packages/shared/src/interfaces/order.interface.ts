/** Interfaces */
import { IDiscountBreakdown } from './discount-breakdown.interface';

/** Ítem de una orden con el precio congelado al momento de la compra */
export interface IOrderItem {
  /** Identificador del producto comprado */
  productId: string;

  /** Nombre del producto al momento de la compra */
  name: string;

  /** Precio unitario al momento de la compra; monto con dos decimales */
  unitPrice: number;

  /** Unidades compradas */
  quantity: number;
}

/** Orden persistida tal como la devuelven POST /checkout y GET /orders */
export interface IOrder {
  /** Identificador UUID v4 generado por el servidor */
  id: string;

  /** Fecha de creación como unix timestamp UTC en segundos, sin milisegundos */
  createdAt: number;

  /** Ítems comprados */
  items: IOrderItem[];

  /** Código del cupón aplicado, o null si no se usó cupón */
  couponCode: string | null;

  /** Desglose de descuentos calculado al procesar la orden */
  breakdown: IDiscountBreakdown;

  /** Total pagado; monto con dos decimales, igual a breakdown.finalTotal */
  finalTotal: number;
}
