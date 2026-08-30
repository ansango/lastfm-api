import type { LastFmConfig } from '../../core/config.js'
import { buildUrl, fetcher, LastFmApiError, signedPost } from '../../core/index.js'
import type {
	ArtistAddTagsRequest,
	ArtistGetCorrectionRequest,
	ArtistGetCorrectionResponse,
	ArtistGetInfoRequest,
	ArtistGetInfoResponse,
	ArtistGetSimilarRequest,
	ArtistGetSimilarResponse,
	ArtistGetTagsRequest,
	ArtistGetTagsResponse,
	ArtistGetTopAlbumsRequest,
	ArtistGetTopAlbumsResponse,
	ArtistGetTopTagsRequest,
	ArtistGetTopTagsResponse,
	ArtistGetTopTracksRequest,
	ArtistGetTopTracksResponse,
	ArtistRemoveTagRequest,
	ArtistSearchRequest,
	ArtistSearchResponse,
} from './schemas.js'

export interface ArtistService {
	getInfo: (params: ArtistGetInfoRequest, init?: RequestInit) => Promise<ArtistGetInfoResponse>
	getSimilar: (params: ArtistGetSimilarRequest, init?: RequestInit) => Promise<ArtistGetSimilarResponse>
	getTags: (params: ArtistGetTagsRequest, init?: RequestInit) => Promise<ArtistGetTagsResponse>
	getTopTags: (params: ArtistGetTopTagsRequest, init?: RequestInit) => Promise<ArtistGetTopTagsResponse>
	getTopAlbums: (params: ArtistGetTopAlbumsRequest, init?: RequestInit) => Promise<ArtistGetTopAlbumsResponse>
	getTopTracks: (params: ArtistGetTopTracksRequest, init?: RequestInit) => Promise<ArtistGetTopTracksResponse>
	search: (params: ArtistSearchRequest, init?: RequestInit) => Promise<ArtistSearchResponse>
	getCorrection: (params: ArtistGetCorrectionRequest, init?: RequestInit) => Promise<ArtistGetCorrectionResponse>
	addTags: (params: ArtistAddTagsRequest, init?: RequestInit) => Promise<void>
	removeTag: (params: ArtistRemoveTagRequest, init?: RequestInit) => Promise<void>
}

function resolveSessionKeyForArtistMutation(
	config: LastFmConfig,
	requestSk: string | undefined,
	action: 'addTags' | 'removeTag',
): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new LastFmApiError(
			`A session key (\`sk\`) is required to artist.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`,
			0,
		)
	}
	return sk
}

export function createArtistService(config: LastFmConfig): ArtistService {
	return {
		getInfo: (params, init) =>
			fetcher<ArtistGetInfoResponse>(buildUrl(config, 'artist.getInfo', params), init, config.cacheManager),
		getTags: (params, init) =>
			fetcher<ArtistGetTagsResponse>(buildUrl(config, 'artist.getTags', params), init, config.cacheManager),
		getSimilar: (params, init) =>
			fetcher<ArtistGetSimilarResponse>(buildUrl(config, 'artist.getSimilar', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<ArtistGetTopTagsResponse>(buildUrl(config, 'artist.getTopTags', params), init, config.cacheManager),
		getTopAlbums: (params, init) =>
			fetcher<ArtistGetTopAlbumsResponse>(buildUrl(config, 'artist.getTopAlbums', params), init, config.cacheManager),
		getTopTracks: (params, init) =>
			fetcher<ArtistGetTopTracksResponse>(buildUrl(config, 'artist.getTopTracks', params), init, config.cacheManager),
		search: (params, init) =>
			fetcher<ArtistSearchResponse>(buildUrl(config, 'artist.search', params), init, config.cacheManager),
		getCorrection: (params, init) =>
			fetcher<ArtistGetCorrectionResponse>(buildUrl(config, 'artist.getCorrection', params), init, config.cacheManager),
		addTags: (params, init) => {
			const sk = resolveSessionKeyForArtistMutation(config, params.sk, 'addTags')
			return signedPost(config, 'artist.addTags', {
				params: {
					artist: params.artist,
					tags: params.tags.join(','),
					sk,
				},
				init,
			}).then(() => undefined)
		},
		removeTag: (params, init) => {
			const sk = resolveSessionKeyForArtistMutation(config, params.sk, 'removeTag')
			return signedPost(config, 'artist.removeTag', {
				params: {
					artist: params.artist,
					tag: params.tag,
					sk,
				},
				init,
			}).then(() => undefined)
		},
	}
}
