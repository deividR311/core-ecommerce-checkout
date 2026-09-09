/** Contratos compartidos */
import type { IProduct } from '@cec/shared';

/** Token de inyección del repositorio de productos */
export const PRODUCT_REPOSITORY = Symbol('IProductRepository');

/** Puerto de acceso al catálogo de productos y a su stock */
export interface IProductRepository {
  /**
   * Función que obtiene todos los productos del catálogo con su stock actual
   * @returns {Promise<IProduct[]>}
   */
  findAll(): Promise<IProduct[]>;

  /**
   * Función que obtiene los productos cuyos identificadores existen en el catálogo; los inexistentes se omiten
   * @param {readonly string[]} productIds - identificadores a resolver
   * @returns {Promise<IProduct[]>}
   */
  findByIds(productIds: readonly string[]): Promise<IProduct[]>;

  /**
   * Función que descuenta unidades del stock de un producto en un solo paso y retorna true si se aplicó;
   * rechaza sin mutar el estado cuando la cantidad supera la disponibilidad
   * @param {string} productId - identificador del producto
   * @param {number} quantity - unidades a descontar
   * @returns {Promise<boolean>}
   */
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}
