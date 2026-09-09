/** Dependencias NestJS */
import { Controller, Get } from '@nestjs/common';

/** Interfaces */
import type { IHealthStatus } from '../interface/health-status.interface';

/**
 * @class HealthController
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Controller('health')
export class HealthController {
  /**
   * Función que expone el estado del servicio para comprobaciones de disponibilidad
   * @returns {IHealthStatus}
   */
  @Get()
  getHealthStatus(): IHealthStatus {
    return { status: 'ok' };
  }
}
