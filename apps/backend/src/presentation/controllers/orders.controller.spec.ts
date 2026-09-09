/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Controlador bajo prueba */
import { OrdersController } from './orders.controller';

/** Casos de uso */
import { GetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case';

/** Errores */
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';

/** Mocks */
import { orderMock } from '../../application/use-cases/mocks/order-repository.mock';
import { createGetOrderByIdUseCaseMock, createGetOrdersUseCaseMock } from './mocks/orders-use-cases.mock';

describe('OrdersController: exposición de la consulta de órdenes por HTTP', () => {
  let ordersController: OrdersController;
  let getOrdersUseCaseMock: ReturnType<typeof createGetOrdersUseCaseMock>;
  let getOrderByIdUseCaseMock: ReturnType<typeof createGetOrderByIdUseCaseMock>;

  beforeEach(async () => {
    getOrdersUseCaseMock = createGetOrdersUseCaseMock();
    getOrderByIdUseCaseMock = createGetOrderByIdUseCaseMock();
    const testingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: GetOrdersUseCase, useValue: getOrdersUseCaseMock },
        { provide: GetOrderByIdUseCase, useValue: getOrderByIdUseCaseMock },
      ],
    }).compile();
    ordersController = testingModule.get(OrdersController);
  });

  it('debería devolver el listado del caso de uso cuando se consulta GET /orders', async () => {
    const orders = await ordersController.getOrders();
    expect(orders).toEqual([orderMock]);
    expect(getOrdersUseCaseMock.execute.mock.calls).toHaveLength(1);
  });

  it('debería devolver un arreglo vacío cuando no hay órdenes', async () => {
    getOrdersUseCaseMock.execute.mockResolvedValue([]);
    expect(await ordersController.getOrders()).toEqual([]);
  });

  it('debería devolver la orden del caso de uso cuando se consulta GET /orders/:id', async () => {
    const order = await ordersController.getOrderById(orderMock.id);
    expect(order).toEqual(orderMock);
    expect(getOrderByIdUseCaseMock.execute.mock.calls).toEqual([[orderMock.id]]);
  });

  it('debería propagar OrderNotFoundError cuando el caso de uso no encuentra la orden', async () => {
    getOrderByIdUseCaseMock.execute.mockRejectedValue(new OrderNotFoundError(orderMock.id));
    await expect(ordersController.getOrderById(orderMock.id)).rejects.toBeInstanceOf(OrderNotFoundError);
  });
});
