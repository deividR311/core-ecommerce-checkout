/** Entidades */
import type { ICoupon } from '../../../domain/entities/coupon.interface';

/** Puertos */
import type { ICouponRepository } from '../../../domain/ports/coupon-repository.port';

/** Mocks */
import { welcomeCouponMock } from '../../../domain/discounts/mocks/discount-context.mock';

/**
 * Función que crea un repositorio de cupones mockeado que resuelve siempre el cupón indicado
 * @param {ICoupon | null} [coupon=welcomeCouponMock] - cupón que devuelve findActiveByCode; null simula inválido
 * @returns {jest.Mocked<ICouponRepository>}
 */
export const createCouponRepositoryMock = (
  coupon: ICoupon | null = welcomeCouponMock,
): jest.Mocked<ICouponRepository> => ({
  findActiveByCode: jest.fn().mockResolvedValue(coupon),
});
