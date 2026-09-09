/** Dependencias NestJS */
import type { NestExpressApplication } from '@nestjs/platform-express';

/** Utilidad bajo prueba */
import { applyBodySizeLimit, BODY_SIZE_LIMIT } from './body-size-limit';

describe('applyBodySizeLimit: registro del parser JSON con límite de tamaño', () => {
  it('debería exponer el límite acordado de 100 KB cuando se importa la constante', () => {
    expect(BODY_SIZE_LIMIT).toBe('100kb');
  });

  it('debería registrar únicamente el parser JSON con el límite cuando se aplica a la aplicación', () => {
    const useBodyParserMock = jest.fn();
    const appMock = { useBodyParser: useBodyParserMock } as unknown as NestExpressApplication;
    applyBodySizeLimit(appMock);
    expect(useBodyParserMock.mock.calls).toHaveLength(1);
    expect(useBodyParserMock.mock.calls[0]).toEqual(['json', { limit: BODY_SIZE_LIMIT }]);
  });
});
