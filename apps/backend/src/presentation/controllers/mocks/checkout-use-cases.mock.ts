/** Casos de uso */
import type { ProcessCheckoutUseCase } from '../../../application/use-cases/process-checkout.use-case';
import type { QuoteCartUseCase } from '../../../application/use-cases/quote-cart.use-case';

/** Mocks */
import { laptopWithDemoCouponBreakdownMock } from '../../../application/use-cases/mocks/discount-engine.mock';
import { orderMock } from '../../../application/use-cases/mocks/order-repository.mock';

/**
 * Función que crea un caso de uso de cotización mockeado que devuelve el desglose de referencia
 * @returns {jest.Mocked<Pick<QuoteCartUseCase, 'execute'>>}
 */
export const createQuoteCartUseCaseMock = (): jest.Mocked<Pick<QuoteCartUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue(laptopWithDemoCouponBreakdownMock),
});

/**
 * Función que crea un caso de uso de checkout mockeado que devuelve la orden de referencia
 * @returns {jest.Mocked<Pick<ProcessCheckoutUseCase, 'execute'>>}
 */
export const createProcessCheckoutUseCaseMock = (): jest.Mocked<Pick<ProcessCheckoutUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue(orderMock),
});
