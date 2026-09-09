/** Dependencias NestJS */
import { Module } from '@nestjs/common';

/** Controladores */
import { HealthController } from './presentation/controllers/health.controller';

/**
 * @class AppModule
 * @author Johan Rodriguez – jcendales@soysentinel.com
 * @copyright Sentinel-2026
 */
@Module({
  controllers: [HealthController],
})
export class AppModule {}
