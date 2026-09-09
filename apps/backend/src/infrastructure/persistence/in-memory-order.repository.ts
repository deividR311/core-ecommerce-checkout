/** Dependencias NestJS */
import { Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Puertos */
import type { IOrderRepository } from '../../domain/ports/order-repository.port';

/**
 * @class InMemoryOrderRepository
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  /** Órdenes en orden de llegada; se vacía en cada arranque */
  private readonly _orders: IOrder[] = [];

  /**
   * Función que guarda una copia de la orden al final de la lista
   * @param {IOrder} order - orden a persistir
   * @returns {Promise<void>}
   */
  save(order: IOrder): Promise<void> {
    this._orders.push(this._cloneOrder(order));
    return Promise.resolve();
  }

  /**
   * Función que devuelve copias de todas las órdenes, la última que llegó primero
   * @returns {Promise<IOrder[]>}
   */
  findAll(): Promise<IOrder[]> {
    const orders = [...this._orders].reverse().map(order => this._cloneOrder(order));
    return Promise.resolve(orders);
  }

  /**
   * Función que busca una orden por identificador y devuelve una copia, o null si no existe
   * @param {string} orderId - identificador UUID de la orden
   * @returns {Promise<IOrder | null>}
   */
  findById(orderId: string): Promise<IOrder | null> {
    const order = this._orders.find(storedOrder => storedOrder.id === orderId);
    return Promise.resolve(order ? this._cloneOrder(order) : null);
  }

  /**
   * Función que copia la orden con sus ítems y desglose para que el consumidor no altere el estado interno
   * @private
   * @param {IOrder} order - orden a copiar
   * @returns {IOrder}
   */
  private _cloneOrder(order: IOrder): IOrder {
    return {
      ...order,
      items: order.items.map(orderItem => ({ ...orderItem })),
      breakdown: { ...order.breakdown },
    };
  }
}
