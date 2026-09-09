/** Enumerables */
import type { ErrorCodeEnum } from '../../domain/errors/error-code.enumerable.enum';

/**
 * Cuerpo que las fábricas de excepciones adjuntan a las HttpException de Nest para que el filtro global
 * conserve el código y el mensaje en español sin volver a interpretarlos.
 */
export interface IHttpErrorResponse {
  /** Código legible por máquina */
  code: ErrorCodeEnum;

  /** Mensaje en español apto para el cliente */
  message: string;
}
