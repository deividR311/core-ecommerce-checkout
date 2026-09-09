/** Contratos compartidos */
import type { ICartItem } from '@cec/shared';

/**
 * Función que consolida los ítems repetidos del carrito sumando sus cantidades por producto; conserva el orden de la
 * primera aparición de cada producto
 * @param {readonly ICartItem[]} cartItems - ítems tal como llegan del cliente
 * @returns {ICartItem[]}
 */
export const consolidateCartItems = (cartItems: readonly ICartItem[]): ICartItem[] => {
  const quantityByProductId = new Map<string, number>();
  cartItems.forEach(cartItem => {
    const accumulatedQuantity = quantityByProductId.get(cartItem.productId) ?? 0;
    quantityByProductId.set(cartItem.productId, accumulatedQuantity + cartItem.quantity);
  });
  return Array.from(quantityByProductId.entries()).map(([productId, quantity]) => ({ productId, quantity }));
};
