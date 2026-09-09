/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Puertos */
import type { IOrderRepository } from '../../../domain/ports/order-repository.port';

/** Mocks */
import { laptopWithDemoCouponBreakdownMock } from './discount-engine.mock';
import { laptopProductMock } from './product-repository.mock';

/** Orden representativa: una Laptop Pro 14 comprada con DEMO30 */
export const orderMock: IOrder = {
  id: 'c1a5d8e2-4b3f-4c6a-9d7e-2f8b1a0c3d4e',
  createdAt: 1_789_000_000,
  items: [
    {
      productId: laptopProductMock.id,
      name: laptopProductMock.name,
      unitPrice: laptopProductMock.unitPrice,
      quantity: 1,
    },
  ],
  couponCode: 'DEMO30',
  breakdown: laptopWithDemoCouponBreakdownMock,
  finalTotal: laptopWithDemoCouponBreakdownMock.finalTotal,
};

/**
 * Función que crea un repositorio de órdenes mockeado con las órdenes indicadas
 * @param {IOrder[]} [orders=[orderMock]] - órdenes que devuelve findAll; findById devuelve la primera
 * @returns {jest.Mocked<IOrderRepository>}
 */
export const createOrderRepositoryMock = (orders: IOrder[] = [orderMock]): jest.Mocked<IOrderRepository> => ({
  save: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue(orders),
  findById: jest.fn().mockResolvedValue(orders[0] ?? null),
});
