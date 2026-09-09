/** Interfaces */
import { IStockConflict } from './stock-conflict.interface';

/** Detalle de un error de la API; nunca incluye rutas, trazas ni nombres de clases del servidor */
export interface IApiErrorDetail {
  /** Código de error con formato CEC_{MODULO}_{CONSECUTIVO} */
  code: string;

  /** Mensaje apto para mostrar al usuario */
  message: string;

  /** Conflictos de stock; presente solo en el error 409 de POST /checkout */
  details?: IStockConflict[];
}

/** Estructura estándar de toda respuesta de error de la API */
export interface IApiError {
  error: IApiErrorDetail;
}
