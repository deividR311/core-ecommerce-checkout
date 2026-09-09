/** Dependencias NestJS */
import { Test, TestingModule } from '@nestjs/testing';

/** Módulos */
import { AppModule } from './app.module';

/** Puertos */
import { COUPON_REPOSITORY } from './domain/ports/coupon-repository.port';
import { ORDER_REPOSITORY } from './domain/ports/order-repository.port';
import { PRODUCT_REPOSITORY } from './domain/ports/product-repository.port';

/** Dominio */
import { DiscountEngine } from './domain/discounts/discount-engine';
import { StockValidator } from './domain/services/stock-validator';

/** Servicios de aplicación */
import { CartResolver } from './application/services/cart-resolver.service';

/** Casos de uso */
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id.use-case';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { ProcessCheckoutUseCase } from './application/use-cases/process-checkout.use-case';
import { QuoteCartUseCase } from './application/use-cases/quote-cart.use-case';

/** Persistencia */
import { InMemoryCouponRepository } from './infrastructure/persistence/in-memory-coupon.repository';
import { InMemoryOrderRepository } from './infrastructure/persistence/in-memory-order.repository';
import { InMemoryProductRepository } from './infrastructure/persistence/in-memory-product.repository';

/** Controladores */
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { OrdersController } from './presentation/controllers/orders.controller';
import { ProductsController } from './presentation/controllers/products.controller';

describe('AppModule: composición del módulo raíz', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  it('debería resolver los controladores cuando se compila el módulo raíz', () => {
    expect(testingModule.get(HealthController)).toBeInstanceOf(HealthController);
    expect(testingModule.get(ProductsController)).toBeInstanceOf(ProductsController);
    expect(testingModule.get(CheckoutController)).toBeInstanceOf(CheckoutController);
    expect(testingModule.get(OrdersController)).toBeInstanceOf(OrdersController);
  });

  it('debería resolver los repositorios en memoria por su token cuando se compila el módulo raíz', () => {
    expect(testingModule.get(PRODUCT_REPOSITORY)).toBeInstanceOf(InMemoryProductRepository);
    expect(testingModule.get(COUPON_REPOSITORY)).toBeInstanceOf(InMemoryCouponRepository);
    expect(testingModule.get(ORDER_REPOSITORY)).toBeInstanceOf(InMemoryOrderRepository);
  });

  it('debería resolver el motor con su cadena y el validador de stock sin decoradores cuando se compila el módulo raíz', () => {
    const discountEngine = testingModule.get(DiscountEngine);
    expect(discountEngine).toBeInstanceOf(DiscountEngine);
    expect(
      discountEngine.calculate({
        items: [],
        couponCode: null,
        coupon: null,
        originalSubtotal: 0,
        currentTotal: 0,
        appliedDiscounts: [],
      }).finalTotal,
    ).toBe(0);
    expect(testingModule.get(StockValidator)).toBeInstanceOf(StockValidator);
  });

  it('debería resolver el servicio de aplicación y los casos de uso cuando se compila el módulo raíz', () => {
    expect(testingModule.get(CartResolver)).toBeInstanceOf(CartResolver);
    expect(testingModule.get(GetProductsUseCase)).toBeInstanceOf(GetProductsUseCase);
    expect(testingModule.get(QuoteCartUseCase)).toBeInstanceOf(QuoteCartUseCase);
    expect(testingModule.get(ProcessCheckoutUseCase)).toBeInstanceOf(ProcessCheckoutUseCase);
    expect(testingModule.get(GetOrdersUseCase)).toBeInstanceOf(GetOrdersUseCase);
    expect(testingModule.get(GetOrderByIdUseCase)).toBeInstanceOf(GetOrderByIdUseCase);
  });
});
