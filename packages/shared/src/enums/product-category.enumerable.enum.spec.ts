/** Enumerable bajo prueba */
import { ProductCategoryEnum } from './product-category.enumerable.enum';

describe('ProductCategoryEnum: categorías de producto del catálogo', () => {
  it('debería exponer las cuatro categorías del catálogo cuando se recorren sus valores', () => {
    expect(Object.values(ProductCategoryEnum)).toEqual(['TECHNOLOGY', 'HOME', 'CLOTHING', 'BOOKS']);
  });

  it('debería serializar la categoría de tecnología con su propio nombre cuando viaja en el JSON', () => {
    expect(ProductCategoryEnum.TECHNOLOGY).toBe('TECHNOLOGY');
  });
});
