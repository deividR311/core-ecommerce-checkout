/**
 * Cupón de descuento resuelto desde el repositorio del servidor.
 * Vive solo en el backend: el cliente nunca recibe cupones ni su porcentaje.
 */
export interface ICoupon {
  /** Código normalizado del cupón (mayúsculas, sin espacios) */
  code: string;

  /** Porcentaje de descuento como fracción decimal (0.15 = 15%) */
  discountRate: number;

  /** Indica si el cupón puede aplicarse; un cupón inactivo se trata como inexistente */
  isActive: boolean;
}
