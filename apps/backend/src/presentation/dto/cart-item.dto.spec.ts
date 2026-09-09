/** Dependencias de validación */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/** DTO bajo prueba */
import { CartItemDto, MAX_CART_ITEM_QUANTITY, MIN_CART_ITEM_QUANTITY } from './cart-item.dto';

/** Identificador de la Laptop Pro 14 en la semilla */
const LAPTOP_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

/**
 * Función que transforma un objeto plano en CartItemDto y devuelve las claves de las restricciones violadas
 * @param {Record<string, unknown>} plainCartItem - ítem tal como llegaría del cliente
 * @returns {Promise<string[]>}
 */
const collectConstraintKeys = async (plainCartItem: Record<string, unknown>): Promise<string[]> => {
  const cartItemDto = plainToInstance(CartItemDto, plainCartItem);
  const validationErrors = await validate(cartItemDto);
  return validationErrors.flatMap(validationError => Object.keys(validationError.constraints ?? {}));
};

describe('CartItemDto: validación de un ítem del carrito', () => {
  it('debería exponer los límites acordados de cantidad cuando se importan las constantes', () => {
    expect(MIN_CART_ITEM_QUANTITY).toBe(1);
    expect(MAX_CART_ITEM_QUANTITY).toBe(999);
  });

  it.each([
    ['la cantidad mínima', 1],
    ['una cantidad intermedia', 250],
    ['la cantidad máxima', 999],
  ])('debería no reportar errores cuando el ítem tiene un UUID válido y %s', async (_case, quantity) => {
    expect(await collectConstraintKeys({ productId: LAPTOP_ID, quantity })).toEqual([]);
  });

  it.each([
    ['el productId no es UUID', { productId: 'laptop-pro-14', quantity: 1 }, 'isUuid'],
    ['falta el productId', { quantity: 1 }, 'isUuid'],
    ['la cantidad es cero', { productId: LAPTOP_ID, quantity: 0 }, 'min'],
    ['la cantidad es negativa', { productId: LAPTOP_ID, quantity: -3 }, 'min'],
    ['la cantidad es decimal', { productId: LAPTOP_ID, quantity: 1.5 }, 'isInt'],
    ['la cantidad supera 999', { productId: LAPTOP_ID, quantity: 1000 }, 'max'],
    ['la cantidad es texto', { productId: LAPTOP_ID, quantity: '2' }, 'isInt'],
    ['falta la cantidad', { productId: LAPTOP_ID }, 'isInt'],
  ])('debería reportar la restricción violada cuando %s', async (_case, plainCartItem, expectedConstraint) => {
    expect(await collectConstraintKeys(plainCartItem)).toContain(expectedConstraint);
  });

  it('debería producir mensajes en español que nombran el campo cuando la validación falla', async () => {
    const cartItemDto = plainToInstance(CartItemDto, { productId: 'laptop', quantity: 0 });
    const validationErrors = await validate(cartItemDto);
    const messages = validationErrors.flatMap(validationError => Object.values(validationError.constraints ?? {}));
    expect(messages).toContain('El campo productId debe ser un UUID válido.');
    expect(messages).toContain('El campo quantity debe ser mayor o igual a 1.');
  });
});
