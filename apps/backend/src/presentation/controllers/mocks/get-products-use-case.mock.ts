/** Casos de uso */
import type { GetProductsUseCase } from '../../../application/use-cases/get-products.use-case';

/** Mocks */
import { productsMock } from '../../../application/use-cases/mocks/product-repository.mock';

/**
 * Función que crea un caso de uso de consulta del catálogo mockeado
 * @returns {jest.Mocked<Pick<GetProductsUseCase, 'execute'>>}
 */
export const createGetProductsUseCaseMock = (): jest.Mocked<Pick<GetProductsUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue(productsMock),
});
