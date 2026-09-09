/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Caso de uso bajo prueba */
import { GetOrderByIdUseCase } from './get-order-by-id.use-case';

/** Errores */
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';

/** Mocks */
import { createOrderRepositoryMock, orderMock } from './mocks/order-repository.mock';

/** UUID con formato válido que no corresponde a ninguna orden */
const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('GetOrderByIdUseCase: consulta de una orden por identificador', () => {
  let getOrderByIdUseCase: GetOrderByIdUseCase;
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    orderRepositoryMock = createOrderRepositoryMock();
    const testingModule = await Test.createTestingModule({
      providers: [GetOrderByIdUseCase, { provide: ORDER_REPOSITORY, useValue: orderRepositoryMock }],
    }).compile();
    getOrderByIdUseCase = testingModule.get(GetOrderByIdUseCase);
  });

  it('debería devolver la orden del repositorio cuando el identificador existe', async () => {
    const order = await getOrderByIdUseCase.execute(orderMock.id);
    expect(order).toEqual(orderMock);
    expect(orderRepositoryMock.findById.mock.calls[0][0]).toBe(orderMock.id);
  });

  it('debería lanzar OrderNotFoundError con el identificador cuando la orden no existe', async () => {
    orderRepositoryMock.findById.mockResolvedValue(null);
    const rejection = getOrderByIdUseCase.execute(UNKNOWN_UUID);
    await expect(rejection).rejects.toBeInstanceOf(OrderNotFoundError);
    await expect(rejection).rejects.toMatchObject({ orderId: UNKNOWN_UUID });
  });
});
