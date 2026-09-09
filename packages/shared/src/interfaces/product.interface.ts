/** Enumerables */
import { ProductCategoryEnum } from '../enums/product-category.enumerable.enum';

/** Producto del catálogo tal como lo expone GET /products */
export interface IProduct {
  /** Identificador único del producto */
  id: string;

  /** Nombre comercial del producto */
  name: string;

  /** Precio unitario vigente; monto con dos decimales */
  unitPrice: number;

  /** Categoría del producto; determina la regla de descuento por categoría */
  category: ProductCategoryEnum;

  /** Unidades disponibles para la venta */
  stock: number;
}
