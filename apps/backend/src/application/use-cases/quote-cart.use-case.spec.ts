/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Caso de uso bajo prueba */
import { QuoteCartUseCase } from './quote-cart.use-case';

/** Motor de descuentos */
import { DiscountEngine } from '../../domain/discounts/discount-engine';

/** Errores */
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Servicios de aplicación */
import { CartResolver } from '../services/cart-resolver.service';

/** Mocks */
import { demoCouponMock } from '../../domain/discounts/mocks/discount-context.mock';
import {
  createCartResolverMock,
  demoCouponResolvedMock,
  invalidCouponResolvedMock,
  laptopResolvedCartMock,
} from './mocks/cart-resolver.mock';
import { createDiscountEngineMock, laptopWithDemoCouponBreakdownMock } from './mocks/discount-engine.mock';
import { laptopProductMock } from './mocks/product-repository.mock';

/** UUID con formato válido que no existe en el catálogo */
const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('QuoteCartUseCase: cotización del carrito sin mutar estado', () => {
  let quoteCartUseCase: QuoteCartUseCase;
  let cartResolverMock: ReturnType<typeof createCartResolverMock>;
  let discountEngineMock: ReturnType<typeof createDiscountEngineMock>;

  /**
   * Función que arma el módulo de prueba con los mocks indicados
   * @param {ReturnType<typeof createCartResolverMock>} cartResolver - resolver mockeado
   * @returns {Promise<void>}
   */
  const buildUseCase = async (cartResolver: ReturnType<typeof createCartResolverMock>): Promise<void> => {
    cartResolverMock = cartResolver;
    discountEngineMock = createDiscountEngineMock();
    const testingModule = await Test.createTestingModule({
      providers: [
        QuoteCartUseCase,
        { provide: CartResolver, useValue: cartResolverMock },
        { provide: DiscountEngine, useValue: discountEngineMock },
      ],
    }).compile();
    quoteCartUseCase = testingModule.get(QuoteCartUseCase);
  };

  it('debería devolver el desglose del motor cuando se cotiza con cupón válido', async () => {
    await buildUseCase(createCartResolverMock(laptopResolvedCartMock, demoCouponResolvedMock));
    const breakdown = await quoteCartUseCase.execute({
      items: [{ productId: laptopProductMock.id, quantity: 1 }],
      couponCode: 'DEMO30',
    });
    expect(breakdown).toBe(laptopWithDemoCouponBreakdownMock);
    const discountContext = discountEngineMock.calculate.mock.calls[0][0];
    expect(discountContext.items).toEqual(laptopResolvedCartMock.discountableItems);
    expect(discountContext.couponCode).toBe('DEMO30');
    expect(discountContext.coupon).toEqual(demoCouponMock);
    expect(discountContext.originalSubtotal).toBe(1299.99);
  });

  it('debería armar el contexto sin cupón cuando la solicitud no lo envía', async () => {
    await buildUseCase(createCartResolverMock());
    await quoteCartUseCase.execute({ items: [{ productId: laptopProductMock.id, quantity: 1 }] });
    const discountContext = discountEngineMock.calculate.mock.calls[0][0];
    expect(discountContext.couponCode).toBeNull();
    expect(discountContext.coupon).toBeNull();
    expect(cartResolverMock.resolveCoupon.mock.calls[0][0]).toBeUndefined();
  });

  it('debería tolerar el cupón inválido y pasar el código con cupón nulo al motor cuando no resuelve', async () => {
    await buildUseCase(createCartResolverMock(laptopResolvedCartMock, invalidCouponResolvedMock));
    const breakdown = await quoteCartUseCase.execute({
      items: [{ productId: laptopProductMock.id, quantity: 1 }],
      couponCode: 'NOEXISTE',
    });
    expect(breakdown).toBe(laptopWithDemoCouponBreakdownMock);
    const discountContext = discountEngineMock.calculate.mock.calls[0][0];
    expect(discountContext.couponCode).toBe('NOEXISTE');
    expect(discountContext.coupon).toBeNull();
  });

  it('debería delegar la consolidación al resolver con los ítems tal como llegan cuando hay productos repetidos', async () => {
    await buildUseCase(createCartResolverMock());
    const cartItems = [
      { productId: laptopProductMock.id, quantity: 1 },
      { productId: laptopProductMock.id, quantity: 1 },
    ];
    await quoteCartUseCase.execute({ items: cartItems });
    expect(cartResolverMock.resolveItems.mock.calls[0][0]).toEqual(cartItems);
  });

  it('debería propagar ProductNotFoundError sin invocar el motor cuando un producto no existe', async () => {
    await buildUseCase(createCartResolverMock());
    cartResolverMock.resolveItems.mockRejectedValue(new ProductNotFoundError([UNKNOWN_UUID]));
    await expect(
      quoteCartUseCase.execute({ items: [{ productId: UNKNOWN_UUID, quantity: 1 }] }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(discountEngineMock.calculate.mock.calls).toHaveLength(0);
  });
});
