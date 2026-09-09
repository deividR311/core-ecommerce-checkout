/** Dependencias NestJS */
import { Inject, Injectable } from '@nestjs/common';

/** Dependencias Node */
import { randomUUID } from 'node:crypto';

/** Librerías */
import dayjs from 'dayjs';

/** Contratos compartidos */
import type { ICheckoutRequest, IDiscountBreakdown, IOrder, IOrderItem } from '@cec/shared';

/** Motor de descuentos */
import { DiscountEngine } from '../../domain/discounts/discount-engine';
import { createDiscountContext } from '../../domain/discounts/discount-context.util';

/** Errores */
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { InvalidCouponError } from '../../domain/errors/invalid-coupon.error';

/** Puertos */
import { ORDER_REPOSITORY } from '../../domain/ports/order-repository.port';
import type { IOrderRepository } from '../../domain/ports/order-repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product-repository.port';
import type { IProductRepository } from '../../domain/ports/product-repository.port';

/** Servicios de dominio */
import { StockValidator } from '../../domain/services/stock-validator';

/** Servicios de aplicación */
import { CartResolver } from '../services/cart-resolver.service';

/** Interfaces */
import type { IResolvedCart, IResolvedCartItem } from '../services/resolved-cart.interface';

/**
 * @class ProcessCheckoutUseCase
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class ProcessCheckoutUseCase {
  /**
   * @constructor
   * @param {CartResolver} cartResolver - servicio que resuelve ítems y cupón desde los puertos
   * @param {StockValidator} stockValidator - servicio de dominio que detecta conflictos de stock
   * @param {DiscountEngine} discountEngine - motor de descuentos en cascada
   * @param {IProductRepository} productRepository - puerto del catálogo, usado solo para decrementar stock
   * @param {IOrderRepository} orderRepository - puerto de persistencia de órdenes
   */
  constructor(
    private readonly _cartResolver: CartResolver,
    private readonly _stockValidator: StockValidator,
    private readonly _discountEngine: DiscountEngine,
    @Inject(PRODUCT_REPOSITORY)
    private readonly _productRepository: IProductRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly _orderRepository: IOrderRepository,
  ) {}

  /**
   * Función que procesa la compra en orden garantizado: resolver productos → resolver cupón → validar stock →
   * calcular → decrementar stock → persistir; toda validación ocurre antes de cualquier mutación
   * @param {ICheckoutRequest} checkoutRequest - ítems y cupón opcional ya validados por el borde HTTP
   * @returns {Promise<IOrder>}
   */
  async execute(checkoutRequest: ICheckoutRequest): Promise<IOrder> {
    const resolvedCart = await this._cartResolver.resolveItems(checkoutRequest.items);
    const resolvedCoupon = await this._cartResolver.resolveCoupon(checkoutRequest.couponCode);
    if (resolvedCoupon.couponCode !== null && resolvedCoupon.coupon === null) {
      throw new InvalidCouponError();
    }
    const stockConflicts = this._stockValidator.validate(resolvedCart.consolidatedItems, resolvedCart.products);
    if (stockConflicts.length > 0) {
      throw new InsufficientStockError(stockConflicts);
    }
    const discountContext = createDiscountContext(
      resolvedCart.discountableItems,
      resolvedCoupon.couponCode,
      resolvedCoupon.coupon,
    );
    const breakdown = this._discountEngine.calculate(discountContext);
    await this._decrementStock(resolvedCart.resolvedItems);
    const order = this._buildOrder(resolvedCart, resolvedCoupon.couponCode, breakdown);
    await this._orderRepository.save(order);
    return order;
  }

  /**
   * Función que descuenta el stock de cada producto ya validado; un rechazo del repositorio es inalcanzable tras la
   * validación en el mismo ciclo, pero se traduce a un conflicto de stock como salvaguarda
   * @private
   * @param {readonly IResolvedCartItem[]} resolvedItems - ítems consolidados con su producto
   * @returns {Promise<void>}
   */
  private async _decrementStock(resolvedItems: readonly IResolvedCartItem[]): Promise<void> {
    for (const resolvedItem of resolvedItems) {
      const isDecremented = await this._productRepository.decrementStock(
        resolvedItem.product.id,
        resolvedItem.quantity,
      );
      if (!isDecremented) {
        throw new InsufficientStockError([
          {
            productId: resolvedItem.product.id,
            requested: resolvedItem.quantity,
            available: resolvedItem.product.stock,
          },
        ]);
      }
    }
  }

  /**
   * Función que construye la orden con identificador UUID v4, fecha unix UTC en segundos y los precios vigentes
   * @private
   * @param {IResolvedCart} resolvedCart - carrito resuelto desde el catálogo
   * @param {string | null} couponCode - código del cupón aplicado, o null
   * @param {IDiscountBreakdown} breakdown - desglose calculado por el motor
   * @returns {IOrder}
   */
  private _buildOrder(resolvedCart: IResolvedCart, couponCode: string | null, breakdown: IDiscountBreakdown): IOrder {
    const orderItems: IOrderItem[] = resolvedCart.resolvedItems.map(resolvedItem => ({
      productId: resolvedItem.product.id,
      name: resolvedItem.product.name,
      unitPrice: resolvedItem.product.unitPrice,
      quantity: resolvedItem.quantity,
    }));
    return {
      id: randomUUID(),
      createdAt: dayjs().unix(),
      items: orderItems,
      couponCode,
      breakdown,
      finalTotal: breakdown.finalTotal,
    };
  }
}
