/** Dependencias NestJS */
import { Injectable } from '@nestjs/common';

/** Contratos compartidos */
import type { ICheckoutRequest, IDiscountBreakdown } from '@cec/shared';

/** Motor de descuentos */
import { DiscountEngine } from '../../domain/discounts/discount-engine';
import { createDiscountContext } from '../../domain/discounts/discount-context.util';

/** Servicios de aplicación */
import { CartResolver } from '../services/cart-resolver.service';

/**
 * @class QuoteCartUseCase
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class QuoteCartUseCase {
  /**
   * @constructor
   * @param {CartResolver} cartResolver - servicio que resuelve ítems y cupón desde los puertos
   * @param {DiscountEngine} discountEngine - motor de descuentos en cascada
   */
  constructor(
    private readonly _cartResolver: CartResolver,
    private readonly _discountEngine: DiscountEngine,
  ) {}

  /**
   * Función que cotiza el carrito sin mutar estado; un cupón inválido se tolera y se refleja en isCouponValid
   * @param {ICheckoutRequest} checkoutRequest - ítems y cupón opcional ya validados por el borde HTTP
   * @returns {Promise<IDiscountBreakdown>}
   */
  async execute(checkoutRequest: ICheckoutRequest): Promise<IDiscountBreakdown> {
    const resolvedCart = await this._cartResolver.resolveItems(checkoutRequest.items);
    const resolvedCoupon = await this._cartResolver.resolveCoupon(checkoutRequest.couponCode);
    const discountContext = createDiscountContext(
      resolvedCart.discountableItems,
      resolvedCoupon.couponCode,
      resolvedCoupon.coupon,
    );
    return this._discountEngine.calculate(discountContext);
  }
}
