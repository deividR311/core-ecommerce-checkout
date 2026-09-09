/** Contratos compartidos */
import { ProductCategoryEnum } from '@cec/shared';
import type { IProduct } from '@cec/shared';

/** Puertos */
import type { IProductRepository } from '../../../domain/ports/product-repository.port';

/** Productos de la semilla del catálogo para las pruebas de aplicación y presentación */
export const laptopProductMock: IProduct = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  name: 'Laptop Pro 14',
  unitPrice: 1299.99,
  category: ProductCategoryEnum.TECHNOLOGY,
  stock: 5,
};
export const coffeeMakerProductMock: IProduct = {
  id: '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e',
  name: 'Cafetera de Goteo',
  unitPrice: 45.5,
  category: ProductCategoryEnum.HOME,
  stock: 8,
};
export const deskLampProductMock: IProduct = {
  id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'Lámpara de Escritorio',
  unitPrice: 24.9,
  category: ProductCategoryEnum.HOME,
  stock: 2,
};

/** Catálogo representativo que devuelven findAll y findByIds por defecto */
export const productsMock: IProduct[] = [laptopProductMock, coffeeMakerProductMock];

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
