'use strict';

const { existsSync } = require('fs');
const chunk = require('chunk');
const flatten = require('array-flatten');
const pMap = require('p-map');
const slugify = require('slugify');
const SoundCloudApiClient = require('soundcloud-api-client');

const MATCH_ALL_COMMENTS = /.*/i;

slugify.extend({ ':': '-' });

class SoundCloud {

    /**
     * @param {Object} config
     */
    constructor (config) {
        this.config = config;

        const { limiter, client_id } = config;

        this.limiter = limiter;
        this.soundcloud = new SoundCloudApiClient({ client_id });
    }

    /**
     * @param {Object} params
     * @return {Array}
     */
    async getComments (params) {
        const comments = [];

        const comment_filter = params.comment_filter || MATCH_ALL_COMMENTS;
        const limit = parseInt(params.limit) || Number.MAX_SAFE_INTEGER;
        const qs = { offset: 0, limit: this.config.batch_size };

        console.log(comment_filter);

        do {
            const userComments = await this.soundcloud.get(`/users/${params.username}/comments`, qs);

            if (!userComments.length) {
                break;
            }

            qs.offset += userComments.length;

            const trackIdComments = userComments.filter(({ body }) => body.match(comment_filter));

            if (comments.length + trackIdComments.length > limit) {
                trackIdComments.splice(limit - comments.length);
            }

            comments.push(...trackIdComments);
        } while (comments.length < limit);

        return comments;
    }

    /**
     * @param {Object} params
     * @return {Array}
     */
    async getTracks (params) {
        const { batch_size, concurrency, storage_dir } = this.config;

        const mapper = async trackIds => {
            const ids = trackIds.join(',');
            const tracks = await this.soundcloud.get('/tracks', { ids });

            return tracks;
        };

        const chunkedTrackIds = chunk(params.trackIds, batch_size);
        const chunkedTracks = await pMap(chunkedTrackIds, mapper, { concurrency });

        const tracks = flatten(chunkedTracks).map(track => {
            const slug = slugify(track.title, { remove: /[^\w\s-]/g, lower: true });
            const pathname = `${storage_dir}/streams/${slug}.mp3`;

            return { pathname, slug, ...track };
        });

        return tracks;
    }

    /**
     * @param {Object} track
     * @return {Promise}
     */
    downloadTrack ({ stream_url, pathname }) {
        if (existsSync(pathname)) {
            return Promise.resolve();
        }

        return this.soundcloud.download(stream_url, pathname);
    }
}

module.exports = SoundCloud;
