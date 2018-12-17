'use strict';

const AudioRecognizer = require('audio-recognizer');
const flatten = require('array-flatten');
const pMap = require('p-map');

class Recognizer {

    /**
     * @param {Object} config
     */
    constructor (config) {
        this.config = config;

        const { acrcloud, auddmusic, cache_success_responses, normalize_results, storage_dir } = config;
        const cache_dir = `${storage_dir}/results`;

        this.recognizer = new AudioRecognizer({
            acrcloud,
            auddmusic,
            cache_dir,
            cache_success_responses,
            normalize_results,
        });
    }

    /**
     * @public
     * @param {Array} fragments
     * @returns {Array}
     */
    async recognize (fragments) {
        const { concurrency } = this.config;

        const mapper = ({ fragment }) => this.recognizer.recognize(fragment.pathname);
        const recognized = await pMap(fragments, mapper, { concurrency });
        const groupped = this.groupByFragment(recognized);

        const combined = fragments.map(({ comment, track, fragment }, i) => {
            fragment.recognize = groupped[i];

            return { comment, track, fragment };
        });

        return combined;
    }

    /**
     * @private
     * @param {Array} results
     * @returns {Array}
     */
    groupByFragment (results) {
        const groupped = results.map(fragment => {
            const status = fragment.map(({ provider, status }) => ({ provider, status }));
            const results = fragment.map(({ provider, results }) => results.map(r => ({ ...r, provider })));

            return {
                status,
                results: flatten(results)
            };
        });

        return groupped;
    }
}

module.exports = Recognizer;
