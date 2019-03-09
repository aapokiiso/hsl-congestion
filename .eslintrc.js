'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

// @lamiaoy/eslint-config

module.exports = {
    parser: 'babel-eslint',
    env: {
        commonjs: true,
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'script',
    },
    rules: {
        'array-callback-return': 'error',
        'arrow-body-style': 'error',
        'arrow-parens': [
            'error',
            'as-needed',
        ],
        'block-scoped-var': 'error',
        'block-spacing': 'error',
        'brace-style': [
            'error',
            '1tbs' // "one true brace style", eg. https://softwareengineering.stackexchange.com/a/99546
        ],
        'callback-return': 'error',
        'camelcase': 'error',
        'capitalized-comments': [
            'error',
            'always',
            {
                'ignoreConsecutiveComments': true,
            }
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'comma-spacing': 'error',
        'curly': [
            'error',
            'multi-line',
        ],
        'dot-location': [
            'error',
            'property',
        ],
        'eol-last': 'error',
        'eqeqeq': 'error',
        'func-call-spacing': 'error',
        'indent': [
            'error',
            4,
            {
                'SwitchCase': 1,
            }
        ],
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'max-statements-per-line': 'error', // Defaults to max 2
        'new-cap': 'error',
        'newline-per-chained-call': 'error', // Default to max 2
        'no-console': [
            'error',
            {
                'allow': [
                    'warn',
                    'error',
                ]
            }
        ],
        'no-else-return': 'error',
        'no-implicit-globals': 'error',
        'no-lonely-if': 'error',
        'no-magic-numbers': [
            'error',
            {
                'ignore': [ // Allow only zero and increment literals
                    -1,
                    0,
                    1,
                ],
                'enforceConst': true,
            }
        ],
        'no-multi-spaces': 'error',
        'no-multiple-empty-lines': 'error', // Defaults to max 2
        'no-param-reassign': 'error',
        'no-return-await': 'error',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-underscore-dangle': 'error',
        'no-unneeded-ternary': 'error',
        'no-use-before-define': [
            'error',
            {
                'functions': false,
            }
        ],
        'no-useless-return': 'error',
        'no-warning-comments': 'warn', // Warn (don't err) on to-dos, usually can't be fixed right away
        'no-whitespace-before-property': 'error',
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'object-shorthand': 'error',
        'operator-linebreak': [
            'error',
            'before',
        ],
        'padding-line-between-statements': [
            'error',
            {
                'blankLine': 'always',
                'prev': '*',
                'next': 'return',
            }
        ],
        'prefer-const': 'error',
        'prefer-destructuring': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'quotes': [
            'error',
            'single',
        ],
        'require-await': 'error',
        'semi': 'error',
        'spaced-comment': 'error',
        'template-curly-spacing': 'error',
        'strict': 'error',
        'valid-jsdoc': [
            'error',
            {
                'requireReturn': false,
                'requireParamDescription': false,
                'requireReturnDescription': false,
            }
        ]
    }
};
