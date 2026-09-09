/** Contratos compartidos */
import { ProductCategoryEnum } from '@cec/shared';

/** Entidades */
import type { ICoupon } from '../../entities/coupon.interface';

/** Interfaces */
import type { IDiscountableItem, IDiscountContext } from '../discount-context.interface';

/** Utilidades */
import { createDiscountContext } from '../discount-context.util';

/** Ítems resueltos con los datos de la semilla del catálogo */
export const laptopItemMock: IDiscountableItem = {
  unitPrice: 1299.99,
  category: ProductCategoryEnum.TECHNOLOGY,
  quantity: 1,
};
export const headphonesItemMock: IDiscountableItem = {
  unitPrice: 89.99,
  category: ProductCategoryEnum.TECHNOLOGY,
  quantity: 1,
};
export const coffeeMakerItemMock: IDiscountableItem = {
  unitPrice: 45.5,
  category: ProductCategoryEnum.HOME,
  quantity: 1,
};
export const tShirtItemMock: IDiscountableItem = {
  unitPrice: 19.99,
  category: ProductCategoryEnum.CLOTHING,
  quantity: 1,
};
export const novelItemMock: IDiscountableItem = {
  unitPrice: 12.75,
  category: ProductCategoryEnum.BOOKS,
  quantity: 1,
};

/** Cupones con los datos de la semilla */
export const welcomeCouponMock: ICoupon = { code: 'WELCOME2026', discountRate: 0.15, isActive: true };
export const demoCouponMock: ICoupon = { code: 'DEMO30', discountRate: 0.3, isActive: true };
export const inactiveCouponMock: ICoupon = { code: 'SUMMER2025', discountRate: 0.2, isActive: false };

/**
 * Función que construye un contexto sintético a partir de un contexto vacío y los campos indicados
 * @param {Partial<IDiscountContext>} overrides - campos a sobrescribir
 * @returns {IDiscountContext}
 */
export const createDiscountContextMock = (overrides: Partial<IDiscountContext>): IDiscountContext => ({
  ...createDiscountContext([], null, null),
  ...overrides,
});
