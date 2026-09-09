/** Dependencias NestJS */
import { Test } from '@nestjs/testing';

/** Módulos */
import { AppModule } from './app.module';

/** Controladores */
import { HealthController } from './presentation/controllers/health.controller';

describe('AppModule: composición del módulo raíz', () => {
  it('debería resolver el HealthController cuando se compila el módulo raíz', async () => {
    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    expect(testingModule.get(HealthController)).toBeInstanceOf(HealthController);
  });
});
