/** Contratos compartidos */
import { DiscountTypeEnum, MAX_DISCOUNT_RATE } from '@cec/shared';

/** Estrategia bajo prueba */
import { MaxDiscountCapStrategy } from './max-discount-cap.strategy';

/** Mocks */
import { createDiscountContextMock } from '../mocks/discount-context.mock';

describe('MaxDiscountCapStrategy: tope absoluto del 35% sobre el subtotal original', () => {
  const strategy = new MaxDiscountCapStrategy();
  const originalSubtotal = 100;

  it('debería registrar ajuste cero cuando el descuento acumulado está por debajo del 35%', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal, currentTotal: 80 }));
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.CAP, amount: 0 }]);
    expect(resultContext.currentTotal).toBe(80);
  });

  it('debería no truncar cuando el descuento acumulado es exactamente el 35%', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal, currentTotal: 65 }));
    expect(resultContext.appliedDiscounts[0].amount).toBe(0);
    expect(resultContext.currentTotal).toBe(65);
  });

  it('debería truncar exactamente al 35% cuando el descuento acumulado lo supera', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal, currentTotal: 59.85 }));
    expect(resultContext.appliedDiscounts[0].type).toBe(DiscountTypeEnum.CAP);
    expect(resultContext.appliedDiscounts[0].amount).toBeCloseTo(5.15, 10);
    expect(resultContext.currentTotal).toBeCloseTo(65, 10);
  });

  it('debería dejar el total final nunca por debajo del 65% cuando el descuento acumulado es extremo', () => {
    const extremeTotals = [0, 10, 50, 64.99];
    extremeTotals.forEach(extremeTotal => {
      const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal, currentTotal: extremeTotal }));
      expect(resultContext.currentTotal).toBeCloseTo(originalSubtotal * (1 - MAX_DISCOUNT_RATE), 10);
    });
  });

  it('debería devolver todo en cero cuando el contexto está vacío', () => {
    const resultContext = strategy.apply(createDiscountContextMock({}));
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.CAP, amount: 0 }]);
    expect(resultContext.currentTotal).toBe(0);
  });

  it('debería devolver un contexto nuevo cuando trunca sin mutar el recibido', () => {
    const initialContext = createDiscountContextMock({ originalSubtotal, currentTotal: 50 });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext).not.toBe(initialContext);
    expect(initialContext.currentTotal).toBe(50);
  });
});
