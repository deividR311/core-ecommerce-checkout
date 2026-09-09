/** Contratos compartidos */
import type { IDiscountBreakdown } from '@cec/shared';

/** Motor de descuentos */
import type { DiscountEngine } from '../../../domain/discounts/discount-engine';

/** Desglose real de una Laptop Pro 14 con DEMO30: la cascada llega a 40.15% y el tope trunca al 35% */
export const laptopWithDemoCouponBreakdownMock: IDiscountBreakdown = {
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
};

/**
 * Función que crea un motor de descuentos mockeado que devuelve siempre el desglose indicado
 * @param {IDiscountBreakdown} [breakdown=laptopWithDemoCouponBreakdownMock] - desglose que devuelve calculate
 * @returns {jest.Mocked<Pick<DiscountEngine, 'calculate'>>}
 */
export const createDiscountEngineMock = (
  breakdown: IDiscountBreakdown = laptopWithDemoCouponBreakdownMock,
): jest.Mocked<Pick<DiscountEngine, 'calculate'>> => ({
  calculate: jest.fn().mockReturnValue(breakdown),
});
