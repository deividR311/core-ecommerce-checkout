/** Contratos compartidos */
import type { IStockConflict } from '@cec/shared';

/** Error bajo prueba */
import { InsufficientStockError } from './insufficient-stock.error';

/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

describe('InsufficientStockError: cantidades que superan el stock disponible', () => {
  const stockConflicts: IStockConflict[] = [
    { productId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', requested: 6, available: 5 },
    { productId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', requested: 3, available: 2 },
  ];

  it('debería exponer el código de checkout, el nombre de la clase y todos los conflictos cuando se construye', () => {
    const insufficientStockError = new InsufficientStockError(stockConflicts);
    expect(insufficientStockError).toBeInstanceOf(BaseError);
    expect(insufficientStockError.code).toBe(ErrorCodeEnum.CHECKOUT_INSUFFICIENT_STOCK);
    expect(insufficientStockError.name).toBe('InsufficientStockError');
    expect(insufficientStockError.conflicts).toEqual(stockConflicts);
  });

  it('debería usar un mensaje genérico sin identificadores cuando se construye', () => {
    const insufficientStockError = new InsufficientStockError(stockConflicts);
    expect(insufficientStockError.message).toContain('stock');
    expect(insufficientStockError.message).not.toContain(stockConflicts[0].productId);
  });
});
