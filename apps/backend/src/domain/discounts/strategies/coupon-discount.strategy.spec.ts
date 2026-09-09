/** Contratos compartidos */
import { DiscountTypeEnum } from '@cec/shared';

/** Estrategia bajo prueba */
import { CouponDiscountStrategy } from './coupon-discount.strategy';

/** Mocks */
import { createDiscountContextMock, inactiveCouponMock, welcomeCouponMock } from '../mocks/discount-context.mock';

describe('CouponDiscountStrategy: regla del porcentaje del cupón sobre el total acumulado', () => {
  const strategy = new CouponDiscountStrategy();

  it('debería descontar el 15% del total acumulado cuando el cupón WELCOME2026 está resuelto y activo', () => {
    const initialContext = createDiscountContextMock({
      originalSubtotal: 200,
      currentTotal: 200,
      couponCode: 'WELCOME2026',
      coupon: welcomeCouponMock,
    });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.COUPON, amount: 30 }]);
    expect(resultContext.currentTotal).toBe(170);
  });

  it('debería registrar descuento cero cuando el código no resolvió a ningún cupón', () => {
    const initialContext = createDiscountContextMock({
      originalSubtotal: 200,
      currentTotal: 200,
      couponCode: 'NOEXISTE',
      coupon: null,
    });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.COUPON, amount: 0 }]);
    expect(resultContext.currentTotal).toBe(200);
  });

  it('debería registrar descuento cero cuando el cupón resuelto está inactivo', () => {
    const initialContext = createDiscountContextMock({
      originalSubtotal: 200,
      currentTotal: 200,
      couponCode: 'SUMMER2025',
      coupon: inactiveCouponMock,
    });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext.appliedDiscounts[0].amount).toBe(0);
    expect(resultContext.currentTotal).toBe(200);
  });

  it('debería registrar descuento cero cuando el cliente no envió cupón', () => {
    const resultContext = strategy.apply(createDiscountContextMock({ originalSubtotal: 200, currentTotal: 200 }));
    expect(resultContext.appliedDiscounts[0].amount).toBe(0);
    expect(resultContext.currentTotal).toBe(200);
  });

  it('debería operar sobre el total tras las reglas anteriores cuando el contexto ya trae descuentos', () => {
    const initialContext = createDiscountContextMock({
      originalSubtotal: 200,
      currentTotal: 171,
      couponCode: 'WELCOME2026',
      coupon: welcomeCouponMock,
    });
    const resultContext = strategy.apply(initialContext);
    expect(resultContext.appliedDiscounts[0].amount).toBeCloseTo(25.65, 10);
    expect(resultContext.currentTotal).toBeCloseTo(145.35, 10);
    expect(initialContext.currentTotal).toBe(171);
  });
});
