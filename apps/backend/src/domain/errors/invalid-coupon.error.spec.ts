/** Error bajo prueba */
import { INVALID_COUPON_MESSAGE, InvalidCouponError } from './invalid-coupon.error';

/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

describe('InvalidCouponError: cupón inexistente o inactivo', () => {
  it('debería exponer el código de descuentos y el nombre de la clase cuando se construye', () => {
    const invalidCouponError = new InvalidCouponError();
    expect(invalidCouponError).toBeInstanceOf(BaseError);
    expect(invalidCouponError.code).toBe(ErrorCodeEnum.DISCOUNTS_INVALID_COUPON);
    expect(invalidCouponError.name).toBe('InvalidCouponError');
  });

  it('debería usar un mensaje que no distingue entre inexistente e inactivo cuando se construye', () => {
    const invalidCouponError = new InvalidCouponError();
    expect(invalidCouponError.message).toBe(INVALID_COUPON_MESSAGE);
    expect(invalidCouponError.message).not.toMatch(/inactivo|inexistente|existe/);
  });
});
