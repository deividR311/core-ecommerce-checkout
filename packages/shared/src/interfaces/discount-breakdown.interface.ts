/**
 * Desglose de descuentos calculado por el servidor.
 * Montos con dos decimales; tasas como fracción decimal (0.10 = 10%).
 */
export interface IDiscountBreakdown {
  /** Suma de precio unitario por cantidad de todos los ítems, antes de descuentos */
  originalSubtotal: number;

  /** Descuento aplicado por la regla de categoría */
  categoryDiscount: number;

  /** Descuento aplicado por la regla de volumen sobre el subtotal post-categoría */
  volumeDiscount: number;

  /** Descuento aplicado por el cupón sobre el total post-volumen */
  couponDiscount: number;

  /** Monto recortado para que el descuento total no supere el tope del 35% */
  capAdjustment: number;

  /** Suma efectiva de descuentos tras aplicar el tope */
  totalDiscount: number;

  /** Descuento total sobre el subtotal original, como fracción decimal */
  effectiveDiscountRate: number;

  /** Total a pagar tras todos los descuentos */
  finalTotal: number;

  /** Indica si el tope del 35% se alcanzó; única fuente para la alerta del frontend */
  isMaxDiscountReached: boolean;

  /** Indica si el cupón enviado existe y está activo; en cotización un cupón inválido no genera error */
  isCouponValid: boolean;
}
