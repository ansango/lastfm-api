import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../core/services/user.js'
import type {
	InsightAlbumSessionItem,
	InsightLongestSession,
	InsightsAlbumHabitsRequest,
	InsightsAlbumHabitsResponse,
} from '../schemas.js'

function categorizeHabit(cohesionScore: number): {
	profile: 'Album Purist' | 'Cohesive Listener' | 'Mixed Mode' | 'Playlist Shuffler'
	description: string
} {
	if (cohesionScore >= 70) {
		return {
			profile: 'Album Purist',
			description: 'Strong preference for complete, cohesive album listening sessions in continuous sequence.',
		}
	}
	if (cohesionScore >= 45) {
		return {
			profile: 'Cohesive Listener',
			description: 'Balanced listening style featuring deliberate multi-track album sessions alongside casual tracks.',
		}
	}
	if (cohesionScore >= 25) {
		return {
			profile: 'Mixed Mode',
			description: 'Regularly shuffles playlists and explores singles, with occasional focused album deep-dives.',
		}
	}
	return {
		profile: 'Playlist Shuffler',
		description: 'Almost exclusively listens in shuffle, curated playlist, or single-track discovery modes.',
	}
}

/**
 * Analyzes sequential listening history to assess album completion and cohesive listening habits.
 */
export async function getAlbumHabits(
	config: LastFmConfig,
	params: InsightsAlbumHabitsRequest,
	init?: RequestInit,
): Promise<InsightsAlbumHabitsResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 300),
	)
	const minSessionTracks = Math.max(2, Math.min(10, params.minSessionTracks ?? 3))

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks({ user: params.user, limit }, init)
	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	// Sort chronologically ascending
	const sorted = [...tracks].sort((a, b) => {
		const utsa = Number.parseInt(a.date?.uts ?? '0', 10)
		const utsb = Number.parseInt(b.date?.uts ?? '0', 10)
		return utsa - utsb
	})

	if (sorted.length === 0) {
		const { profile, description } = categorizeHabit(0)
		return {
			user: params.user,
			totalScrobblesInspected: 0,
			cohesionScore: 0,
			profile,
			description,
			albumSessionCount: 0,
			isolatedTracksCount: 0,
			averageSessionLength: 0,
			topAlbums: [],
			longestSession: null,
		}
	}

	interface TrackRun {
		artist: string
		album: string
		count: number
		startUts: number
		endUts: number
	}

	const runs: TrackRun[] = []
	let currentRun: TrackRun | null = null

	for (const t of sorted) {
		const artistName =
			typeof t.artist === 'object' && t.artist !== null
				? (t.artist['#text'] ?? t.artist.name ?? '')
				: String(t.artist ?? '')
		const albumName = typeof t.album === 'object' && t.album !== null ? (t.album['#text'] ?? '') : String(t.album ?? '')
		const uts = Number.parseInt(t.date?.uts ?? '0', 10) || 0

		// If no album is tagged, count as isolated
		if (!albumName.trim() || !artistName.trim()) {
			if (currentRun) {
				runs.push(currentRun)
				currentRun = null
			}
			runs.push({ artist: artistName, album: '', count: 1, startUts: uts, endUts: uts })
			continue
		}

		if (
			currentRun &&
			currentRun.artist.toLowerCase() === artistName.toLowerCase() &&
			currentRun.album.toLowerCase() === albumName.toLowerCase()
		) {
			currentRun.count += 1
			currentRun.endUts = uts
		} else {
			if (currentRun) {
				runs.push(currentRun)
			}
			currentRun = {
				artist: artistName,
				album: albumName,
				count: 1,
				startUts: uts,
				endUts: uts,
			}
		}
	}
	if (currentRun) {
		runs.push(currentRun)
	}

	let albumSessionTracksCount = 0
	let isolatedTracksCount = 0
	let albumSessionCount = 0
	let longestSession: InsightLongestSession | null = null
	let maxSessionLength = 0

	const albumAgg: Record<string, { artist: string; album: string; sessionCount: number; totalTracksPlayed: number }> =
		{}

	for (const run of runs) {
		if (run.count >= minSessionTracks && run.album.length > 0) {
			albumSessionCount += 1
			albumSessionTracksCount += run.count

			const key = `${run.artist.toLowerCase()}:::${run.album.toLowerCase()}`
			if (!albumAgg[key]) {
				albumAgg[key] = {
					artist: run.artist,
					album: run.album,
					sessionCount: 0,
					totalTracksPlayed: 0,
				}
			}
			albumAgg[key].sessionCount += 1
			albumAgg[key].totalTracksPlayed += run.count

			if (run.count > maxSessionLength) {
				maxSessionLength = run.count
				const durationHours = Math.round(((run.endUts - run.startUts) / 3600) * 100) / 100
				longestSession = {
					artist: run.artist,
					album: run.album,
					trackCount: run.count,
					startTime: run.startUts,
					endTime: run.endUts,
					durationHours: Math.max(0.05, durationHours),
				}
			}
		} else {
			isolatedTracksCount += run.count
		}
	}

	const cohesionRatio = sorted.length > 0 ? albumSessionTracksCount / sorted.length : 0
	const cohesionScore = Math.round(cohesionRatio * 10000) / 100
	const { profile, description } = categorizeHabit(cohesionScore)

	const avgSessionLen = albumSessionCount > 0 ? Math.round((albumSessionTracksCount / albumSessionCount) * 10) / 10 : 0

	const topAlbums: InsightAlbumSessionItem[] = Object.values(albumAgg)
		.sort((a, b) => b.totalTracksPlayed - a.totalTracksPlayed || b.sessionCount - a.sessionCount)
		.slice(0, 10)

	return {
		user: params.user,
		totalScrobblesInspected: sorted.length,
		cohesionScore,
		profile,
		description,
		albumSessionCount,
		isolatedTracksCount,
		averageSessionLength: avgSessionLen,
		topAlbums,
		longestSession,
	}
}
