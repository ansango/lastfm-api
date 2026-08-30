import type { LastFmConfig } from '@/core/config.js'
import { exportLibrary } from './engines/library.js'
import { exportLovedTracks } from './engines/loved.js'
import { exportScrobbles } from './engines/scrobbles.js'
import type {
	ExporterLibraryRequest,
	ExporterLibraryResponse,
	ExporterLovedTracksRequest,
	ExporterLovedTracksResponse,
	ExporterScrobblesRequest,
	ExporterScrobblesResponse,
} from './schemas.js'

export interface ExporterService {
	/**
	 * Exports scrobble history with UTS checkpointing and multiple format engines (JSON, JSONL, CSV, ListenBrainz).
	 *
	 * @param {ExporterScrobblesRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ExporterScrobblesResponse>}
	 */
	exportScrobbles: (params: ExporterScrobblesRequest, init?: RequestInit) => Promise<ExporterScrobblesResponse>

	/**
	 * Exports all loved tracks for a user.
	 *
	 * @param {ExporterLovedTracksRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ExporterLovedTracksResponse>}
	 */
	exportLovedTracks: (params: ExporterLovedTracksRequest, init?: RequestInit) => Promise<ExporterLovedTracksResponse>

	/**
	 * Exports a user's artist library with playcounts and metadata.
	 *
	 * @param {ExporterLibraryRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ExporterLibraryResponse>}
	 */
	exportLibrary: (params: ExporterLibraryRequest, init?: RequestInit) => Promise<ExporterLibraryResponse>
}

export function createExporterService(config: LastFmConfig): ExporterService {
	return {
		exportScrobbles: (params, init) => exportScrobbles(config, params, init),
		exportLovedTracks: (params, init) => exportLovedTracks(config, params, init),
		exportLibrary: (params, init) => exportLibrary(config, params, init),
	}
}
