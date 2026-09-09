/** Dependencias NestJS */
import { Module } from '@nestjs/common';

/** Puertos */
import { COUPON_REPOSITORY } from './domain/ports/coupon-repository.port';
import { PRODUCT_REPOSITORY } from './domain/ports/product-repository.port';

/** Casos de uso */
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';

/** Persistencia */
import { InMemoryCouponRepository } from './infrastructure/persistence/in-memory-coupon.repository';
import { InMemoryProductRepository } from './infrastructure/persistence/in-memory-product.repository';

/** Controladores */
import { HealthController } from './presentation/controllers/health.controller';
import { ProductsController } from './presentation/controllers/products.controller';

/**
 * @class AppModule
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Module({
  controllers: [HealthController, ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
    { provide: COUPON_REPOSITORY, useClass: InMemoryCouponRepository },
    GetProductsUseCase,
  ],
})
export class AppModule {}
