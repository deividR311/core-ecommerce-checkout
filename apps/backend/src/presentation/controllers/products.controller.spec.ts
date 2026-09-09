/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Controlador bajo prueba */
import { ProductsController } from './products.controller';

/** Casos de uso */
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

/** Mocks */
import { productsMock } from '../../application/use-cases/mocks/product-repository.mock';
import { createGetProductsUseCaseMock } from './mocks/get-products-use-case.mock';

describe('ProductsController: exposición del catálogo por HTTP', () => {
  let productsController: ProductsController;
  let getProductsUseCaseMock: ReturnType<typeof createGetProductsUseCaseMock>;

  beforeEach(async () => {
    getProductsUseCaseMock = createGetProductsUseCaseMock();
    const testingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: GetProductsUseCase, useValue: getProductsUseCaseMock }],
    }).compile();
    productsController = testingModule.get(ProductsController);
  });

  it('debería devolver el catálogo del caso de uso cuando se consulta GET /products', async () => {
    const products = await productsController.getProducts();
    expect(products).toEqual(productsMock);
    expect(getProductsUseCaseMock.execute).toHaveBeenCalledTimes(1);
  });

  it('debería devolver un arreglo vacío cuando el caso de uso no tiene productos', async () => {
    getProductsUseCaseMock.execute.mockResolvedValue([]);
    expect(await productsController.getProducts()).toEqual([]);
  });
});
