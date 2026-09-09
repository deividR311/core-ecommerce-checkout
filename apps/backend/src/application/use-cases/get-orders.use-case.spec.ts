/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Caso de uso bajo prueba */
import { GetOrdersUseCase } from './get-orders.use-case';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';

/** Mocks */
import { createOrderRepositoryMock, orderMock } from './mocks/order-repository.mock';

/** Segunda orden, más reciente que la primera */
const newerOrderMock = { ...orderMock, id: 'd2b6e9f3-5c4a-4d7b-8e9f-3a9c2b1d4e5f', couponCode: null };

describe('GetOrdersUseCase: listado de órdenes a través del puerto', () => {
  let getOrdersUseCase: GetOrdersUseCase;
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    orderRepositoryMock = createOrderRepositoryMock([newerOrderMock, orderMock]);
    const testingModule = await Test.createTestingModule({
      providers: [GetOrdersUseCase, { provide: ORDER_REPOSITORY, useValue: orderRepositoryMock }],
    }).compile();
    getOrdersUseCase = testingModule.get(GetOrdersUseCase);
  });

  it('debería devolver las órdenes en el orden que entrega el repositorio cuando se ejecuta', async () => {
    const orders = await getOrdersUseCase.execute();
    expect(orders).toEqual([newerOrderMock, orderMock]);
    expect(orderRepositoryMock.findAll.mock.calls).toHaveLength(1);
  });

  it('debería devolver un arreglo vacío sin error cuando no hay órdenes', async () => {
    orderRepositoryMock.findAll.mockResolvedValue([]);
    expect(await getOrdersUseCase.execute()).toEqual([]);
  });

  it('debería no invocar operaciones de escritura cuando se listan las órdenes', async () => {
    await getOrdersUseCase.execute();
    expect(orderRepositoryMock.save.mock.calls).toHaveLength(0);
  });
});
