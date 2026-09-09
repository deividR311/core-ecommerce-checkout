/** Dependencias NestJS */
import type { HttpStatus } from '@nestjs/common';

/** Contratos compartidos */
import type { IApiError } from '@cec/shared';

/** Respuesta ya resuelta por el filtro global: estado HTTP y cuerpo con el formato estándar de error */
export interface IResolvedApiError {
  /** Estado HTTP con el que se responde */
  status: HttpStatus;

  /** Cuerpo con la forma { error: { code, message, details? } } */
  body: IApiError;
}
