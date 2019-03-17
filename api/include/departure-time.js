'use strict';

module.exports = {
    /**
     * HSL Realtime API uses HH:MM format to store departure times.
     *
     * @param {String} departureTime - eg. "20:15"
     * @returns {number} - eg. 72900
     */
    convertToSeconds(departureTime) {
        const [hours, minutes] = departureTime.split(':');

        const minutesInHour = 60;
        const secondsInMinute = 60;

        return hours * minutesInHour * secondsInMinute + minutes * secondsInMinute;
    },
};
