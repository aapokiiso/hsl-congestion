'use strict';

const moment = require('moment-timezone');

const secondsInDay = 86400;
const minutesInHour = 60;
const secondsInMinute = 60;

module.exports = {
    /**
     * HSL Realtime API uses HH:MM format to store departure times.
     *
     * @param {String} departureTime - eg. "20:15"
     * @param {boolean} shouldRollOver - if yes, append one full day to seconds
     * @returns {number} - eg. 72900
     */
    convertToSeconds(departureTime, shouldRollOver = false) {
        const [hours, minutes] = departureTime.split(':');

        return (shouldRollOver ? secondsInDay : 0)
            + hours * minutesInHour * secondsInMinute + minutes * secondsInMinute;
    },
    /**
     * @param {Date|Number|String} departureDate - eg. "2019-03-23"
     * @param {Number} departureTimeSeconds - eg. 30, 86400, 87000 etc
     * @returns {Date}
     */
    convertToDate(departureDate, departureTimeSeconds) {
        return moment(departureDate)
            .startOf('day')
            .add(departureTimeSeconds, 'seconds')
            .toDate();
    },
    /**
     * Most HSL trips operate on a ~30-hour schedule,
     * eg. the trip day changes around 4:30am. This means
     * the departure date might be 3rd of May, even though
     * the vehicle timestamp is already in 4th of May (eg. past midnight)
     *
     * @param {String} departureDate - eg. "2019-03-23"
     * @param {String} vehicleTimestamp - eg. "2019-03-24T01:36:32Z"
     * @returns {boolean}
     */
    shouldRollOverToNextDay(departureDate, vehicleTimestamp) {
        return moment(vehicleTimestamp).isAfter(departureDate, 'days');
    },
    hasRolledOverToNextDay(departureTimeSeconds) {
        return departureTimeSeconds > secondsInDay;
    },
};
