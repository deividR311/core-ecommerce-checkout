/** Contratos compartidos */
import { DiscountTypeEnum, ProductCategoryEnum } from '@cec/shared';
import type { IDiscountBreakdown } from '@cec/shared';

/** Motor bajo prueba */
import { DiscountEngine } from './discount-engine';

/** Fábrica */
import { DiscountStrategyFactory } from './discount-strategy.factory';

/** Interfaces */
import type { IDiscountContext } from './discount-context.interface';
import type { IDiscountStrategy } from './discount-strategy.interface';

/** Utilidades */
import { createDiscountContext, registerCapAdjustment, registerDiscount } from './discount-context.util';

/** Mocks */
import {
  coffeeMakerItemMock,
  demoCouponMock,
  headphonesItemMock,
  laptopItemMock,
  novelItemMock,
  tShirtItemMock,
  welcomeCouponMock,
} from './mocks/discount-context.mock';

/** Desglose esperado para un carrito sin reglas aplicables ni cupón */
const zeroBreakdownMock: IDiscountBreakdown = {
  originalSubtotal: 0,
  categoryDiscount: 0,
  volumeDiscount: 0,
  couponDiscount: 0,
  capAdjustment: 0,
  totalDiscount: 0,
  effectiveDiscountRate: 0,
  finalTotal: 0,
  isMaxDiscountReached: false,
  isCouponValid: true,
};

/**
 * Función que crea una estrategia mockeada que registra un descuento fijo
 * @param {DiscountTypeEnum} discountType - regla que simula
 * @param {number} discountAmount - monto que registra
 * @returns {jest.Mocked<IDiscountStrategy>}
 */
const createStrategyMock = (
  discountType: DiscountTypeEnum,
  discountAmount: number,
): jest.Mocked<IDiscountStrategy> => ({
  apply: jest.fn((context: IDiscountContext) => registerDiscount(context, discountType, discountAmount)),
});

