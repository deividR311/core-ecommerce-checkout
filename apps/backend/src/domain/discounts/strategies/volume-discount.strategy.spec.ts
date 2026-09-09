/** Contratos compartidos */
import { DiscountTypeEnum, ProductCategoryEnum } from '@cec/shared';

/** Estrategia bajo prueba */
import { VolumeDiscountStrategy } from './volume-discount.strategy';

/** Estrategias */
import { CategoryDiscountStrategy } from './category-discount.strategy';

/** Utilidades */
import { createDiscountContext } from '../discount-context.util';

/** Mocks */
import { createDiscountContextMock } from '../mocks/discount-context.mock';

describe('VolumeDiscountStrategy: regla del 5% cuando el total supera estrictamente 100', () => {
  const strategy = new VolumeDiscountStrategy();

  it('debería registrar descuento cero cuando el total acumulado está por debajo de 100', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal: 80, currentTotal: 80 }));
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.VOLUME, amount: 0 }]);
    expect(resultContext.currentTotal).toBe(80);
  });

  it('debería registrar descuento cero cuando el total acumulado es exactamente 100', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal: 100, currentTotal: 100 }));
    expect(resultContext.appliedDiscounts[0].amount).toBe(0);
    expect(resultContext.currentTotal).toBe(100);
  });

  it('debería descontar el 5% de todo el carrito cuando el total acumulado supera 100', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal: 200, currentTotal: 200 }));
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.VOLUME, amount: 10 }]);
    expect(resultContext.currentTotal).toBe(190);
  });

  it('debería no aplicar cuando la regla por categoría deja el subtotal de 110 por debajo de 100', () => {
    const technologyItem = { unitPrice: 110, category: ProductCategoryEnum.TECHNOLOGY, quantity: 1 };
    const postCategoryContext = new CategoryDiscountStrategy().apply(
      createDiscountContext([technologyItem], null, null),
    );
    const resultContext = strategy.apply(postCategoryContext);
    expect(postCategoryContext.currentTotal).toBeCloseTo(99, 10);
    expect(resultContext.appliedDiscounts[1]).toEqual({ type: DiscountTypeEnum.VOLUME, amount: 0 });
    expect(resultContext.currentTotal).toBeCloseTo(99, 10);
  });

  it('debería devolver un contexto nuevo cuando aplica la regla sin mutar el recibido', () => {
    const initialContext = createDiscountContextMock({ originalSubtotal: 200, currentTotal: 200 });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext).not.toBe(initialContext);
    expect(initialContext.currentTotal).toBe(200);
  });
});
