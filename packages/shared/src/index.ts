/** Enumerables */
export { ProductCategoryEnum } from './enums/product-category.enumerable.enum';
export { DiscountTypeEnum } from './enums/discount-type.enumerable.enum';

/** Constantes */
export {
  CATEGORY_DISCOUNT_RATE,
  DISCOUNT_TARGET_CATEGORY,
  FLOAT_TOLERANCE,
  MAX_DISCOUNT_RATE,
  VOLUME_DISCOUNT_RATE,
  VOLUME_THRESHOLD,
} from './constants/discount.constants';

/** Interfaces */
export type { IProduct } from './interfaces/product.interface';
export type { ICartItem } from './interfaces/cart-item.interface';
export type { ICheckoutRequest } from './interfaces/checkout-request.interface';
export type { IDiscountBreakdown } from './interfaces/discount-breakdown.interface';
export type { IOrder, IOrderItem } from './interfaces/order.interface';
export type { IStockConflict } from './interfaces/stock-conflict.interface';
export type { IApiError, IApiErrorDetail } from './interfaces/api-error.interface';

/** Utilidades */
export { roundMoney, roundRate } from './utils/money.util';
