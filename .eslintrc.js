module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  root: true,
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'indent': [
      'warn',
      2, // Number of indent spaces
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
    'max-len': [
      'error',
      {
        code: 150,
      },
    ],
    'semi': [ // Enforce semi-colon
      'error',
      'always',
      {
        omitLastInOneLineBlock: true,
      },
    ],
    'quotes': [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
        avoidEscape: true,
      },
    ],
    'semi-spacing': 'warn',
    'space-unary-ops': [
      'warn',
      {
        words: true,
        nonwords: false,
      },
    ],
    'keyword-spacing': 'warn',
    'no-console': 'warn',
    'no-empty': [ // Prevent empty code block `{}` except for catch clause.
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'curly': ['warn', 'all'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'no-trailing-spaces': 'warn',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': [
      'error',
      {
        hoist: 'all',
        allow: ['serverAPI']
      },
    ],
    'arrow-body-style': ['error'],
    'arrow-parens': ['error', 'as-needed'],
    'no-confusing-arrow': ['error', { 'allowParens': true }],
    'brace-style': ['off'],
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error'],
    'eqeqeq': ['error', 'smart'],
    'for-direction': 'error',
    'getter-return': 'error',
    'guard-for-in': 'error',
    'id-blacklist': [
      'error',
      'any',
      'Number',
      'number',
      'String',
      'string',
      'Boolean',
      'boolean',
      'Undefined',
      'undefined',
    ],
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
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],


    /**
     * Typescript specific rules
     */
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple',
      },
    ],

    // Prevent mandatory return type on functions
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Allow working with `any` type
    '@typescript-eslint/no-explicit-any': 'warn',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',

    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: true,
        ignoreIIFE: true,
      },
    ],
    // Allow returning a promise in a function that expects void.
    // Required for using async/await inside said function even if nothing is returned.
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/brace-style': ['error', '1tbs'],
    '@typescript-eslint/no-non-null-assertion': 'off',
  }
};