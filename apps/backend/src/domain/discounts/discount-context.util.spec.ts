/** Contratos compartidos */
import { DiscountTypeEnum } from '@cec/shared';

/** Utilidades bajo prueba */
import {
  createDiscountContext,
  findDiscountAmount,
  registerCapAdjustment,
  registerDiscount,
  sumItemsSubtotal,
} from './discount-context.util';

/** Mocks */
import { coffeeMakerItemMock, headphonesItemMock, welcomeCouponMock } from './mocks/discount-context.mock';

describe('discountContextUtil: construcción y evolución inmutable del contexto de descuentos', () => {
  it('debería sumar precio por cantidad cuando se calcula el subtotal de varios ítems', () => {
    const doubleHeadphones = { ...headphonesItemMock, quantity: 2 };
    expect(sumItemsSubtotal([doubleHeadphones, coffeeMakerItemMock])).toBeCloseTo(225.48, 10);
  });

  it('debería retornar cero cuando se calcula el subtotal sin ítems', () => {
    expect(sumItemsSubtotal([])).toBe(0);
  });

  it('debería iniciar el total acumulado igual al subtotal original y sin descuentos cuando se crea el contexto', () => {
    const context = createDiscountContext([headphonesItemMock, coffeeMakerItemMock], 'WELCOME2026', welcomeCouponMock);
    expect(context.originalSubtotal).toBeCloseTo(135.49, 10);
    expect(context.currentTotal).toBe(context.originalSubtotal);
    expect(context.appliedDiscounts).toEqual([]);
    expect(context.couponCode).toBe('WELCOME2026');
    expect(context.coupon).toEqual(welcomeCouponMock);
  });

  it('debería copiar los ítems cuando se crea el contexto para que el origen no lo altere', () => {
    const sourceItems = [{ ...headphonesItemMock }];
    const context = createDiscountContext(sourceItems, null, null);
    sourceItems[0].quantity = 5;
    expect(context.items[0].quantity).toBe(1);
  });

  it('debería restar el monto del total y registrar el descuento cuando se registra una regla', () => {
    const initialContext = createDiscountContext([coffeeMakerItemMock], null, null);
    const updatedContext = registerDiscount(initialContext, DiscountTypeEnum.CATEGORY, 5.5);
    expect(updatedContext.currentTotal).toBeCloseTo(40, 10);
    expect(updatedContext.appliedDiscounts).toEqual([{ type: DiscountTypeEnum.CATEGORY, amount: 5.5 }]);
    expect(initialContext.currentTotal).toBe(45.5);
    expect(initialContext.appliedDiscounts).toEqual([]);
  });

  it('debería sumar el ajuste al total y registrarlo como tope cuando se registra el ajuste del tope', () => {
    const initialContext = createDiscountContext([coffeeMakerItemMock], null, null);
    const discountedContext = registerDiscount(initialContext, DiscountTypeEnum.COUPON, 20);
    const cappedContext = registerCapAdjustment(discountedContext, 4.075);
    expect(cappedContext.currentTotal).toBeCloseTo(29.575, 10);
    expect(cappedContext.appliedDiscounts).toEqual([
      { type: DiscountTypeEnum.COUPON, amount: 20 },
      { type: DiscountTypeEnum.CAP, amount: 4.075 },
    ]);
  });

  it('debería retornar el monto registrado cuando se consulta una regla aplicada y cero cuando no dejó registro', () => {
    const context = registerDiscount(
      createDiscountContext([coffeeMakerItemMock], null, null),
      DiscountTypeEnum.VOLUME,
      2,
    );
    expect(findDiscountAmount(context, DiscountTypeEnum.VOLUME)).toBe(2);
    expect(findDiscountAmount(context, DiscountTypeEnum.COUPON)).toBe(0);
  });
});
