/** Dependencias NestJS */
import { Inject, Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';

/**
 * @class GetOrdersUseCase
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class GetOrdersUseCase {
  /**
   * @constructor
   * @param {IOrderRepository} orderRepository - puerto de consulta de órdenes
   */
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly _orderRepository: IOrderRepository,
  ) {}

  /**
   * Función que obtiene todas las órdenes procesadas, de la más reciente a la más antigua
   * @returns {Promise<IOrder[]>}
   */
  execute(): Promise<IOrder[]> {
    return this._orderRepository.findAll();
  }
}
