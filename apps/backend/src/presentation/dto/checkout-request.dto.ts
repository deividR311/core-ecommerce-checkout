/** Dependencias de validación */
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** Contratos compartidos */
import type { ICheckoutRequest } from '@cec/shared';

/** DTOs */
import { CartItemDto } from './cart-item.dto';

/** Límites del carrito y del cupón (decisiones cerradas en CLAUDE.md §8) */
export const MIN_CART_ITEMS = 1;
export const MAX_CART_ITEMS = 50;
export const MAX_COUPON_CODE_LENGTH = 32;

/** Patrón que debe cumplir el código de cupón una vez normalizado */
export const COUPON_CODE_PATTERN = /^[A-Z0-9]+$/;

/**
 * Función que normaliza el código de cupón con trim y mayúsculas; un texto vacío se trata como ausencia de cupón y
 * cualquier valor que no sea texto se deja intacto para que la validación lo rechace
 * @param {{ value: unknown }} transformParams - parámetros de class-transformer con el valor recibido
 * @returns {unknown}
 */
export const normalizeCouponCode = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  const normalizedCouponCode = value.trim().toUpperCase();
  return normalizedCouponCode.length === 0 ? undefined : normalizedCouponCode;
};

/**
 * @class CheckoutRequestDto
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export class CheckoutRequestDto implements ICheckoutRequest {
  /** Ítems del carrito; entre 1 y 50, cada uno validado como CartItemDto */
  @IsArray({ message: 'El campo items debe ser un arreglo.' })
  @ArrayMinSize(MIN_CART_ITEMS, { message: 'El carrito debe tener al menos un ítem.' })
  @ArrayMaxSize(MAX_CART_ITEMS, { message: `El carrito no puede tener más de ${MAX_CART_ITEMS} ítems.` })
  @ValidateNested({ each: true, message: 'Cada ítem debe ser un objeto con productId y quantity.' })
  @Type(() => CartItemDto)
  items!: CartItemDto[];

  /** Código de cupón opcional, normalizado a mayúsculas; alfanumérico de hasta 32 caracteres */
  @Transform(normalizeCouponCode)
  @IsOptional()
  @IsString({ message: 'El campo couponCode debe ser texto.' })
  @MaxLength(MAX_COUPON_CODE_LENGTH, {
    message: `El campo couponCode no puede superar ${MAX_COUPON_CODE_LENGTH} caracteres.`,
  })
  @Matches(COUPON_CODE_PATTERN, { message: 'El campo couponCode solo admite letras y números.' })
  couponCode?: string;
}
