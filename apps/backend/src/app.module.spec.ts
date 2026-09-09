/** Dependencias NestJS */
import { Test, TestingModule } from '@nestjs/testing';

/** Módulos */
import { AppModule } from './app.module';

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

describe('AppModule: composición del módulo raíz', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  it('debería resolver los controladores cuando se compila el módulo raíz', () => {
    expect(testingModule.get(HealthController)).toBeInstanceOf(HealthController);
    expect(testingModule.get(ProductsController)).toBeInstanceOf(ProductsController);
  });

  it('debería resolver los repositorios en memoria por su token cuando se compila el módulo raíz', () => {
    expect(testingModule.get(PRODUCT_REPOSITORY)).toBeInstanceOf(InMemoryProductRepository);
    expect(testingModule.get(COUPON_REPOSITORY)).toBeInstanceOf(InMemoryCouponRepository);
  });

  it('debería resolver el caso de uso del catálogo cuando se compila el módulo raíz', () => {
    expect(testingModule.get(GetProductsUseCase)).toBeInstanceOf(GetProductsUseCase);
  });
});
