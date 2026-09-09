/** Contratos compartidos */
import { ProductCategoryEnum } from '@cec/shared';
import type { IProduct } from '@cec/shared';

/**
 * Catálogo semilla que se carga al iniciar la aplicación y se restaura en cada reinicio.
 * Los identificadores son UUID v4 fijos para que la demo y las pruebas e2e sean reproducibles.
 * Cubre los escenarios de la demo: dos productos de Tecnología (uno de alto valor que activa la regla por volumen
 * y, con el cupón de demostración, supera el tope del 35%), productos de las demás categorías y uno con stock bajo.
 */
export const PRODUCTS_SEED: readonly IProduct[] = [
  {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Laptop Pro 14',
    unitPrice: 1299.99,
    category: ProductCategoryEnum.TECHNOLOGY,
    stock: 5,
  },
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    name: 'Auriculares Inalámbricos',
    unitPrice: 89.99,
    category: ProductCategoryEnum.TECHNOLOGY,
    stock: 10,
  },
  {
    id: '9b2c1d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e',
    name: 'Cafetera de Goteo',
    unitPrice: 45.5,
    category: ProductCategoryEnum.HOME,
    stock: 8,
  },
  {
    id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Lámpara de Escritorio',
    unitPrice: 24.9,
    category: ProductCategoryEnum.HOME,
    stock: 2,
  },
  {
    id: '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
    name: 'Camiseta Básica',
    unitPrice: 19.99,
    category: ProductCategoryEnum.CLOTHING,
    stock: 20,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Novela Clásica',
    unitPrice: 12.75,
    category: ProductCategoryEnum.BOOKS,
    stock: 15,
  },
];
