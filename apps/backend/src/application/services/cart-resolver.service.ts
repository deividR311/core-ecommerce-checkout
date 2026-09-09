/** Dependencias NestJS */
import { Inject, Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { ICartItem, IProduct } from '@cec/shared';

/** Errores */
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';

/** Puertos */
import { COUPON_REPOSITORY } from '../../domain/ports/coupon-repository.port';
import type { ICouponRepository } from '../../domain/ports/coupon-repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Servicios de dominio */
import { consolidateCartItems } from '../../domain/services/cart-item.util';

/** Interfaces */
import type { IResolvedCart, IResolvedCartItem, IResolvedCoupon } from './resolved-cart.interface';

/**
 * @class CartResolver
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class CartResolver {
  /**
   * @constructor
   * @param {IProductRepository} productRepository - puerto del catálogo de productos
   * @param {ICouponRepository} couponRepository - puerto de cupones
   */
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly _productRepository: IProductRepository,
    @Inject(COUPON_REPOSITORY)
    private readonly _couponRepository: ICouponRepository,
  ) {}

  /**
   * Función que consolida los ítems del carrito y resuelve cada producto desde el catálogo; lanza ProductNotFoundError
   * con todos los identificadores inexistentes
   * @param {readonly ICartItem[]} cartItems - ítems tal como llegan del cliente
   * @returns {Promise<IResolvedCart>}
   */
  async resolveItems(cartItems: readonly ICartItem[]): Promise<IResolvedCart> {
    const consolidatedItems = consolidateCartItems(cartItems);
    const requestedProductIds = consolidatedItems.map(consolidatedItem => consolidatedItem.productId);
    const products = await this._productRepository.findByIds(requestedProductIds);
    const productById = new Map<string, IProduct>(products.map(product => [product.id, product]));
    const missingProductIds = requestedProductIds.filter(productId => !productById.has(productId));
    if (missingProductIds.length > 0) {
      throw new ProductNotFoundError(missingProductIds);
    }
    const resolvedItems = consolidatedItems.flatMap((consolidatedItem): IResolvedCartItem[] => {
      const product = productById.get(consolidatedItem.productId);
      return product ? [{ product, quantity: consolidatedItem.quantity }] : [];
    });
    return {
      consolidatedItems,
      products: resolvedItems.map(resolvedItem => resolvedItem.product),
      resolvedItems,
      discountableItems: resolvedItems.map(resolvedItem => ({
        unitPrice: resolvedItem.product.unitPrice,
        category: resolvedItem.product.category,
        quantity: resolvedItem.quantity,
      })),
    };
  }

  /**
   * Función que resuelve el cupón activo a partir del código ya normalizado por el borde HTTP; sin código no consulta
   * el repositorio
   * @param {string} [couponCode] - código normalizado enviado por el cliente
   * @returns {Promise<IResolvedCoupon>}
   */
  async resolveCoupon(couponCode?: string): Promise<IResolvedCoupon> {
    if (couponCode === undefined) {
      return { couponCode: null, coupon: null };
    }
    const coupon = await this._couponRepository.findActiveByCode(couponCode);
    return { couponCode, coupon };
  }
}
