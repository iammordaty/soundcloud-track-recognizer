'use strict';

const moment = require('moment');

require('moment-duration-format');

const durationFormatOpts = { trim: 'large', stopTrim: 'm' };

/**
 * @param {Number} timestamp
 * @param {String} format
 * @return {String}
 */
const format = (timestamp, format) => {
    const duration = moment.duration(timestamp, 'ms');
    const formatted = duration.format(format, durationFormatOpts);

    return formatted;
};

module.exports = format;
