/** Dependencias de pruebas */
import type { Config } from 'jest';

/** Umbral mínimo de cobertura exigido por el proyecto */
const COVERAGE_THRESHOLD_PERCENT = 80;

/**
 * Configuración de Jest para las pruebas unitarias del backend.
 * Se excluyen de cobertura el bootstrap (main.ts) y los archivos que solo declaran tipos (*.interface.ts).
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
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/*.interface.ts'],
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
