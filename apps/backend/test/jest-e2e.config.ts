/** Dependencias de pruebas */
import type { Config } from 'jest';

/** Configuración de Jest para las pruebas end-to-end del backend */
const jestE2eConfig: Config = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.e2e-spec.ts'],
  transform: {
    '^.+[.]ts$': 'ts-jest',
  },
  testEnvironment: 'node',
};

export default jestE2eConfig;
