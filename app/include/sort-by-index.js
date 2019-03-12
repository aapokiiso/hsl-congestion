'use strict';

module.exports = function sortByIndex(arrToReference, sortDescending = false) {
    return function (a, b) {
        if (sortDescending) {
            return arrToReference.indexOf(b) - arrToReference.indexOf(a);
        }

        return arrToReference.indexOf(a) - arrToReference.indexOf(b);
    };
};
