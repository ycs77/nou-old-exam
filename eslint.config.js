import ycs77, { GLOB_TS, GLOB_VUE } from '@ycs77/eslint-config'

export default ycs77(
  {
    vue: true,
    typescript: true,
    ignores: ['data/*.json'],
  },
  {
    files: [GLOB_TS, GLOB_VUE],
    rules: {
      'no-console': 'warn',

      'ts/ban-ts-comment': 'off',
      'ts/no-invalid-this': 'off',
      'ts/prefer-ts-expect-error': 'off',
    },
  },
  {
    files: [GLOB_VUE],
    rules: {
      'vue/multiline-html-element-content-newline': 'off',
      'vue/no-template-shadow': 'off',
    },
  },
)
