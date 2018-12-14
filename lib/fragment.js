'use strict';

const { spawn } = require('child-process-promise');

const formatTimestamp = require('./timestamp.js');

/**
 * @param {Object} commentedTrack
 * @param {Number} duration
 * @returns {Array}
 */
const createFragment = ({ comment, track }, duration) => {
    const { start, end } = calculateStartEnd(comment.timestamp, track.duration, duration);

    const fragment = {
        start,
        end
    };

    return fragment;
};

/**
 * @param {Object} track
 * @param {Object} fragment
 * @returns {Promise}
 */
const extractFragment = ({ start, end, pathname: output }, { pathname: input }) => {
    const args = [ '-hide_banner', '-y', '-i', input, '-vn', '-acodec', 'copy', '-ss', start, '-to', end, output ];
    const child = spawn('ffmpeg', args);

    return child;
};

/**
 * @param {Number} commentTimestamp
 * @param {Number} trackDuration
 * @param {Number} fragmentDuration
 * @returns {Array}
 */
const calculateStartEnd = (commentTimestamp, trackDuration, fragmentDuration) => {
    const fragmentDurationMs = fragmentDuration * 1000;

    let start = commentTimestamp - (fragmentDurationMs / 2);
    let end = start + fragmentDurationMs;

    if (start < 0) {
        start = 0;
    }

    if (end > trackDuration) {
        end = trackDuration;
    }

    return {
        start: formatTimestamp(start, 'hh:mm:ss'),
        end: formatTimestamp(end, 'hh:mm:ss'),
    };
};

module.exports = {
    createFragment,
    extractFragment,
};
