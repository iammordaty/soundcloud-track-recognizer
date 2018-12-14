'use strict';

const { existsSync, mkdirSync } = require('fs');
const pMap = require('p-map');
const unique = require('array-unique');

const { createFragment, extractFragment } = require('./fragment.js');
const formatTimestamp = require('./timestamp.js');
const Recognizer = require('./recognizer.js');
const SoundCloud = require('./soundcloud.js');

/**
 * SoundCloud Track Recognizer core class
 */
class App {

    /**
     * @param {Object} config
     */
    constructor (config) {
        this.config = config;

        const { concurrency, recognizer, soundcloud, storage_dir } = config;

        this.soundcloud = new SoundCloud({ concurrency, storage_dir, ...soundcloud });
        this.recognizer = new Recognizer({ concurrency, storage_dir, ...recognizer });

        this.ensureDirectories();
    }

    /**
     * @private
     * @param {Object} params
     * @return {Array}
     */
    async getCommentedTracks (params) {
        const comments = await this.soundcloud.getComments(params);

        const trackIds = unique(comments.map(({ track_id }) => track_id));
        const tracks = await this.soundcloud.getTracks({ trackIds });

        const commentedTracks = comments.map(comment => {
            const track = tracks.find(track => track.id === comment.track_id);
            const commentedTrack = { track, comment };

            return commentedTrack;
        });

        return commentedTracks;
    }

    /**
     * @param {Array} commentedTracks
     * @return {Array}
     */
    async recognize (commentedTracks) {
        const fragments = await this.createFragments(commentedTracks);
        const results = await this.recognizer.recognize(fragments);

        return results;
    }

    /**
     * @param {Array} commentedTracks
     * @returns {Array}
     */
    async createFragments (commentedTracks) {
        const { fragment_cut_duration, concurrency, storage_dir } = this.config;

        const fragments = commentedTracks.map(({ comment, track, }) => {
            const fragment = createFragment({ comment, track, }, fragment_cut_duration);
            const timestamp = formatTimestamp(comment.timestamp, 'hh[h-]mm[m-]ss[s]');

            fragment.pathname = `${storage_dir}/fragments/${track.slug}-${timestamp}.mp3`;

            return { comment, track, fragment };
        });

        const missing = fragments.filter(({ fragment }) => !existsSync(fragment.pathname));

        if (!missing.length) {
            return fragments;
        }

        const mapper = ({ track, fragment }) => {
            const downloadPromise = this.soundcloud.downloadTrack(track);

            return downloadPromise.then(() => extractFragment(fragment, track));
        };

        await pMap(missing, mapper, { concurrency });

        return fragments;
    }

    /**
     * @private
     * @return {undefined}
     */
    ensureDirectories () {
        const { storage_dir } = this.config;
        const dirs = [ storage_dir, `${storage_dir}/streams`, `${storage_dir}/fragments`, `${storage_dir}/results` ];

        dirs.forEach(dir => {
            if (!existsSync(dir)) {
                mkdirSync(dir);
            }
        });
    }
}

module.exports = App;
