/** Casos de uso */
import type { GetOrderByIdUseCase } from '../../../application/use-cases/get-order-by-id.use-case';
import type { GetOrdersUseCase } from '../../../application/use-cases/get-orders.use-case';

/** Mocks */
import { orderMock } from '../../../application/use-cases/mocks/order-repository.mock';

/**
 * Función que crea un caso de uso de listado de órdenes mockeado
 * @returns {jest.Mocked<Pick<GetOrdersUseCase, 'execute'>>}
 */
export const createGetOrdersUseCaseMock = (): jest.Mocked<Pick<GetOrdersUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue([orderMock]),
});

/**
 * Función que crea un caso de uso de consulta de una orden mockeado
 * @returns {jest.Mocked<Pick<GetOrderByIdUseCase, 'execute'>>}
 */
export const createGetOrderByIdUseCaseMock = (): jest.Mocked<Pick<GetOrderByIdUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue(orderMock),
});
