/** Contratos compartidos */
import type { IStockConflict } from '@cec/shared';

/** Servicios de dominio */
import type { StockValidator } from '../../../domain/services/stock-validator';

/**
 * Función que crea un validador de stock mockeado que devuelve siempre los conflictos indicados
 * @param {IStockConflict[]} [conflicts=[]] - conflictos que devuelve validate; vacío significa stock suficiente
 * @returns {jest.Mocked<Pick<StockValidator, 'validate'>>}
 */
export const createStockValidatorMock = (
  conflicts: IStockConflict[] = [],
): jest.Mocked<Pick<StockValidator, 'validate'>> => ({
  validate: jest.fn().mockReturnValue(conflicts),
});
