/** Dependencias NestJS */
import type { NestExpressApplication } from '@nestjs/platform-express';

/** Dependencias de pruebas */
import request from 'supertest';

/** Contratos compartidos */
import type { IApiError, IOrder, IProduct } from '@cec/shared';

/** Utilidades de prueba */
import { COFFEE_MAKER_ID, HEADPHONES_ID, UNKNOWN_UUID, createTestingApp } from './testing-app.util';

/** Campos exactos que expone el contrato IOrder; los endpoints no deben filtrar campos internos */
const ORDER_CONTRACT_FIELDS = ['id', 'createdAt', 'items', 'couponCode', 'breakdown', 'finalTotal'];

describe('OrdersController (e2e): consulta de órdenes procesadas', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestingApp();
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Función que procesa una compra de una unidad del producto indicado y devuelve la orden creada
   * @param {string} productId - producto a comprar
   * @returns {Promise<IOrder>}
   */
  const checkoutOneUnit = async (productId: string): Promise<IOrder> => {
    const response = await request(app.getHttpServer())
      .post('/checkout')
      .send({ items: [{ productId, quantity: 1 }] })
      .expect(201);
    return response.body as IOrder;
  };

  it('debería responder 200 con un arreglo vacío cuando no se ha procesado ninguna orden', async () => {
    const response = await request(app.getHttpServer()).get('/orders').expect(200);
    expect(response.body).toEqual([]);
  });

  it('debería listar las órdenes de la más reciente a la más antigua cuando se procesan dos compras', async () => {
    const firstOrder = await checkoutOneUnit(COFFEE_MAKER_ID);
    const secondOrder = await checkoutOneUnit(HEADPHONES_ID);
    const response = await request(app.getHttpServer()).get('/orders').expect(200);
    const orders = response.body as IOrder[];
    expect(orders.map(order => order.id)).toEqual([secondOrder.id, firstOrder.id]);
    expect(orders[0]).toEqual(secondOrder);
    expect(orders[1]).toEqual(firstOrder);
  });

  it('debería devolver la orden persistida con el stock ya decrementado cuando se completa el flujo de compra', async () => {
    const createdOrder = await checkoutOneUnit(HEADPHONES_ID);
    const orderResponse = await request(app.getHttpServer()).get(`/orders/${createdOrder.id}`).expect(200);
    expect(orderResponse.body).toEqual(createdOrder);
    expect(Object.keys(orderResponse.body as IOrder).sort()).toEqual([...ORDER_CONTRACT_FIELDS].sort());
    const productsResponse = await request(app.getHttpServer()).get('/products').expect(200);
    const headphones = (productsResponse.body as IProduct[]).find(product => product.id === HEADPHONES_ID);
    expect(headphones?.stock).toBe(9);
  });

  it('debería responder 404 con el formato estándar cuando la orden no existe', async () => {
    const response = await request(app.getHttpServer()).get(`/orders/${UNKNOWN_UUID}`).expect(404);
    const apiError = response.body as IApiError;
    expect(apiError.error.code).toBe('CEC_ORDERS_3001');
    expect(apiError.error.details).toBeUndefined();
  });

  it('debería responder 400 y no 500 cuando el identificador no tiene formato UUID', async () => {
    const response = await request(app.getHttpServer()).get('/orders/orden-123').expect(400);
    const apiError = response.body as IApiError;
    expect(apiError.error.code).toBe('CEC_ORDERS_1001');
    expect(apiError.error.message).toContain('UUID');
  });
});
