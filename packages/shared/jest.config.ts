/** Dependencias de pruebas */
import type { Config } from 'jest';

/** Umbral mínimo de cobertura exigido por el proyecto */
const COVERAGE_THRESHOLD_PERCENT = 80;

/**
 * Configuración de Jest para las pruebas unitarias de los contratos compartidos.
 * Se excluyen de cobertura los archivos que solo declaran tipos (*.interface.ts) y el barrel de exportación.
 */
const jestConfig: Config = {
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+[.]ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: ['**/*.ts', '!**/*.interface.ts', '!index.ts'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      statements: COVERAGE_THRESHOLD_PERCENT,
      branches: COVERAGE_THRESHOLD_PERCENT,
      functions: COVERAGE_THRESHOLD_PERCENT,
      lines: COVERAGE_THRESHOLD_PERCENT,
    },
  },
};

export default jestConfig;
