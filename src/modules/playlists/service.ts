import type { LastFmConfig } from '@/core/config.js'
import { formatCsv } from './formatters/csv.js'
import { formatM3U } from './formatters/m3u.js'
import { generatePlaylist } from './generators/generator.js'
import type {
	PlaylistsExportCsvRequest,
	PlaylistsExportCsvResponse,
	PlaylistsExportM3URequest,
	PlaylistsExportM3UResponse,
	PlaylistsGenerateRequest,
	PlaylistsGenerateResponse,
} from './schemas.js'

export interface PlaylistsService {
	/**
	 * Generates a smart playlist based on algorithmic rules ('time-capsule', 'deep-cuts', 'heavy-rotation', 'discovery-radar').
	 *
	 * @param {PlaylistsGenerateRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<PlaylistsGenerateResponse>}
	 */
	generate: (params: PlaylistsGenerateRequest, init?: RequestInit) => Promise<PlaylistsGenerateResponse>

	/**
	 * Formats a track list into standard M3U playlist format.
	 *
	 * @param {PlaylistsExportM3URequest} params
	 * @returns {Promise<PlaylistsExportM3UResponse>}
	 */
	exportM3U: (params: PlaylistsExportM3URequest) => Promise<PlaylistsExportM3UResponse>

	/**
	 * Formats a track list into a CSV document.
	 *
	 * @param {PlaylistsExportCsvRequest} params
	 * @returns {Promise<PlaylistsExportCsvResponse>}
	 */
	exportCsv: (params: PlaylistsExportCsvRequest) => Promise<PlaylistsExportCsvResponse>
}

export function createPlaylistsService(config: LastFmConfig): PlaylistsService {
	return {
		generate: (params, init) => generatePlaylist(config, params, init),
		exportM3U: async (params) => {
			const filename = `${params.title ? params.title.toLowerCase().replace(/\s+/g, '-') : 'playlist'}.m3u`
			const content = formatM3U(params.tracks, params.title)
			return {
				filename,
				content,
				totalTracks: params.tracks.length,
			}
		},
		exportCsv: async (params) => {
			const filename = params.filename ?? 'playlist.csv'
			const content = formatCsv(params.tracks)
			return {
				filename,
				content,
				totalTracks: params.tracks.length,
			}
		},
	}
}
