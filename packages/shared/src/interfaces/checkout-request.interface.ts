/** Interfaces */
import { ICartItem } from './cart-item.interface';

/**
 * Solicitud que el cliente envía a POST /checkout/quote y a POST /checkout.
 * El cliente nunca envía precios ni totales; el servidor los resuelve desde su catálogo.
 */
export interface ICheckoutRequest {
  /** Ítems del carrito; máximo 50 */
  items: ICartItem[];

  /** Código de cupón opcional; el servidor lo normaliza y valida */
  couponCode?: string;
}
