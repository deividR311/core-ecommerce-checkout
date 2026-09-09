/** Contratos compartidos */
import type { ICartItem, IProduct } from '@cec/shared';

/** Entidades */
import type { ICoupon } from '../../domain/entities/coupon.interface';

/** Interfaces */
import type { IDiscountableItem } from '../../domain/discounts/discount-context.interface';

/** Ítem consolidado junto al producto del catálogo que lo respalda */
export interface IResolvedCartItem {
  /** Producto resuelto desde el catálogo del servidor */
  product: IProduct;

  /** Unidades solicitadas, ya consolidadas por producto */
  quantity: number;
}

/** Carrito con todos sus productos resueltos; ningún identificador queda sin respaldo en el catálogo */
export interface IResolvedCart {
  /** Ítems consolidados por producto, tal como los requiere la validación de stock */
  consolidatedItems: ICartItem[];

  /** Productos resueltos, en el mismo orden que los ítems consolidados */
  products: IProduct[];

  /** Ítems con su producto, para construir la orden con el precio al momento de la compra */
  resolvedItems: IResolvedCartItem[];

  /** Ítems en la forma que consume el motor de descuentos */
  discountableItems: IDiscountableItem[];
}

/** Cupón resuelto desde el repositorio a partir del código normalizado enviado por el cliente */
export interface IResolvedCoupon {
  /** Código normalizado enviado por el cliente, o null si no envió cupón */
  couponCode: string | null;

  /** Cupón activo encontrado, o null si el código no corresponde a ninguno */
  coupon: ICoupon | null;
}
