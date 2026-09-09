/** Enumerables */
import { ProductCategoryEnum } from '../enums/product-category.enumerable.enum';

/** Porcentaje de la regla por categoría, como fracción decimal (10%) */
export const CATEGORY_DISCOUNT_RATE = 0.1;

/** Categoría sobre la que aplica la regla por categoría */
export const DISCOUNT_TARGET_CATEGORY = ProductCategoryEnum.TECHNOLOGY;

/** Porcentaje de la regla por volumen, como fracción decimal (5%) */
export const VOLUME_DISCOUNT_RATE = 0.05;

/** Subtotal post-categoría que debe superarse estrictamente para que aplique la regla por volumen */
export const VOLUME_THRESHOLD = 100;

/** Tope absoluto del descuento total sobre el subtotal original, como fracción decimal (35%) */
export const MAX_DISCOUNT_RATE = 0.35;

/** Tolerancia para comparar montos en coma flotante contra el tope; un 35% exacto no se considera superado */
export const FLOAT_TOLERANCE = 1e-9;
