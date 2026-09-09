/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Caso de uso bajo prueba */
import { GetProductsUseCase } from './get-products.use-case';

/** Puertos */
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Mocks */
import { createProductRepositoryMock, productsMock } from './mocks/product-repository.mock';

describe('GetProductsUseCase: consulta del catálogo a través del puerto', () => {
  let getProductsUseCase: GetProductsUseCase;
  let productRepositoryMock: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    productRepositoryMock = createProductRepositoryMock();
    const testingModule = await Test.createTestingModule({
      providers: [GetProductsUseCase, { provide: PRODUCT_REPOSITORY, useValue: productRepositoryMock }],
    }).compile();
    getProductsUseCase = testingModule.get(GetProductsUseCase);
  });

  it('debería devolver los productos del repositorio cuando se ejecuta el caso de uso', async () => {
    const products = await getProductsUseCase.execute();
    expect(products).toEqual(productsMock);
    expect(productRepositoryMock.findAll.mock.calls).toHaveLength(1);
  });

  it('debería devolver un arreglo vacío sin error cuando el catálogo está vacío', async () => {
    productRepositoryMock.findAll.mockResolvedValue([]);
    expect(await getProductsUseCase.execute()).toEqual([]);
  });

  it('debería no invocar operaciones de escritura cuando se consulta el catálogo', async () => {
    await getProductsUseCase.execute();
    expect(productRepositoryMock.decrementStock.mock.calls).toHaveLength(0);
  });
});
