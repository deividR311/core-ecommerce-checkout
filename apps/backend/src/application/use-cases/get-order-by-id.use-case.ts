/** Dependencias NestJS */
import { Inject, Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Errores */
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';

/**
 * @class GetOrderByIdUseCase
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class GetOrderByIdUseCase {
  /**
   * @constructor
   * @param {IOrderRepository} orderRepository - puerto de consulta de órdenes
   */
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly _orderRepository: IOrderRepository,
  ) {}

  /**
   * Función que obtiene una orden por su identificador; lanza OrderNotFoundError si no existe
   * @param {string} orderId - identificador UUID ya validado por el borde HTTP
   * @returns {Promise<IOrder>}
   */
  async execute(orderId: string): Promise<IOrder> {
    const order = await this._orderRepository.findById(orderId);
    if (order === null) {
      throw new OrderNotFoundError(orderId);
    }
    return order;
  }
}
