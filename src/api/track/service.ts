import type { LastFmConfig } from '@/core/config.js'
import { buildUrl, fetcher, LastFmApiError, signedPost } from '@/core/index.js'
import type {
	BatchTracksScrobbleRequest,
	TrackAddTagsRequest,
	TrackGetCorrectionRequest,
	TrackGetCorrectionResponse,
	TrackGetInfoRequest,
	TrackGetInfoResponse,
	TrackGetSimilarRequest,
	TrackGetSimilarResponse,
	TrackGetTagsRequest,
	TrackGetTagsResponse,
	TrackGetTopTagsRequest,
	TrackGetTopTagsResponse,
	TrackLoveRequest,
	TrackRemoveTagRequest,
	TrackScrobbleRequest,
	TrackScrobbleResponse,
	TrackSearchRequest,
	TrackSearchResponse,
	TrackUnloveRequest,
	TrackUpdateNowPlayingRequest,
	TrackUpdateNowPlayingResponse,
} from './schemas.js'
import { buildBatchScrobbleParams, buildScrobbleParams } from './utils.js'

export interface TrackService {
	getInfo: (params: TrackGetInfoRequest, init?: RequestInit) => Promise<TrackGetInfoResponse>
	getSimilar: (params: TrackGetSimilarRequest, init?: RequestInit) => Promise<TrackGetSimilarResponse>
	getTags: (params: TrackGetTagsRequest, init?: RequestInit) => Promise<TrackGetTagsResponse>
	getTopTags: (params: TrackGetTopTagsRequest, init?: RequestInit) => Promise<TrackGetTopTagsResponse>
	getCorrection: (params: TrackGetCorrectionRequest, init?: RequestInit) => Promise<TrackGetCorrectionResponse>
	search: (params: TrackSearchRequest, init?: RequestInit) => Promise<TrackSearchResponse>
	scrobble: (params: TrackScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>
	postTrackScrobble: (params: TrackScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>
	scrobbleMany: (params: BatchTracksScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>
	postBatchTrackScrobble: (params: BatchTracksScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>
	addTags: (params: TrackAddTagsRequest, init?: RequestInit) => Promise<void>
	removeTag: (params: TrackRemoveTagRequest, init?: RequestInit) => Promise<void>
	love: (params: TrackLoveRequest, init?: RequestInit) => Promise<void>
	unlove: (params: TrackUnloveRequest, init?: RequestInit) => Promise<void>
	updateNowPlaying: (params: TrackUpdateNowPlayingRequest, init?: RequestInit) => Promise<TrackUpdateNowPlayingResponse>
}

function resolveSessionKeyForTrackMutation(
	config: LastFmConfig,
	requestSk: string | undefined,
	action: 'addTags' | 'removeTag' | 'love' | 'unlove',
): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new LastFmApiError(
			`A session key (\`sk\`) is required to track.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`,
			0,
		)
	}
	return sk
}

function resolveSessionKeyForNowPlaying(config: LastFmConfig, requestSk: string | undefined): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new LastFmApiError(
			'A session key (`sk`) is required to track.updateNowPlaying. Pass `sk` in the request params or set `sessionKey` on the LastFmConfig.',
			0,
		)
	}
	return sk
}

export function createTrackService(config: LastFmConfig): TrackService {
	const scrobbleImpl = (params: TrackScrobbleRequest, init?: RequestInit) =>
		signedPost<TrackScrobbleResponse>(config, 'track.scrobble', {
			params: buildScrobbleParams(config, params),
			init,
		})

	const scrobbleManyImpl = (params: BatchTracksScrobbleRequest, init?: RequestInit) =>
		signedPost<TrackScrobbleResponse>(config, 'track.scrobble', {
			params: buildBatchScrobbleParams(config, params),
			init,
		})

	return {
		getInfo: (params, init) =>
			fetcher<TrackGetInfoResponse>(buildUrl(config, 'track.getInfo', params), init, config.cacheManager),
		getSimilar: (params, init) =>
			fetcher<TrackGetSimilarResponse>(buildUrl(config, 'track.getSimilar', params), init, config.cacheManager),
		getTags: (params, init) =>
			fetcher<TrackGetTagsResponse>(buildUrl(config, 'track.getTags', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<TrackGetTopTagsResponse>(buildUrl(config, 'track.getTopTags', params), init, config.cacheManager),
		getCorrection: (params, init) =>
			fetcher<TrackGetCorrectionResponse>(buildUrl(config, 'track.getCorrection', params), init, config.cacheManager),
		search: (params, init) =>
			fetcher<TrackSearchResponse>(buildUrl(config, 'track.search', params), init, config.cacheManager),
		scrobble: scrobbleImpl,
		postTrackScrobble: scrobbleImpl,
		scrobbleMany: scrobbleManyImpl,
		postBatchTrackScrobble: scrobbleManyImpl,
		addTags: (params, init) => {
			const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'addTags')
			return signedPost(config, 'track.addTags', {
				params: {
					artist: params.artist,
					track: params.track,
					tags: params.tags.join(','),
					sk,
				},
				init,
			}).then(() => undefined)
		},
		removeTag: (params, init) => {
			const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'removeTag')
			return signedPost(config, 'track.removeTag', {
				params: {
					artist: params.artist,
					track: params.track,
					tag: params.tag,
					sk,
				},
				init,
			}).then(() => undefined)
		},
		love: (params, init) => {
			const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'love')
			return signedPost(config, 'track.love', {
				params: { artist: params.artist, track: params.track, sk },
				init,
			}).then(() => undefined)
		},
		unlove: (params, init) => {
			const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'unlove')
			return signedPost(config, 'track.unlove', {
				params: { artist: params.artist, track: params.track, sk },
				init,
			}).then(() => undefined)
		},
		updateNowPlaying: (params, init) => {
			const sk = resolveSessionKeyForNowPlaying(config, params.sk)
			return signedPost<TrackUpdateNowPlayingResponse>(config, 'track.updateNowPlaying', {
				params: {
					artist: params.artist,
					track: params.track,
					album: params.album,
					trackNumber: params.trackNumber,
					context: params.context,
					mbid: params.mbid,
					duration: params.duration,
					albumArtist: params.albumArtist,
					sk,
				},
				init,
			})
		},
	}
}
