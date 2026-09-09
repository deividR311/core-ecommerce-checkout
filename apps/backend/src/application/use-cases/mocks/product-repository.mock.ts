/** Contratos compartidos */
import { ProductCategoryEnum } from '@cec/shared';
import type { IProduct } from '@cec/shared';

/** Puertos */
import type { IProductRepository } from '../../../domain/ports/product-repository.port';

/** Productos representativos del catálogo para las pruebas de aplicación y presentación */
export const productsMock: IProduct[] = [
  {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Laptop Pro 14',
    unitPrice: 1299.99,
    category: ProductCategoryEnum.TECHNOLOGY,
    stock: 5,
  },
  {
    id: '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e',
    name: 'Cafetera de Goteo',
    unitPrice: 45.5,
    category: ProductCategoryEnum.HOME,
    stock: 8,
  },
];

/**
 * Función que crea un repositorio de productos mockeado que responde con el catálogo de prueba
 * @param {IProduct[]} [products=productsMock] - catálogo que devuelve findAll
 * @returns {jest.Mocked<IProductRepository>}
 */
export const createProductRepositoryMock = (products: IProduct[] = productsMock): jest.Mocked<IProductRepository> => ({
  findAll: jest.fn().mockResolvedValue(products),
  findByIds: jest.fn().mockResolvedValue(products),
  decrementStock: jest.fn().mockResolvedValue(true),
});
