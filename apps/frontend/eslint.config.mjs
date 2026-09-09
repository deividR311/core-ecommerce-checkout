// @ts-check
/** Configuración base del monorepo */
import baseConfig from '../../eslint.config.mjs';

/** Dependencias de lint */
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

/**
 * Configuración de lint del frontend: la base del monorepo y las reglas de Angular para TypeScript,
 * más las reglas de plantillas y accesibilidad para los archivos HTML.
 */
export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...baseConfig, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
