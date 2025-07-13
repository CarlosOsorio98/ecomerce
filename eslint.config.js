import eslintPluginImport from 'eslint-plugin-import'
import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser'],
    noStyle: true,
  }),
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use @/* instead of ../*',
            },
            {
              group: ['../../*'],
              message: 'Use @/* instead of ../../*',
            },
          ],
        },
      ],
    },
    files: ['server/**/*'],
  },
]
