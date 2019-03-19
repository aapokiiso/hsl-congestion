/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

// @lamiaoy/stylelint-config

module.exports = {
    extends: 'stylelint-config-sass-guidelines',
    rules: {
        'at-rule-empty-line-before': [
            'always',
            {
                except: [
                    'blockless-after-same-name-blockless',
                    'first-nested',
                ],
                ignore: [
                    'after-comment',
                ],
                ignoreAtRules: [
                    'else',
                    'else if',
                    'include',
                ],
            },
        ],
        'declaration-no-important': true,
        'indentation': 4,
        'max-nesting-depth': [
            3,
            {
                ignoreAtRules: [
                    'media',
                    'supports',
                    'include',
                    'mixin',
                ],
            },
        ],
        'number-leading-zero': null,
        'order/order': null,
        'order/properties-alphabetical-order': null,
        'selector-class-pattern': null,
    },
};
