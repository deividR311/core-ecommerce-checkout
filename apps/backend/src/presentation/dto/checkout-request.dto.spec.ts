/** Polyfill de metadatos que requieren los decoradores de class-transformer fuera de Nest */
import 'reflect-metadata';

/** Dependencias de validación */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { ValidationError } from 'class-validator';

/** DTO bajo prueba */
import {
  CheckoutRequestDto,
  COUPON_CODE_PATTERN,
  MAX_CART_ITEMS,
  MAX_COUPON_CODE_LENGTH,
  MIN_CART_ITEMS,
  normalizeCouponCode,
} from './checkout-request.dto';

/** DTOs */
import { CartItemDto } from './cart-item.dto';

/** Identificadores de la semilla del catálogo */
const LAPTOP_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const COFFEE_MAKER_ID = '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e';

/** Ítem válido de referencia */
const validCartItem = { productId: LAPTOP_ID, quantity: 1 };

/**
 * Función que transforma y valida un payload con las mismas opciones del pipe global (whitelist estricta)
 * @param {Record<string, unknown>} plainCheckoutRequest - payload tal como llegaría del cliente
 * @returns {Promise<{ checkoutRequest: CheckoutRequestDto; validationErrors: ValidationError[] }>}
 */
const transformAndValidate = async (
  plainCheckoutRequest: Record<string, unknown>,
): Promise<{ checkoutRequest: CheckoutRequestDto; validationErrors: ValidationError[] }> => {
  const checkoutRequest = plainToInstance(CheckoutRequestDto, plainCheckoutRequest);
  const validationErrors = await validate(checkoutRequest, { whitelist: true, forbidNonWhitelisted: true });
  return { checkoutRequest, validationErrors };
};

/**
 * Función que aplana las claves de restricción de un árbol de errores de validación
 * @param {ValidationError[]} validationErrors - errores reportados por class-validator
 * @returns {string[]}
 */
const collectConstraintKeys = (validationErrors: ValidationError[]): string[] =>
  validationErrors.flatMap(validationError => [
    ...Object.keys(validationError.constraints ?? {}),
    ...collectConstraintKeys(validationError.children ?? []),
  ]);

describe('CheckoutRequestDto: validación y normalización de la solicitud de checkout', () => {
  it('debería exponer los límites acordados del carrito y del cupón cuando se importan las constantes', () => {
    expect(MIN_CART_ITEMS).toBe(1);
    expect(MAX_CART_ITEMS).toBe(50);
    expect(MAX_COUPON_CODE_LENGTH).toBe(32);
    expect(COUPON_CODE_PATTERN.test('WELCOME2026')).toBe(true);
    expect(COUPON_CODE_PATTERN.test('welcome-2026')).toBe(false);
  });

  describe('normalizeCouponCode', () => {
    it('debería aplicar trim y mayúsculas cuando el valor es texto', () => {
      expect(normalizeCouponCode({ value: '  welcome2026 ' })).toBe('WELCOME2026');
    });

    it('debería devolver undefined cuando el texto queda vacío tras el trim', () => {
      expect(normalizeCouponCode({ value: '' })).toBeUndefined();
      expect(normalizeCouponCode({ value: '   ' })).toBeUndefined();
    });

    it('debería dejar el valor intacto cuando no es texto para que la validación lo rechace', () => {
      expect(normalizeCouponCode({ value: 30 })).toBe(30);
      expect(normalizeCouponCode({ value: undefined })).toBeUndefined();
    });
  });

  it('debería transformar los ítems en CartItemDto y normalizar el cupón cuando el payload es válido', async () => {
    const { checkoutRequest, validationErrors } = await transformAndValidate({
      items: [validCartItem, { productId: COFFEE_MAKER_ID, quantity: 2 }],
      couponCode: ' demo30 ',
    });
    expect(validationErrors).toEqual([]);
    expect(checkoutRequest.items[0]).toBeInstanceOf(CartItemDto);
    expect(checkoutRequest.items).toHaveLength(2);
    expect(checkoutRequest.couponCode).toBe('DEMO30');
  });

  it('debería aceptar el payload sin cupón cuando couponCode no se envía', async () => {
    const { checkoutRequest, validationErrors } = await transformAndValidate({ items: [validCartItem] });
    expect(validationErrors).toEqual([]);
    expect(checkoutRequest.couponCode).toBeUndefined();
  });

  it('debería tratar el cupón vacío como ausencia de cupón cuando couponCode llega en blanco', async () => {
    const { checkoutRequest, validationErrors } = await transformAndValidate({
      items: [validCartItem],
      couponCode: '  ',
    });
    expect(validationErrors).toEqual([]);
    expect(checkoutRequest.couponCode).toBeUndefined();
  });

  it('debería aceptar exactamente 50 ítems cuando el carrito está en el límite', async () => {
    const items = Array.from({ length: MAX_CART_ITEMS }, () => validCartItem);
    const { validationErrors } = await transformAndValidate({ items });
    expect(validationErrors).toEqual([]);
  });

  it.each([
    ['el carrito está vacío', { items: [] }, 'arrayMinSize'],
    ['falta el arreglo de ítems', {}, 'isArray'],
    ['items no es un arreglo', { items: validCartItem }, 'isArray'],
    ['hay más de 50 ítems', { items: Array.from({ length: 51 }, () => validCartItem) }, 'arrayMaxSize'],
    ['un ítem es inválido', { items: [{ productId: LAPTOP_ID, quantity: 0 }] }, 'min'],
    ['un ítem trae un precio', { items: [{ ...validCartItem, unitPrice: 1 }] }, 'whitelistValidation'],
    ['el payload trae un total', { items: [validCartItem], finalTotal: 1 }, 'whitelistValidation'],
    ['el cupón no es texto', { items: [validCartItem], couponCode: 30 }, 'isString'],
    ['el cupón supera 32 caracteres', { items: [validCartItem], couponCode: 'A'.repeat(33) }, 'maxLength'],
    ['el cupón tiene símbolos', { items: [validCartItem], couponCode: 'DEMO-30' }, 'matches'],
    ['el cupón tiene espacios internos', { items: [validCartItem], couponCode: 'DEMO 30' }, 'matches'],
  ])('debería reportar la restricción violada cuando %s', async (_case, plainCheckoutRequest, expectedConstraint) => {
    const { validationErrors } = await transformAndValidate(plainCheckoutRequest);
    expect(collectConstraintKeys(validationErrors)).toContain(expectedConstraint);
  });
});
