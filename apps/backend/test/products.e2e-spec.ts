/** Dependencias NestJS */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

/** Dependencias de pruebas */
import request from 'supertest';
import { App } from 'supertest/types';

/** Contratos compartidos */
import { ProductCategoryEnum } from '@cec/shared';
import type { IProduct } from '@cec/shared';

/** Módulos */
import { AppModule } from '../src/app.module';

/** Campos exactos que expone el contrato IProduct; el catálogo no debe filtrar campos internos */
const PRODUCT_CONTRACT_FIELDS = ['id', 'name', 'unitPrice', 'category', 'stock'];

describe('ProductsController (e2e): consulta del catálogo', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('debería responder 200 con los seis productos de la semilla cuando se consulta GET /products', async () => {
    const response = await request(app.getHttpServer()).get('/products').expect(200);
    const products = response.body as IProduct[];
    expect(products).toHaveLength(6);
    expect(products).toContainEqual({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      name: 'Laptop Pro 14',
      unitPrice: 1299.99,
      category: ProductCategoryEnum.TECHNOLOGY,
      stock: 5,
    });
  });

  it('debería exponer únicamente los campos del contrato IProduct cuando se consulta GET /products', async () => {
    const response = await request(app.getHttpServer()).get('/products').expect(200);
    const products = response.body as IProduct[];
    products.forEach(product => {
      expect(Object.keys(product).sort()).toEqual([...PRODUCT_CONTRACT_FIELDS].sort());
      expect(Object.values(ProductCategoryEnum)).toContain(product.category);
    });
  });
});
