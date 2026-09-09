/** Constantes bajo prueba */
import {
  CATEGORY_DISCOUNT_RATE,
  DISCOUNT_TARGET_CATEGORY,
  FLOAT_TOLERANCE,
  MAX_DISCOUNT_RATE,
  VOLUME_DISCOUNT_RATE,
  VOLUME_THRESHOLD,
} from './discount.constants';

/** Enumerables */
import { ProductCategoryEnum } from '../enums/product-category.enumerable.enum';

describe('discountConstants: reglas del motor de descuentos definidas en el enunciado', () => {
  it('debería aplicar el 10% por categoría cuando el producto es de tecnología', () => {
    expect(CATEGORY_DISCOUNT_RATE).toBe(0.1);
    expect(DISCOUNT_TARGET_CATEGORY).toBe(ProductCategoryEnum.TECHNOLOGY);
  });

  it('debería aplicar el 5% por volumen cuando el subtotal supera estrictamente 100', () => {
    expect(VOLUME_DISCOUNT_RATE).toBe(0.05);
    expect(VOLUME_THRESHOLD).toBe(100);
  });

  it('debería limitar el descuento total al 35% cuando la cascada lo supera', () => {
    expect(MAX_DISCOUNT_RATE).toBe(0.35);
  });

  it('debería usar una tolerancia positiva e inferior a un centavo cuando compara contra el tope', () => {
    expect(FLOAT_TOLERANCE).toBeGreaterThan(0);
    expect(FLOAT_TOLERANCE).toBeLessThan(0.01);
  });

  it('debería producir un descuento máximo del 27.325% cuando se encadenan categoría, volumen y el cupón del enunciado', () => {
    const welcomeCouponRate = 0.15;
    const cascadeFactor = (1 - CATEGORY_DISCOUNT_RATE) * (1 - VOLUME_DISCOUNT_RATE) * (1 - welcomeCouponRate);
    const maxCascadeDiscountRate = 1 - cascadeFactor;
    expect(cascadeFactor).toBeCloseTo(0.72675, 5);
    expect(maxCascadeDiscountRate).toBeLessThan(MAX_DISCOUNT_RATE);
  });
});
