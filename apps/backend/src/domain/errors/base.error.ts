/** Enumerables */
import type { ErrorCodeEnum } from './error-code.enumerable.enum';

/**
 * @class BaseError
 * @author Johan Rodriguez – deicen24@gmail.com
 * @copyright Davivienda-2026
 */
export abstract class BaseError extends Error {
  /**
   * @constructor
   * @param {ErrorCodeEnum} code - código legible por máquina del error
   * @param {string} message - mensaje en español apto para el cliente
   */
  protected constructor(
    readonly code: ErrorCodeEnum,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
