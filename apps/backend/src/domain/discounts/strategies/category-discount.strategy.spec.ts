/** Contratos compartidos */
import { DiscountTypeEnum } from '@cec/shared';

/** Estrategia bajo prueba */
import { CategoryDiscountStrategy } from './category-discount.strategy';

/** Utilidades */
import { createDiscountContext } from '../discount-context.util';

/** Mocks */
import { coffeeMakerItemMock, headphonesItemMock, laptopItemMock, novelItemMock } from '../mocks/discount-context.mock';

describe('CategoryDiscountStrategy: regla del 10% sobre ítems de tecnología', () => {
  const strategy = new CategoryDiscountStrategy();

  it('debería descontar el 10% del ítem cuando el carrito solo tiene tecnología', () => {
    const resultContext = strategy.apply(createDiscountContext([laptopItemMock], null, null));
    expect(resultContext.appliedDiscounts).toHaveLength(1);
    expect(resultContext.appliedDiscounts[0].type).toBe(DiscountTypeEnum.CATEGORY);
    expect(resultContext.appliedDiscounts[0].amount).toBeCloseTo(129.999, 10);
    expect(resultContext.currentTotal).toBeCloseTo(1169.991, 10);
  });

  it('debería descontar solo sobre los ítems de tecnología cuando el carrito es mixto', () => {
    const resultContext = strategy.apply(createDiscountContext([headphonesItemMock, coffeeMakerItemMock], null, null));
    expect(resultContext.appliedDiscounts[0].amount).toBeCloseTo(8.999, 10);
    expect(resultContext.currentTotal).toBeCloseTo(126.491, 10);
  });

  it('debería registrar descuento cero cuando el carrito no tiene tecnología', () => {
    const resultContext = strategy.apply(createDiscountContext([coffeeMakerItemMock, novelItemMock], null, null));
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.CATEGORY, amount: 0 }]);
    expect(resultContext.currentTotal).toBe(resultContext.originalSubtotal);
  });

  it('debería multiplicar por la cantidad cuando el ítem de tecnología tiene más de una unidad', () => {
    const doubleHeadphones = { ...headphonesItemMock, quantity: 2 };
    const resultContext = strategy.apply(createDiscountContext([doubleHeadphones], null, null));
    expect(resultContext.appliedDiscounts[0].amount).toBeCloseTo(17.998, 10);
  });

  it('debería devolver un contexto nuevo cuando aplica la regla sin mutar el recibido', () => {
    const initialContext = createDiscountContext([laptopItemMock], null, null);
    const resultContext = strategy.apply(initialContext);
    expect(resultContext).not.toBe(initialContext);
    expect(initialContext.appliedDiscounts).toEqual([]);
    expect(initialContext.currentTotal).toBe(1299.99);
  });
});
