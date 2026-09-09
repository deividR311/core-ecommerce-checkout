/** Servicios de aplicación */
import type { CartResolver } from '../../services/cart-resolver.service';

/** Interfaces */
import type { IResolvedCart, IResolvedCoupon } from '../../services/resolved-cart.interface';

/** Mocks */
import { demoCouponMock } from '../../../domain/discounts/mocks/discount-context.mock';
import { laptopProductMock } from './product-repository.mock';

/** Carrito resuelto con una Laptop Pro 14 */
export const laptopResolvedCartMock: IResolvedCart = {
  consolidatedItems: [{ productId: laptopProductMock.id, quantity: 1 }],
  products: [laptopProductMock],
  resolvedItems: [{ product: laptopProductMock, quantity: 1 }],
  discountableItems: [{ unitPrice: laptopProductMock.unitPrice, category: laptopProductMock.category, quantity: 1 }],
};

/** Cupón resuelto sin código enviado */
export const noCouponResolvedMock: IResolvedCoupon = { couponCode: null, coupon: null };

/** Cupón de demostración resuelto correctamente */
export const demoCouponResolvedMock: IResolvedCoupon = { couponCode: 'DEMO30', coupon: demoCouponMock };

/** Código enviado que no resolvió ningún cupón activo */
export const invalidCouponResolvedMock: IResolvedCoupon = { couponCode: 'NOEXISTE', coupon: null };

/**
 * Función que crea un resolver de carrito mockeado con el carrito y el cupón indicados
 * @param {IResolvedCart} [resolvedCart=laptopResolvedCartMock] - carrito que devuelve resolveItems
 * @param {IResolvedCoupon} [resolvedCoupon=noCouponResolvedMock] - cupón que devuelve resolveCoupon
 * @returns {jest.Mocked<Pick<CartResolver, 'resolveItems' | 'resolveCoupon'>>}
 */
export const createCartResolverMock = (
  resolvedCart: IResolvedCart = laptopResolvedCartMock,
  resolvedCoupon: IResolvedCoupon = noCouponResolvedMock,
): jest.Mocked<Pick<CartResolver, 'resolveItems' | 'resolveCoupon'>> => ({
  resolveItems: jest.fn().mockResolvedValue(resolvedCart),
  resolveCoupon: jest.fn().mockResolvedValue(resolvedCoupon),
});