describe('DiscountEngine: cálculo en cascada del desglose de descuentos', () => {
  const realChainEngine = new DiscountEngine(DiscountStrategyFactory.createChain());
  const hundredSubtotalContext = createDiscountContext([{ ...coffeeMakerItemMock, unitPrice: 100 }], null, null);

  it('debería ejecutar las estrategias mockeadas en orden y encadenar el contexto de una a la siguiente cuando calcula', () => {
    const firstStrategyMock = createStrategyMock(DiscountTypeEnum.CATEGORY, 10);
    const secondStrategyMock = createStrategyMock(DiscountTypeEnum.VOLUME, 5);
    const breakdown = new DiscountEngine([firstStrategyMock, secondStrategyMock]).calculate(hundredSubtotalContext);
    expect(firstStrategyMock.apply.mock.calls[0][0]).toBe(hundredSubtotalContext);
    expect(secondStrategyMock.apply.mock.calls[0][0]).toBe(firstStrategyMock.apply.mock.results[0].value);
    expect(firstStrategyMock.apply.mock.invocationCallOrder[0]).toBeLessThan(
      secondStrategyMock.apply.mock.invocationCallOrder[0],
    );
    expect(breakdown.categoryDiscount).toBe(10);
    expect(breakdown.volumeDiscount).toBe(5);
    expect(breakdown.totalDiscount).toBe(15);
    expect(breakdown.finalTotal).toBe(85);
    expect(breakdown.effectiveDiscountRate).toBe(0.15);
  });

  it('debería devolver el subtotal como total final cuando la cadena está vacía', () => {
    const breakdown = new DiscountEngine([]).calculate(createDiscountContext([coffeeMakerItemMock], null, null));
    expect(breakdown.finalTotal).toBe(45.5);
    expect(breakdown.totalDiscount).toBe(0);
    expect(breakdown.isMaxDiscountReached).toBe(false);
  });

  it('debería marcar el tope alcanzado y la tasa exacta de 0.35 cuando la estrategia de tope mockeada registra un ajuste', () => {
    const capStrategyMock: jest.Mocked<IDiscountStrategy> = {
      apply: jest.fn((context: IDiscountContext) => registerCapAdjustment(context, 5)),
    };
    const engine = new DiscountEngine([createStrategyMock(DiscountTypeEnum.COUPON, 40), capStrategyMock]);
    const breakdown = engine.calculate(hundredSubtotalContext);
    expect(breakdown.couponDiscount).toBe(40);
    expect(breakdown.capAdjustment).toBe(5);
    expect(breakdown.finalTotal).toBe(65);
    expect(breakdown.totalDiscount).toBe(35);
    expect(breakdown.effectiveDiscountRate).toBe(0.35);
    expect(breakdown.isMaxDiscountReached).toBe(true);
  });

  it('debería producir el 27.325% real a dos decimales cuando la laptop se compra con WELCOME2026', () => {
    const breakdown = realChainEngine.calculate(
      createDiscountContext([laptopItemMock], 'WELCOME2026', welcomeCouponMock),
    );
    expect(breakdown).toEqual<IDiscountBreakdown>({
      originalSubtotal: 1299.99,
      categoryDiscount: 130,
      volumeDiscount: 58.5,
      couponDiscount: 166.72,
      capAdjustment: 0,
      totalDiscount: 355.22,
      effectiveDiscountRate: 0.2732,
      finalTotal: 944.77,
      isMaxDiscountReached: false,
      isCouponValid: true,
    });
  });

  it('debería truncar al 35% y conservar los descuentos informativos cuando la laptop se compra con DEMO30', () => {
    const breakdown = realChainEngine.calculate(createDiscountContext([laptopItemMock], 'DEMO30', demoCouponMock));
    expect(breakdown).toEqual<IDiscountBreakdown>({
      originalSubtotal: 1299.99,
      categoryDiscount: 130,
      volumeDiscount: 58.5,
      couponDiscount: 333.45,
      capAdjustment: 66.95,
      totalDiscount: 455,
      effectiveDiscountRate: 0.35,
      finalTotal: 844.99,
      isMaxDiscountReached: true,
      isCouponValid: true,
    });
  });

  it('debería aplicar solo la regla por categoría cuando los auriculares no alcanzan el umbral de volumen', () => {
    const breakdown = realChainEngine.calculate(createDiscountContext([headphonesItemMock], null, null));
    expect(breakdown).toEqual<IDiscountBreakdown>({
      originalSubtotal: 89.99,
      categoryDiscount: 9,
      volumeDiscount: 0,
      couponDiscount: 0,
      capAdjustment: 0,
      totalDiscount: 9,
      effectiveDiscountRate: 0.1,
      finalTotal: 80.99,
      isMaxDiscountReached: false,
      isCouponValid: true,
    });
  });

  it('debería dejar el total igual al subtotal cuando el carrito no tiene tecnología, no supera 100 ni trae cupón', () => {
    const breakdown = realChainEngine.calculate(
      createDiscountContext([coffeeMakerItemMock, tShirtItemMock, novelItemMock], null, null),
    );
    expect(breakdown).toEqual<IDiscountBreakdown>({ ...zeroBreakdownMock, originalSubtotal: 78.24, finalTotal: 78.24 });
  });

  it('debería aplicar solo la regla por volumen cuando seis camisetas superan 100 sin tecnología', () => {
    const breakdown = realChainEngine.calculate(
      createDiscountContext([{ ...tShirtItemMock, quantity: 6 }], null, null),
    );
    expect(breakdown.originalSubtotal).toBe(119.94);
    expect(breakdown.categoryDiscount).toBe(0);
    expect(breakdown.volumeDiscount).toBe(6);
    expect(breakdown.finalTotal).toBe(113.94);
    expect(breakdown.effectiveDiscountRate).toBe(0.05);
  });

  it('debería no aplicar volumen cuando el subtotal post-categoría es exactamente 100', () => {
    const homeItem = { unitPrice: 100, category: ProductCategoryEnum.HOME, quantity: 1 };
    const breakdown = realChainEngine.calculate(createDiscountContext([homeItem], null, null));
    expect(breakdown.volumeDiscount).toBe(0);
    expect(breakdown.finalTotal).toBe(100);
  });

  it('debería marcar el cupón inválido sin aplicar la regla 3 cuando el código no resolvió a un cupón activo', () => {
    const breakdown = realChainEngine.calculate(createDiscountContext([laptopItemMock], 'NOEXISTE', null));
    expect(breakdown.isCouponValid).toBe(false);
    expect(breakdown.couponDiscount).toBe(0);
    expect(breakdown.finalTotal).toBe(1111.49);
  });

  it('debería devolver todos los valores en cero sin lanzar excepción cuando el contexto está vacío', () => {
    expect(realChainEngine.calculate(createDiscountContext([], null, null))).toEqual(zeroBreakdownMock);
  });
});
