/** Enumerable bajo prueba */
import { ErrorCodeEnum } from './error-code.enumerable.enum';

/** Formato acordado: CEC_{MODULO}_{CONSECUTIVO} con módulos y rangos por capa */
const ERROR_CODE_PATTERN = /^CEC_(PRODUCTS|CHECKOUT|ORDERS|DISCOUNTS)_[123]\d{3}$/;

describe('ErrorCodeEnum: formato de los códigos de error', () => {
  it('debería cumplir el formato CEC_{MODULO}_{CONSECUTIVO} cuando se recorren todos sus miembros', () => {
    Object.values(ErrorCodeEnum).forEach(errorCode => {
      expect(errorCode).toMatch(ERROR_CODE_PATTERN);
    });
  });

  it('debería no repetir códigos cuando se comparan todos los miembros', () => {
    const errorCodes = Object.values(ErrorCodeEnum);
    expect(new Set(errorCodes).size).toBe(errorCodes.length);
  });

  it('debería ubicar los errores en el rango 3xxx cuando pertenecen al dominio', () => {
    expect(ErrorCodeEnum.PRODUCTS_NOT_FOUND).toBe('CEC_PRODUCTS_3001');
    expect(ErrorCodeEnum.DISCOUNTS_INVALID_COUPON).toBe('CEC_DISCOUNTS_3001');
    expect(ErrorCodeEnum.CHECKOUT_INSUFFICIENT_STOCK).toBe('CEC_CHECKOUT_3001');
    expect(ErrorCodeEnum.ORDERS_NOT_FOUND).toBe('CEC_ORDERS_3001');
  });
});
