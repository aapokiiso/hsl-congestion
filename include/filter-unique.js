'use strict';

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
