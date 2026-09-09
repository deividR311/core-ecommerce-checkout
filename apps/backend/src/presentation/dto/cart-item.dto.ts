/** Dependencias de validación */
import { IsInt, IsUUID, Max, Min } from 'class-validator';

/** Contratos compartidos */
import type { ICartItem } from '@cec/shared';

/** Límites de cantidad por ítem (decisión cerrada en CLAUDE.md §8) */
export const MIN_CART_ITEM_QUANTITY = 1;
export const MAX_CART_ITEM_QUANTITY = 999;

/**
 * @class CartItemDto
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class CartItemDto implements ICartItem {
  /** Identificador UUID v4 del producto; el servidor resuelve precio y categoría desde su catálogo */
  @IsUUID('4', { message: 'El campo productId debe ser un UUID válido.' })
  productId!: string;

  /** Unidades solicitadas; entero entre 1 y 999 */
  @IsInt({ message: 'El campo quantity debe ser un número entero.' })
  @Min(MIN_CART_ITEM_QUANTITY, { message: `El campo quantity debe ser mayor o igual a ${MIN_CART_ITEM_QUANTITY}.` })
  @Max(MAX_CART_ITEM_QUANTITY, { message: `El campo quantity debe ser menor o igual a ${MAX_CART_ITEM_QUANTITY}.` })
  quantity!: number;
}
