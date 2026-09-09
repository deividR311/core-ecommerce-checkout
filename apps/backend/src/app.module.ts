/** Dependencias NestJS */
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

/** Puertos */
import { COUPON_REPOSITORY } from './domain/ports/coupon-repository.port';
import { ORDER_REPOSITORY } from './domain/ports/order-repository.port';
import { PRODUCT_REPOSITORY } from './domain/ports/product-repository.port';

/** Dominio */
import { DiscountEngine } from './domain/discounts/discount-engine';
import { DiscountStrategyFactory } from './domain/discounts/discount-strategy.factory';
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

/** HTTP */
import { ApiExceptionFilter } from './infrastructure/http/api-exception.filter';
import { createValidationPipe } from './infrastructure/http/validation-pipe.factory';

/** Controladores */
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { OrdersController } from './presentation/controllers/orders.controller';
import { ProductsController } from './presentation/controllers/products.controller';

/**
 * @class AppModule
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Module({
  controllers: [HealthController, ProductsController, CheckoutController, OrdersController],
  providers: [
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
    { provide: COUPON_REPOSITORY, useClass: InMemoryCouponRepository },
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
    {
      provide: DiscountEngine,
      useFactory: (): DiscountEngine => new DiscountEngine(DiscountStrategyFactory.createChain()),
    },
    { provide: StockValidator, useFactory: (): StockValidator => new StockValidator() },
    CartResolver,
    GetProductsUseCase,
    QuoteCartUseCase,
    ProcessCheckoutUseCase,
    GetOrdersUseCase,
    GetOrderByIdUseCase,
  ],
})
export class AppModule {}
