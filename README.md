# soundcloud-track-recognizer

Node.js module that fetches comments and streams from SoundCloud and tries to recognize commented fragments via audio recognition services.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Further information](#further-information)
- [See also](#see-also)
- [License](#license)

## Requirements

- [ACRCloud Access Key and Access Secret](https://www.acrcloud.com/)
- [AudD API Token](https://audd.io)
- [FFmpeg](https://www.ffmpeg.org)
- [SoundCloud API Client Id](https://developers.soundcloud.com)

## Installation

This library can be installed through npm:

```
$ npm install --save soundcloud-track-recognizer
```

## Usage

```js
const SoundCloudTrackRecognizer = require('soundcloud-track-recognizer');

const config = {/* ... */};
const recognizer = new SoundCloudTrackRecognizer(config);

// fetch user's comments and commented track data
const commentedTracks = await recognizer.getCommentedTracks(params);

// download tracks and extract fragments
const fragments = await recognizer.createFragments(commentedTracks);

// recognize fragments
const results = await recognizer.recognize(fragments);
```

See [soundcloud-track-recognizer-cli](https://github.com/iammordaty/soundcloud-track-recognizer-cli) for more information.

## Further information

- [ACRCloud HTTP API Reference](https://www.acrcloud.com/docs/acrcloud/audio-fingerprinting-api)
- [AudD Music Recognition HTTP API Reference](https://docs.audd.io)
- [SoundCloud HTTP API Reference](https://developers.soundcloud.com/docs/api/reference)

## See also

- [audio-recognizer](https://github.com/iammordaty/audio-recognizer)
- [soundcloud-api-client](https://github.com/iammordaty/soundcloud-api-client)
- [soundcloud-track-recognizer-cli](https://github.com/iammordaty/soundcloud-track-recognizer-cli)

## License

soundcloud-track-recognizer is licensed under the MIT License.
