/** Dependencias NestJS */
import { Injectable } from '@nestjs/common';

/** Entidades */
import type { ICoupon } from '../../domain/entities/coupon.interface';

/** Puertos */
import type { ICouponRepository } from '../../domain/ports/coupon-repository.port';

/** Semillas */
import { COUPONS_SEED } from '../seed/coupons.seed';

/**
 * @class InMemoryCouponRepository
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
@Injectable()
export class InMemoryCouponRepository implements ICouponRepository {
  /** Cupones indexados por código; se inicializan con copias de la semilla en cada arranque */
  private readonly _coupons: Map<string, ICoupon> = new Map(COUPONS_SEED.map(coupon => [coupon.code, { ...coupon }]));

  /**
   * Función que busca un cupón por su código normalizado y retorna una copia solo si existe y está activo
   * @param {string} couponCode - código normalizado del cupón
   * @returns {Promise<ICoupon | null>}
   */
  findActiveByCode(couponCode: string): Promise<ICoupon | null> {
    const coupon = this._coupons.get(couponCode);
    const activeCoupon = coupon && coupon.isActive ? { ...coupon } : null;
    return Promise.resolve(activeCoupon);
  }
}
