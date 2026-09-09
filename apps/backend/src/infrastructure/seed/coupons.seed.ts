/** Entidades */
import type { ICoupon } from '../../domain/entities/coupon.interface';

/**
 * Cupones semilla que se cargan al iniciar la aplicación y se restauran en cada reinicio.
 * - WELCOME2026: cupón del enunciado (15%).
 * - SUMMER2025: cupón inactivo para verificar que se trata como inexistente.
 * - DEMO30: dato de demostración (decisión 10.1). Con las tres reglas del enunciado el descuento máximo en cascada es
 *   27.325% y el tope del 35% nunca se activa; este cupón (30%) permite observar el tope y su alerta en la demo
 *   cuando el carrito incluye productos de Tecnología. No modifica ninguna regla de negocio.
 */
export const COUPONS_SEED: readonly ICoupon[] = [
  { code: 'WELCOME2026', discountRate: 0.15, isActive: true },
  { code: 'SUMMER2025', discountRate: 0.2, isActive: false },
  { code: 'DEMO30', discountRate: 0.3, isActive: true },
];
