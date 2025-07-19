import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginNoRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser'],
    noStyle: true,
  }),
  {
    plugins: {
      import: eslintPluginImport,
      'no-relative-import-paths': eslintPluginNoRelativeImportPaths,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './server'],
            ['~', './src'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
    },
    rules: {
      // 'no-relative-import-paths/no-relative-import-paths': [
      //   'error',
      //   {
      //     allowSameFolder: false,
      //     rootDir: 'server',
      //     prefix: '@',
      //   },
      // ],
      'import/no-unresolved': 'error',
    },
    files: ['server/**/*'],
  },
  {
    plugins: {
      import: eslintPluginImport,
      'no-relative-import-paths': eslintPluginNoRelativeImportPaths,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './server'],
            ['~', './src'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html'],
        },
      },
    },
    files: ['src/**/*'],
    rules: {
      // 'no-relative-import-paths/no-relative-import-paths': [
      //   'error',
      //   {
      //     allowSameFolder: false,
      //     rootDir: 'src',
      //     prefix: '~',
      //   },
      // ],
      'import/no-unresolved': 'error',
    },
  },
]
