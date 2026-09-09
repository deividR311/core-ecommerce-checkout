/** Dependencias NestJS */
import type { NestExpressApplication } from '@nestjs/platform-express';

/** Dependencias de pruebas */
import request from 'supertest';

/** Contratos compartidos */
import type { IApiError, IDiscountBreakdown, IOrder, IProduct } from '@cec/shared';

/** Utilidades de prueba */
import { COFFEE_MAKER_ID, DESK_LAMP_ID, LAPTOP_ID, UNKNOWN_UUID, createTestingApp } from './testing-app.util';

/** Cotización esperada de una Laptop Pro 14 con DEMO30: la cascada llega a 40.15% y el tope trunca al 35% */
const laptopWithDemoCouponBreakdown: IDiscountBreakdown = {
  originalSubtotal: 1299.99,
  categoryDiscount: 130,
  volumeDiscount: 58.5,
  couponDiscount: 333.45,
  capAdjustment: 66.95,
  totalDiscount: 455,
  effectiveDiscountRate: 0.35,
  finalTotal: 844.99,
  isMaxDiscountReached: true,
  isCouponValid: true,
};

/** Cotización esperada de dos Cafeteras de Goteo sin cupón: sin categoría, sin volumen (91 no supera 100) */
const twoCoffeeMakersBreakdown: IDiscountBreakdown = {
  originalSubtotal: 91,
  categoryDiscount: 0,
  volumeDiscount: 0,
  couponDiscount: 0,
  capAdjustment: 0,
  totalDiscount: 0,
  effectiveDiscountRate: 0,
  finalTotal: 91,
  isMaxDiscountReached: false,
  isCouponValid: true,
};

/** Tamaño de cupón que supera el límite de 100 KB del cuerpo */
const OVERSIZED_COUPON_LENGTH = 110_000;

