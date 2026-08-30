import { buildUrl, fetcher, LastFmApiError, signedPost } from '../common/index.js'
import type { LastFmConfig } from '../config.js'
import type {
	AlbumAddTagsRequest,
	AlbumGetInfoRequest,
	AlbumGetInfoResponse,
	AlbumGetTagsRequest,
	AlbumGetTagsResponse,
	AlbumGetTopTagsRequest,
	AlbumGetTopTagsResponse,
	AlbumRemoveTagRequest,
	AlbumSearchRequest,
	AlbumSearchResponse,
} from './schemas.js'

export interface AlbumService {
	getInfo: (params: AlbumGetInfoRequest, init?: RequestInit) => Promise<AlbumGetInfoResponse>
	getTags: (params: AlbumGetTagsRequest, init?: RequestInit) => Promise<AlbumGetTagsResponse>
	getTopTags: (params: AlbumGetTopTagsRequest, init?: RequestInit) => Promise<AlbumGetTopTagsResponse>
	search: (params: AlbumSearchRequest, init?: RequestInit) => Promise<AlbumSearchResponse>
	addTags: (params: AlbumAddTagsRequest, init?: RequestInit) => Promise<void>
	removeTag: (params: AlbumRemoveTagRequest, init?: RequestInit) => Promise<void>
}

function resolveSessionKeyForAlbumMutation(
	config: LastFmConfig,
	requestSk: string | undefined,
	action: 'addTags' | 'removeTag',
): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new LastFmApiError(
			`A session key (\`sk\`) is required to album.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`,
			0,
		)
	}
	return sk
}

export function createAlbumService(config: LastFmConfig): AlbumService {
	return {
		getInfo: (params, init) =>
			fetcher<AlbumGetInfoResponse>(buildUrl(config, 'album.getInfo', params), init, config.cacheManager),
		getTags: (params, init) =>
			fetcher<AlbumGetTagsResponse>(buildUrl(config, 'album.getTags', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<AlbumGetTopTagsResponse>(buildUrl(config, 'album.getTopTags', params), init, config.cacheManager),
		search: (params, init) =>
			fetcher<AlbumSearchResponse>(buildUrl(config, 'album.search', params), init, config.cacheManager),
		addTags: (params, init) => {
			const sk = resolveSessionKeyForAlbumMutation(config, params.sk, 'addTags')
			return signedPost(config, 'album.addTags', {
				params: {
					artist: params.artist,
					album: params.album,
					tags: params.tags.join(','),
					sk,
				},
				init,
			}).then(() => undefined)
		},
		removeTag: (params, init) => {
			const sk = resolveSessionKeyForAlbumMutation(config, params.sk, 'removeTag')
			return signedPost(config, 'album.removeTag', {
				params: {
					artist: params.artist,
					album: params.album,
					tag: params.tag,
					sk,
				},
				init,
			}).then(() => undefined)
		},
	}
}
