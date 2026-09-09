/** Dependencias NestJS */
import { Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { IProduct } from '@cec/shared';

/** Puertos */
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Semillas */
import { PRODUCTS_SEED } from '../seed/products.seed';

/** Cantidad mínima que puede descontarse del stock */
const MIN_DECREMENT_QUANTITY = 1;

/**
 * @class InMemoryProductRepository
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  /** Catálogo indexado por identificador; se inicializa con copias de la semilla en cada arranque */
  private readonly _products: Map<string, IProduct> = new Map(
    PRODUCTS_SEED.map(product => [product.id, { ...product }]),
  );

  /**
   * Función que obtiene copias de todos los productos del catálogo con su stock actual
   * @returns {Promise<IProduct[]>}
   */
  findAll(): Promise<IProduct[]> {
    const products = Array.from(this._products.values()).map(product => ({ ...product }));
    return Promise.resolve(products);
  }

  /**
   * Función que obtiene copias de los productos existentes entre los identificadores recibidos, sin repetir
   * @param {readonly string[]} productIds - identificadores a resolver
   * @returns {Promise<IProduct[]>}
   */
  findByIds(productIds: readonly string[]): Promise<IProduct[]> {
    const uniqueProductIds = Array.from(new Set(productIds));
    const products = uniqueProductIds
      .map(productId => this._products.get(productId))
      .filter((product): product is IProduct => product !== undefined)
      .map(product => ({ ...product }));
    return Promise.resolve(products);
  }

  /**
   * Función que valida y descuenta el stock en un mismo paso sincrónico; retorna false sin mutar si no hay disponibilidad
   * @param {string} productId - identificador del producto
   * @param {number} quantity - unidades a descontar
   * @returns {Promise<boolean>}
   */
  decrementStock(productId: string, quantity: number): Promise<boolean> {
    const product = this._products.get(productId);
    const isValidQuantity = Number.isInteger(quantity) && quantity >= MIN_DECREMENT_QUANTITY;
    if (!product || !isValidQuantity || quantity > product.stock) {
      return Promise.resolve(false);
    }
    this._products.set(productId, { ...product, stock: product.stock - quantity });
    return Promise.resolve(true);
  }
}
