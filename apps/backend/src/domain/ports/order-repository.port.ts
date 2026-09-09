/** Contratos compartidos */
import type { IOrder } from '@cec/shared';

/** Token de inyección del repositorio de órdenes */
export const ORDER_REPOSITORY = Symbol('IOrderRepository');

/** Puerto de persistencia y consulta de órdenes procesadas */
export interface IOrderRepository {
  /**
   * Función que persiste una orden ya calculada; el repositorio no la modifica
   * @param {IOrder} order - orden a persistir
   * @returns {Promise<void>}
   */
  save(order: IOrder): Promise<void>;

  /**
   * Función que obtiene todas las órdenes de la más reciente a la más antigua según su orden de llegada
   * @returns {Promise<IOrder[]>}
   */
  findAll(): Promise<IOrder[]>;

  /**
   * Función que busca una orden por su identificador; retorna null si no existe
   * @param {string} orderId - identificador UUID de la orden
   * @returns {Promise<IOrder | null>}
   */
  findById(orderId: string): Promise<IOrder | null>;
}
