import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'jest.config.cjs'],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['tsconfig.json', 'tsconfig.test.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      'indent': [
        'warn',
        2,
        {
          SwitchCase: 1,
          FunctionDeclaration: { parameters: 'first' },
          FunctionExpression: { parameters: 'first' },
          ignoredNodes: [
            'FunctionExpression > .params[decorators.length > 0]',
            'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
            'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
          ],
        },
      ],
      'max-len': ['error', { code: 150 }],
      'semi': ['error', 'always', { omitLastInOneLineBlock: true }],
      'quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
      'semi-spacing': 'warn',
      'space-unary-ops': ['warn', { words: true, nonwords: false }],
      'keyword-spacing': 'warn',
      'no-console': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'curly': ['warn', 'all'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'no-trailing-spaces': 'warn',
      'no-shadow': 'off',
      'arrow-body-style': ['error'],
      'arrow-parens': ['error', 'as-needed'],
      'no-confusing-arrow': ['error', { allowParens: true }],
      'brace-style': ['off'],
      'comma-dangle': ['error', 'always-multiline'],
      'eol-last': ['error'],
      'eqeqeq': ['error', 'smart'],
      'for-direction': 'error',
      'getter-return': 'error',
      'guard-for-in': 'error',
      'max-classes-per-file': 'off',
      'new-parens': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-dupe-args': 'error',
      'no-eval': 'error',
      'no-import-assign': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-multiple-empty-lines': 'error',
      'no-new-symbol': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-setter-return': 'error',
      'no-this-before-super': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'warn',
      'no-unsafe-negation': 'warn',
      'quote-props': ['error', 'consistent-as-needed'],
      'radix': ['warn', 'as-needed'],
      'spaced-comment': ['error', 'always', { markers: ['/'] }],

      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      // member-delimiter-style and no-extra-semi removed in @typescript-eslint v8 (use Prettier)
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true, ignoreIIFE: true }],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      // type-annotation-spacing and brace-style removed in @typescript-eslint v8 (use Prettier)
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': ['error', { hoist: 'all', allow: ['serverAPI', 'backend'] }],

      // id-blacklist was removed in ESLint 9; replaced by id-denylist
      'id-denylist': ['error', 'any', 'Number', 'number', 'String', 'string', 'Boolean', 'boolean', 'Undefined', 'undefined'],
    },
  },
];
