/** Dependencias NestJS */
import { Test, TestingModule } from '@nestjs/testing';

/** Controladores */
import { HealthController } from './health.controller';

describe('HealthController: comprobación del estado del servicio', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    healthController = testingModule.get(HealthController);
  });

  it('debería retornar el estado ok cuando se consulta la salud del servicio', () => {
    expect(healthController.getHealthStatus()).toEqual({ status: 'ok' });
  });
});
