/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Contratos compartidos */
import type { IOrder, IStockConflict } from '@cec/shared';

/** Caso de uso bajo prueba */
import { ProcessCheckoutUseCase } from './process-checkout.use-case';

/** Motor de descuentos */
import { DiscountEngine } from '../../domain/discounts/discount-engine';

/** Errores */
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { InvalidCouponError } from '../../domain/errors/invalid-coupon.error';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Servicios de dominio */
import { StockValidator } from '../../domain/services/stock-validator';

/** Servicios de aplicación */
import { CartResolver } from '../services/cart-resolver.service';
import type { IResolvedCoupon } from '../services/resolved-cart.interface';

/** Mocks */
import {
  createCartResolverMock,
  demoCouponResolvedMock,
  invalidCouponResolvedMock,
  laptopResolvedCartMock,
  noCouponResolvedMock,
} from './mocks/cart-resolver.mock';
import { createDiscountEngineMock, laptopWithDemoCouponBreakdownMock } from './mocks/discount-engine.mock';
import { createOrderRepositoryMock } from './mocks/order-repository.mock';
import { createProductRepositoryMock, laptopProductMock } from './mocks/product-repository.mock';
import { createStockValidatorMock } from './mocks/stock-validator.mock';

/** Patrón de UUID v4 */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Tolerancia en segundos entre la fecha de la orden y el reloj de la prueba */
const CREATED_AT_TOLERANCE_SECONDS = 5;
const MILLISECONDS_PER_SECOND = 1000;

/** Solicitud de referencia: una Laptop Pro 14 con DEMO30 */
const laptopCheckoutRequest = { items: [{ productId: laptopProductMock.id, quantity: 1 }], couponCode: 'DEMO30' };

