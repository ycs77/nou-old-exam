import ycs77, { GLOB_VUE } from '@ycs77/eslint-config'

export default ycs77(
  {
    vue: true,
    typescript: true,
    ignores: ['data/*.json'],
  },
  {
    files: [GLOB_VUE],
    rules: {
      'vue/no-template-shadow': 'off',
    },
  },
)
