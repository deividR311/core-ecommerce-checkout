/** Error bajo prueba */
import { OrderNotFoundError } from './order-not-found.error';

/** Errores */
import { BaseError } from './base.error';
import { ErrorCodeEnum } from './error-code.enumerable.enum';

describe('OrderNotFoundError: orden inexistente', () => {
  const orderId = 'c1a5d8e2-4b3f-4c6a-9d7e-2f8b1a0c3d4e';

  it('debería exponer el código de órdenes, el nombre de la clase y el identificador cuando se construye', () => {
    const orderNotFoundError = new OrderNotFoundError(orderId);
    expect(orderNotFoundError).toBeInstanceOf(BaseError);
    expect(orderNotFoundError.code).toBe(ErrorCodeEnum.ORDERS_NOT_FOUND);
    expect(orderNotFoundError.name).toBe('OrderNotFoundError');
    expect(orderNotFoundError.orderId).toBe(orderId);
    expect(orderNotFoundError.message).toContain(orderId);
  });
});
