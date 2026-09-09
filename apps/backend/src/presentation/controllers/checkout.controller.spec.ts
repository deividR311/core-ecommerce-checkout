/** Dependencias NestJS */
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

/** Controlador bajo prueba */
import { CheckoutController } from './checkout.controller';

/** Casos de uso */
import { ProcessCheckoutUseCase } from '../../application/use-cases/process-checkout.use-case';
import { QuoteCartUseCase } from '../../application/use-cases/quote-cart.use-case';

/** DTOs */
import { CheckoutRequestDto } from '../dto/checkout-request.dto';

/** Mocks */
import { laptopWithDemoCouponBreakdownMock } from '../../application/use-cases/mocks/discount-engine.mock';
import { orderMock } from '../../application/use-cases/mocks/order-repository.mock';
import { laptopProductMock } from '../../application/use-cases/mocks/product-repository.mock';
import { createProcessCheckoutUseCaseMock, createQuoteCartUseCaseMock } from './mocks/checkout-use-cases.mock';

/** Solicitud ya validada por el pipe global */
const checkoutRequest = Object.assign(new CheckoutRequestDto(), {
  items: [{ productId: laptopProductMock.id, quantity: 1 }],
  couponCode: 'DEMO30',
});

describe('CheckoutController: exposición de cotización y checkout por HTTP', () => {
  let checkoutController: CheckoutController;
  let quoteCartUseCaseMock: ReturnType<typeof createQuoteCartUseCaseMock>;
  let processCheckoutUseCaseMock: ReturnType<typeof createProcessCheckoutUseCaseMock>;
  let logSpy: jest.SpyInstance<void, [message: unknown, ...optionalParams: unknown[]]>;

  beforeEach(async () => {
    quoteCartUseCaseMock = createQuoteCartUseCaseMock();
    processCheckoutUseCaseMock = createProcessCheckoutUseCaseMock();
    const testingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        { provide: QuoteCartUseCase, useValue: quoteCartUseCaseMock },
        { provide: ProcessCheckoutUseCase, useValue: processCheckoutUseCaseMock },
      ],
    }).compile();
    checkoutController = testingModule.get(CheckoutController);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería devolver el desglose del caso de uso cuando se cotiza POST /checkout/quote', async () => {
    const breakdown = await checkoutController.quoteCart(checkoutRequest);
    expect(breakdown).toEqual(laptopWithDemoCouponBreakdownMock);
    expect(quoteCartUseCaseMock.execute.mock.calls).toEqual([[checkoutRequest]]);
    expect(processCheckoutUseCaseMock.execute.mock.calls).toHaveLength(0);
  });

  it('debería devolver la orden del caso de uso cuando se procesa POST /checkout', async () => {
    const order = await checkoutController.processCheckout(checkoutRequest);
    expect(order).toEqual(orderMock);
    expect(processCheckoutUseCaseMock.execute.mock.calls).toEqual([[checkoutRequest]]);
    expect(quoteCartUseCaseMock.execute.mock.calls).toHaveLength(0);
  });

  it('debería registrar id y total de la orden sin el payload del cliente cuando el checkout es exitoso', async () => {
    await checkoutController.processCheckout(checkoutRequest);
    expect(logSpy.mock.calls).toHaveLength(1);
    const logMessage = logSpy.mock.calls[0][0] as string;
    expect(logMessage).toContain('CheckoutController > processCheckout');
    expect(logMessage).toContain(orderMock.id);
    expect(logMessage).toContain(String(orderMock.finalTotal));
    expect(logMessage).not.toContain(laptopProductMock.id);
  });

  it('debería propagar el error del caso de uso sin registrar nada cuando el checkout falla', async () => {
    processCheckoutUseCaseMock.execute.mockRejectedValue(new Error('fallo del caso de uso'));
    await expect(checkoutController.processCheckout(checkoutRequest)).rejects.toThrow('fallo del caso de uso');
    expect(logSpy.mock.calls).toHaveLength(0);
  });
});
