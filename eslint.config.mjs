import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  rules: {
    'antfu/top-level-function': 'off',
    'no-console': 'off',
    'vue/multi-word-component-names': 0,
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 0,
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any',
          normal: 'any',
          component: 'any',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'ts/no-empty-object-types': 'off',
  },
})
