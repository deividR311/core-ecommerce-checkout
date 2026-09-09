/** Error bajo prueba */
import { ProductNotFoundError } from './product-not-found.error';

/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

describe('ProductNotFoundError: producto inexistente en el catálogo', () => {
  const missingProductIds = ['00000000-0000-4000-8000-000000000000', '11111111-1111-4111-8111-111111111111'];

  it('debería exponer el código de productos, el nombre de la clase y los identificadores cuando se construye', () => {
    const productNotFoundError = new ProductNotFoundError(missingProductIds);
    expect(productNotFoundError).toBeInstanceOf(BaseError);
    expect(productNotFoundError).toBeInstanceOf(Error);
    expect(productNotFoundError.code).toBe(ErrorCodeEnum.PRODUCTS_NOT_FOUND);
    expect(productNotFoundError.name).toBe('ProductNotFoundError');
    expect(productNotFoundError.missingProductIds).toEqual(missingProductIds);
  });

  it('debería listar todos los identificadores faltantes en el mensaje cuando faltan varios productos', () => {
    const productNotFoundError = new ProductNotFoundError(missingProductIds);
    expect(productNotFoundError.message).toContain(missingProductIds[0]);
    expect(productNotFoundError.message).toContain(missingProductIds[1]);
  });
});
