// @ts-check
/** Configuración base del monorepo */
import baseConfig from '../../eslint.config.mjs';

/** Dependencias de lint */
import tseslint from 'typescript-eslint';

/** Configuración de lint del backend: extiende la base con el proyecto TypeScript de esta aplicación */
export default tseslint.config(...baseConfig, {
  languageOptions: {
    sourceType: 'commonjs',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
