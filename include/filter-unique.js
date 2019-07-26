'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

/**
 * Remove duplicates from array
 * @param {*} val
 * @param {number} idx
 * @param {Array} arr
 * @returns {boolean}
 */
module.exports = function filterUnique(val, idx, arr) {
    return arr.indexOf(val) === idx;
};
