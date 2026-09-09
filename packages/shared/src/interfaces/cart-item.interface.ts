/** Ítem del carrito enviado por el cliente: solo identificador y cantidad, nunca precios */
export interface ICartItem {
  /** Identificador del producto del catálogo */
  productId: string;

  /** Unidades solicitadas; entero entre 1 y 999 */
  quantity: number;
}
