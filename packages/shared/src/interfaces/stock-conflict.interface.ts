/** Conflicto de stock de un producto, reportado por POST /checkout con estado 409 */
export interface IStockConflict {
  /** Identificador del producto sin stock suficiente */
  productId: string;

  /** Unidades solicitadas, consolidadas por producto */
  requested: number;

  /** Unidades disponibles al momento de la validación */
  available: number;
}
