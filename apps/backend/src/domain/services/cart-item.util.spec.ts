/** Contratos compartidos */
import type { ICartItem } from '@cec/shared';

/** Utilidad bajo prueba */
import { consolidateCartItems } from './cart-item.util';

/** Identificadores de la semilla del catálogo */
const LAPTOP_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const COFFEE_MAKER_ID = '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e';

describe('consolidateCartItems: consolidación de ítems repetidos del carrito', () => {
  it('debería devolver los mismos ítems cuando no hay productos repetidos', () => {
    const cartItems: ICartItem[] = [
      { productId: LAPTOP_ID, quantity: 1 },
      { productId: COFFEE_MAKER_ID, quantity: 2 },
    ];
    expect(consolidateCartItems(cartItems)).toEqual(cartItems);
  });

  it('debería sumar las cantidades y conservar el orden de primera aparición cuando un producto se repite', () => {
    const cartItems: ICartItem[] = [
      { productId: COFFEE_MAKER_ID, quantity: 1 },
      { productId: LAPTOP_ID, quantity: 2 },
      { productId: COFFEE_MAKER_ID, quantity: 3 },
    ];
    expect(consolidateCartItems(cartItems)).toEqual([
      { productId: COFFEE_MAKER_ID, quantity: 4 },
      { productId: LAPTOP_ID, quantity: 2 },
    ]);
  });

  it('debería devolver un arreglo vacío cuando el carrito está vacío', () => {
    expect(consolidateCartItems([])).toEqual([]);
  });

  it('debería no mutar el arreglo original cuando consolida', () => {
    const cartItems: ICartItem[] = [
      { productId: LAPTOP_ID, quantity: 1 },
      { productId: LAPTOP_ID, quantity: 1 },
    ];
    consolidateCartItems(cartItems);
    expect(cartItems).toHaveLength(2);
    expect(cartItems[0].quantity).toBe(1);
  });
});
