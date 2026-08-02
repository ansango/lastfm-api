import { generateSignature } from '../utils.js';
import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js';

export const parsePostParamsTrack = (config: LastFmConfig, params: TrackScrobbleRequest) => {
	const { artist, track, album, timestamp, sk: skParam } = params;
	const sk = skParam ?? config.sessionKey;

	if (!sk) {
		throw new Error(
			'A session key (`sk`) is required to scrobble. Pass `sk` in the request params or set `sessionKey` on the LastFmConfig.'
		);
	}

	const paramsUrl: Record<string, string> = { artist, track, timestamp, sk };
	if (album) paramsUrl.album = album;
	const api_sig = generateSignature(config, {
		method: 'track.scrobble',
		api_key: config.apiKey,
		...paramsUrl
	});
	return { ...paramsUrl, api_sig };
};

export const parsePostParamsBatchTrack = (
	config: LastFmConfig,
	{ tracks, sk: skParam }: BatchTracksScrobbleRequest
) => {
	if (tracks.length > 50) {
		throw new Error('Max 50 tracks by request');
	}
	const sk = skParam ?? config.sessionKey;
	if (!sk) {
		throw new Error(
			'A session key (`sk`) is required to scrobble. Pass `sk` in the request params or set `sessionKey` on the LastFmConfig.'
		);
	}
	const params = {
		method: 'track.scrobble',
		api_key: config.apiKey,
		sk
	} as Record<string, string>;

	tracks.forEach((track, index) => {
		params[`artist[${index}]`] = track.artist;
		params[`track[${index}]`] = track.track;
		params[`timestamp[${index}]`] = track.timestamp;

		if (track.album) {
			params[`album[${index}]`] = track.album;
		}
	});

	const api_sig = generateSignature(config, params);
	params.api_sig = api_sig;

	const body = Object.keys(params)
		.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
		.join('&');

	return body;
};

export const batchFetcher = async (config: LastFmConfig, { body }: { body: string }) => {
	const response = await fetch(config.baseUrl!, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});

	if (!response.ok) {
		throw new Error('Error scrobbling tracks');
	}
	return true;
};
