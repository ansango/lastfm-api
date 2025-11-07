import { generateSignature } from '../utils.js';
import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js';

export const parsePostParamsTrack = (config: LastFmConfig, params: TrackScrobbleRequest) => {
	const { artist, track, album, timestamp, sk } = params;

	const paramsUrl = { artist, track, timestamp, sk } as TrackScrobbleRequest;
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
	{ tracks, sk }: BatchTracksScrobbleRequest
) => {
	if (tracks.length > 50) {
		throw new Error('Max 50 tracks by request');
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
	const baseUrl = config.baseUrl || 'https://ws.audioscrobbler.com/2.0/';
	const response = await fetch(baseUrl, {
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
