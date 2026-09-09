/** Dependencias NestJS */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

/** Dependencias de pruebas */
import request from 'supertest';
import { App } from 'supertest/types';

/** Módulos */
import { AppModule } from '../src/app.module';

describe('HealthController (e2e): disponibilidad del servicio', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('debería responder 200 con el estado ok cuando se consulta GET /health', async () => {
    await request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });
});
