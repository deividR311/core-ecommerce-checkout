/** Enumerable bajo prueba */
import { DiscountTypeEnum } from './discount-type.enumerable.enum';

describe('DiscountTypeEnum: tipos de descuento del motor en cascada', () => {
  it('debería exponer los cuatro tipos en el orden de precedencia cuando se recorren sus valores', () => {
    expect(Object.values(DiscountTypeEnum)).toEqual(['CATEGORY', 'VOLUME', 'COUPON', 'CAP']);
  });

  it('debería serializar cada miembro con su propio nombre cuando viaja en el JSON', () => {
    expect(DiscountTypeEnum.CATEGORY).toBe('CATEGORY');
    expect(DiscountTypeEnum.VOLUME).toBe('VOLUME');
    expect(DiscountTypeEnum.COUPON).toBe('COUPON');
    expect(DiscountTypeEnum.CAP).toBe('CAP');
  });
});
