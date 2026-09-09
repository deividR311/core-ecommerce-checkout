/** Dependencias de pruebas */
import type { Config } from 'jest';

/** Umbral mínimo de cobertura exigido por el proyecto */
const COVERAGE_THRESHOLD_PERCENT = 80;

/**
 * Configuración de Jest para las pruebas unitarias del frontend.
 * Se excluyen de cobertura el bootstrap (main.ts), los archivos que solo declaran tipos, los entornos y los mocks.
 */
const jestConfig: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/environments/**',
    '!src/testing/**',
  ],
  coverageDirectory: 'coverage',
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
