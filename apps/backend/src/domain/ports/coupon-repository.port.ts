/** Entidades */
import type { ICoupon } from '../entities/coupon.interface';

/** Token de inyección del repositorio de cupones */
export const COUPON_REPOSITORY = Symbol('ICouponRepository');

/** Puerto de acceso a los cupones de descuento */
export interface ICouponRepository {
  /**
   * Función que busca un cupón activo por su código normalizado; retorna null si no existe o está inactivo
   * @param {string} couponCode - código normalizado del cupón
   * @returns {Promise<ICoupon | null>}
   */
  findActiveByCode(couponCode: string): Promise<ICoupon | null>;
}