describe('ProcessCheckoutUseCase: procesamiento del checkout en orden garantizado', () => {
  let processCheckoutUseCase: ProcessCheckoutUseCase;
  let cartResolverMock: ReturnType<typeof createCartResolverMock>;
  let stockValidatorMock: ReturnType<typeof createStockValidatorMock>;
  let discountEngineMock: ReturnType<typeof createDiscountEngineMock>;
  let productRepositoryMock: jest.Mocked<IProductRepository>;
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;

  /**
   * Función que arma el módulo de prueba con el cupón y los conflictos indicados
   * @param {IResolvedCoupon} resolvedCoupon - cupón que devuelve el resolver
   * @param {IStockConflict[]} stockConflicts - conflictos que devuelve el validador
   * @returns {Promise<void>}
   */
  const buildUseCase = async (
    resolvedCoupon: IResolvedCoupon,
    stockConflicts: IStockConflict[] = [],
  ): Promise<void> => {
    cartResolverMock = createCartResolverMock(laptopResolvedCartMock, resolvedCoupon);
    stockValidatorMock = createStockValidatorMock(stockConflicts);
    discountEngineMock = createDiscountEngineMock();
    productRepositoryMock = createProductRepositoryMock();
    orderRepositoryMock = createOrderRepositoryMock([]);
    const testingModule = await Test.createTestingModule({
      providers: [
        ProcessCheckoutUseCase,
        { provide: CartResolver, useValue: cartResolverMock },
        { provide: StockValidator, useValue: stockValidatorMock },
        { provide: DiscountEngine, useValue: discountEngineMock },
        { provide: PRODUCT_REPOSITORY, useValue: productRepositoryMock },
        { provide: ORDER_REPOSITORY, useValue: orderRepositoryMock },
      ],
    }).compile();
    processCheckoutUseCase = testingModule.get(ProcessCheckoutUseCase);
  };

  /**
   * Función que verifica que no hubo ninguna mutación de estado
   * @returns {void}
   */
  const expectNoMutation = (): void => {
    expect(productRepositoryMock.decrementStock.mock.calls).toHaveLength(0);
    expect(orderRepositoryMock.save.mock.calls).toHaveLength(0);
  };

  it('debería devolver la orden con UUID v4, fecha unix en segundos, ítems, cupón y desglose cuando la compra es exitosa', async () => {
    await buildUseCase(demoCouponResolvedMock);
    const nowInSeconds = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
    const order = await processCheckoutUseCase.execute(laptopCheckoutRequest);
    expect(order.id).toMatch(UUID_V4_PATTERN);
    expect(Number.isInteger(order.createdAt)).toBe(true);
    expect(Math.abs(order.createdAt - nowInSeconds)).toBeLessThanOrEqual(CREATED_AT_TOLERANCE_SECONDS);
    expect(order.items).toEqual([
      { productId: laptopProductMock.id, name: 'Laptop Pro 14', unitPrice: 1299.99, quantity: 1 },
    ]);
    expect(order.couponCode).toBe('DEMO30');
    expect(order.breakdown).toBe(laptopWithDemoCouponBreakdownMock);
    expect(order.finalTotal).toBe(844.99);
  });

  it('debería decrementar el stock de cada producto y persistir exactamente la orden devuelta cuando la compra es exitosa', async () => {
    await buildUseCase(demoCouponResolvedMock);
    const order = await processCheckoutUseCase.execute(laptopCheckoutRequest);
    expect(productRepositoryMock.decrementStock.mock.calls).toEqual([[laptopProductMock.id, 1]]);
    expect(orderRepositoryMock.save.mock.calls).toHaveLength(1);
    const savedOrder = orderRepositoryMock.save.mock.calls[0][0];
    expect(savedOrder).toBe(order);
    expect(savedOrder.breakdown).toBe(discountEngineMock.calculate.mock.results[0].value as IOrder['breakdown']);
  });

  it('debería registrar couponCode null y pasar un contexto sin cupón al motor cuando no se envía cupón', async () => {
    await buildUseCase(noCouponResolvedMock);
    const order = await processCheckoutUseCase.execute({ items: laptopCheckoutRequest.items });
    expect(order.couponCode).toBeNull();
    const discountContext = discountEngineMock.calculate.mock.calls[0][0];
    expect(discountContext.couponCode).toBeNull();
    expect(discountContext.coupon).toBeNull();
    expect(discountContext.items).toEqual(laptopResolvedCartMock.discountableItems);
  });

  it('debería respetar el orden productos → cupón → stock → calcular → decrementar → persistir cuando la compra es exitosa', async () => {
    await buildUseCase(demoCouponResolvedMock);
    await processCheckoutUseCase.execute(laptopCheckoutRequest);
    const invocationOrder = [
      cartResolverMock.resolveItems.mock.invocationCallOrder[0],
      cartResolverMock.resolveCoupon.mock.invocationCallOrder[0],
      stockValidatorMock.validate.mock.invocationCallOrder[0],
      discountEngineMock.calculate.mock.invocationCallOrder[0],
      productRepositoryMock.decrementStock.mock.invocationCallOrder[0],
      orderRepositoryMock.save.mock.invocationCallOrder[0],
    ];
    expect(invocationOrder).toEqual([...invocationOrder].sort((first, second) => first - second));
    expect(stockValidatorMock.validate.mock.calls[0]).toEqual([
      laptopResolvedCartMock.consolidatedItems,
      laptopResolvedCartMock.products,
    ]);
  });

  it('debería lanzar InvalidCouponError sin calcular ni persistir cuando el cupón no resuelve', async () => {
    await buildUseCase(invalidCouponResolvedMock);
    await expect(
      processCheckoutUseCase.execute({ ...laptopCheckoutRequest, couponCode: 'NOEXISTE' }),
    ).rejects.toBeInstanceOf(InvalidCouponError);
    expect(stockValidatorMock.validate.mock.calls).toHaveLength(0);
    expect(discountEngineMock.calculate.mock.calls).toHaveLength(0);
    expectNoMutation();
  });

  it('debería lanzar InsufficientStockError con todos los conflictos sin decrementar cuando falta stock', async () => {
    const stockConflicts: IStockConflict[] = [{ productId: laptopProductMock.id, requested: 6, available: 5 }];
    await buildUseCase(demoCouponResolvedMock, stockConflicts);
    const rejection = processCheckoutUseCase.execute({
      ...laptopCheckoutRequest,
      items: [{ productId: laptopProductMock.id, quantity: 6 }],
    });
    await expect(rejection).rejects.toBeInstanceOf(InsufficientStockError);
    await expect(rejection).rejects.toMatchObject({ conflicts: stockConflicts });
    expect(discountEngineMock.calculate.mock.calls).toHaveLength(0);
    expectNoMutation();
  });

  it('debería propagar ProductNotFoundError sin tocar cupón ni stock cuando un producto no existe', async () => {
    await buildUseCase(demoCouponResolvedMock);
    cartResolverMock.resolveItems.mockRejectedValue(new ProductNotFoundError(['00000000-0000-4000-8000-000000000000']));
    await expect(processCheckoutUseCase.execute(laptopCheckoutRequest)).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(cartResolverMock.resolveCoupon.mock.calls).toHaveLength(0);
    expect(stockValidatorMock.validate.mock.calls).toHaveLength(0);
    expectNoMutation();
  });

  it('debería traducir a InsufficientStockError y no persistir cuando el repositorio rechaza el decremento', async () => {
    await buildUseCase(demoCouponResolvedMock);
    productRepositoryMock.decrementStock.mockResolvedValue(false);
    const rejection = processCheckoutUseCase.execute(laptopCheckoutRequest);
    await expect(rejection).rejects.toBeInstanceOf(InsufficientStockError);
    await expect(rejection).rejects.toMatchObject({
      conflicts: [{ productId: laptopProductMock.id, requested: 1, available: laptopProductMock.stock }],
    });
    expect(orderRepositoryMock.save.mock.calls).toHaveLength(0);
  });
});