describe('CheckoutController (e2e): cotización y procesamiento del checkout', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestingApp();
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Función que consulta el stock actual de un producto a través de GET /products
   * @param {string} productId - identificador del producto
   * @returns {Promise<number>}
   */
  const fetchStock = async (productId: string): Promise<number> => {
    const response = await request(app.getHttpServer()).get('/products').expect(200);
    const products = response.body as IProduct[];
    const product = products.find(catalogProduct => catalogProduct.id === productId);
    return product ? product.stock : Number.NaN;
  };

  describe('POST /checkout/quote', () => {
    it('debería responder 200 con el desglose exacto y el tope alcanzado cuando se cotiza una laptop con DEMO30', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'DEMO30' })
        .expect(200);
      expect(response.body).toEqual(laptopWithDemoCouponBreakdown);
    });

    it('debería normalizar el cupón con trim y mayúsculas cuando se envía en minúsculas con espacios', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: '  welcome2026 ' })
        .expect(200);
      const breakdown = response.body as IDiscountBreakdown;
      expect(breakdown.isCouponValid).toBe(true);
      expect(breakdown.couponDiscount).toBe(166.72);
      expect(breakdown.finalTotal).toBe(944.77);
    });

    it('debería cotizar sin la regla de cupón e informar isCouponValid false cuando el cupón no existe', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'NOEXISTE' })
        .expect(200);
      const breakdown = response.body as IDiscountBreakdown;
      expect(breakdown.isCouponValid).toBe(false);
      expect(breakdown.couponDiscount).toBe(0);
      expect(breakdown.finalTotal).toBe(1111.49);
    });

    it('debería tratar el cupón inactivo como inválido cuando se envía SUMMER2025', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: COFFEE_MAKER_ID, quantity: 2 }], couponCode: 'SUMMER2025' })
        .expect(200);
      expect(response.body).toEqual({ ...twoCoffeeMakersBreakdown, isCouponValid: false });
    });

    it('debería cotizar sin cupón cuando couponCode llega vacío o con solo espacios', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: COFFEE_MAKER_ID, quantity: 2 }], couponCode: '   ' })
        .expect(200);
      expect(response.body).toEqual(twoCoffeeMakersBreakdown);
    });

    it('debería consolidar los ítems repetidos cuando el mismo producto llega en dos entradas', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({
          items: [
            { productId: COFFEE_MAKER_ID, quantity: 1 },
            { productId: COFFEE_MAKER_ID, quantity: 1 },
          ],
        })
        .expect(200);
      expect(response.body).toEqual(twoCoffeeMakersBreakdown);
    });

    it('debería no modificar stock ni persistir órdenes cuando se cotiza', async () => {
      await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 5 }] })
        .expect(200);
      expect(await fetchStock(LAPTOP_ID)).toBe(5);
      const ordersResponse = await request(app.getHttpServer()).get('/orders').expect(200);
      expect(ordersResponse.body).toEqual([]);
    });

    it('debería responder 404 con el formato estándar cuando un producto no existe en el catálogo', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: UNKNOWN_UUID, quantity: 1 }] })
        .expect(404);
      const apiError = response.body as IApiError;
      expect(apiError.error.code).toBe('CEC_PRODUCTS_3001');
      expect(apiError.error.message).toContain(UNKNOWN_UUID);
      expect(apiError.error.details).toBeUndefined();
    });

    it('debería responder 400 cuando el carrito está vacío', async () => {
      const response = await request(app.getHttpServer()).post('/checkout/quote').send({ items: [] }).expect(400);
      const apiError = response.body as IApiError;
      expect(apiError.error.code).toBe('CEC_CHECKOUT_1001');
      expect(apiError.error.message).toContain('al menos un ítem');
    });

    it('debería responder 400 cuando el cuerpo está vacío', async () => {
      const response = await request(app.getHttpServer()).post('/checkout/quote').send().expect(400);
      expect((response.body as IApiError).error.code).toBe('CEC_CHECKOUT_1001');
    });

    it.each([
      ['cantidad cero', { items: [{ productId: LAPTOP_ID, quantity: 0 }] }, 'quantity'],
      ['cantidad decimal', { items: [{ productId: LAPTOP_ID, quantity: 1.5 }] }, 'entero'],
      ['cantidad mayor a 999', { items: [{ productId: LAPTOP_ID, quantity: 1000 }] }, '999'],
      ['productId que no es UUID', { items: [{ productId: 'laptop', quantity: 1 }] }, 'productId'],
      ['ítem sin productId', { items: [{ quantity: 1 }] }, 'productId'],
      ['precio enviado por el cliente', { items: [{ productId: LAPTOP_ID, quantity: 1, unitPrice: 1 }] }, 'unitPrice'],
      ['total enviado por el cliente', { items: [{ productId: LAPTOP_ID, quantity: 1 }], finalTotal: 1 }, 'finalTotal'],
      ['cupón que no es texto', { items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 30 }, 'couponCode'],
      [
        'cupón con símbolos',
        { items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'DEMO-30' },
        'letras y números',
      ],
      [
        'cupón de más de 32 caracteres',
        { items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'A'.repeat(33) },
        '32',
      ],
      ['más de 50 ítems', { items: Array.from({ length: 51 }, () => ({ productId: LAPTOP_ID, quantity: 1 })) }, '50'],
    ])(
      'debería responder 400 con código CEC_CHECKOUT_1001 cuando el payload tiene %s',
      async (_case, payload, fragment) => {
        const response = await request(app.getHttpServer()).post('/checkout/quote').send(payload).expect(400);
        const apiError = response.body as IApiError;
        expect(apiError.error.code).toBe('CEC_CHECKOUT_1001');
        expect(apiError.error.message).toContain(fragment);
      },
    );

    it('debería responder 400 con código CEC_CHECKOUT_1002 cuando el cuerpo supera 100 KB', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout/quote')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'A'.repeat(OVERSIZED_COUPON_LENGTH) })
        .expect(400);
      expect((response.body as IApiError).error.code).toBe('CEC_CHECKOUT_1002');
    });
  });

  describe('POST /checkout', () => {
    it('debería responder 201 con la orden completa y decrementar el stock cuando la compra es exitosa', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'demo30' })
        .expect(201);
      const order = response.body as IOrder;
      expect(order.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(order.createdAt).toBeGreaterThan(0);
      expect(Number.isInteger(order.createdAt)).toBe(true);
      expect(order.items).toEqual([{ productId: LAPTOP_ID, name: 'Laptop Pro 14', unitPrice: 1299.99, quantity: 1 }]);
      expect(order.couponCode).toBe('DEMO30');
      expect(order.breakdown).toEqual(laptopWithDemoCouponBreakdown);
      expect(order.finalTotal).toBe(844.99);
      expect(await fetchStock(LAPTOP_ID)).toBe(4);
    });

    it('debería registrar couponCode null cuando la compra no lleva cupón', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({ items: [{ productId: COFFEE_MAKER_ID, quantity: 2 }] })
        .expect(201);
      const order = response.body as IOrder;
      expect(order.couponCode).toBeNull();
      expect(order.breakdown).toEqual(twoCoffeeMakersBreakdown);
    });

    it('debería aceptar la compra y dejar el producto en cero cuando la cantidad agota exactamente el stock', async () => {
      await request(app.getHttpServer())
        .post('/checkout')
        .send({ items: [{ productId: DESK_LAMP_ID, quantity: 2 }] })
        .expect(201);
      expect(await fetchStock(DESK_LAMP_ID)).toBe(0);
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({ items: [{ productId: DESK_LAMP_ID, quantity: 1 }] })
        .expect(409);
      expect((response.body as IApiError).error.details).toEqual([
        { productId: DESK_LAMP_ID, requested: 1, available: 0 },
      ]);
    });

    it('debería responder 409 con todos los conflictos y no tocar stock cuando varios ítems exceden el stock', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({
          items: [
            { productId: LAPTOP_ID, quantity: 6 },
            { productId: COFFEE_MAKER_ID, quantity: 1 },
            { productId: DESK_LAMP_ID, quantity: 3 },
          ],
        })
        .expect(409);
      const apiError = response.body as IApiError;
      expect(apiError.error.code).toBe('CEC_CHECKOUT_3001');
      expect(apiError.error.details).toEqual([
        { productId: LAPTOP_ID, requested: 6, available: 5 },
        { productId: DESK_LAMP_ID, requested: 3, available: 2 },
      ]);
      expect(await fetchStock(LAPTOP_ID)).toBe(5);
      expect(await fetchStock(COFFEE_MAKER_ID)).toBe(8);
      expect(await fetchStock(DESK_LAMP_ID)).toBe(2);
      const ordersResponse = await request(app.getHttpServer()).get('/orders').expect(200);
      expect(ordersResponse.body).toEqual([]);
    });

    it('debería responder 400 sin persistir nada cuando el cupón es inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({ items: [{ productId: LAPTOP_ID, quantity: 1 }], couponCode: 'SUMMER2025' })
        .expect(400);
      const apiError = response.body as IApiError;
      expect(apiError.error.code).toBe('CEC_DISCOUNTS_3001');
      expect(apiError.error.message).not.toMatch(/inactivo|inexistente/);
      expect(await fetchStock(LAPTOP_ID)).toBe(5);
      const ordersResponse = await request(app.getHttpServer()).get('/orders').expect(200);
      expect(ordersResponse.body).toEqual([]);
    });

    it('debería responder 404 cuando algún producto no existe', async () => {
      const response = await request(app.getHttpServer())
        .post('/checkout')
        .send({
          items: [
            { productId: LAPTOP_ID, quantity: 1 },
            { productId: UNKNOWN_UUID, quantity: 1 },
          ],
        })
        .expect(404);
      expect((response.body as IApiError).error.code).toBe('CEC_PRODUCTS_3001');
    });

    it('debería responder 400 cuando el carrito está vacío', async () => {
      const response = await request(app.getHttpServer()).post('/checkout').send({ items: [] }).expect(400);
      expect((response.body as IApiError).error.code).toBe('CEC_CHECKOUT_1001');
    });
  });
});
