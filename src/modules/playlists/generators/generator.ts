import { createArtistService } from '@/api/artist/service.js'
import { createUserService } from '@/api/user/service.js'
import type { LastFmConfig } from '@/core/config.js'
import { formatCsv } from '../formatters/csv.js'
import { formatM3U } from '../formatters/m3u.js'
import { formatSpotifyQueries } from '../formatters/spotifymatch.js'
import type { PlaylistsGenerateRequest, PlaylistsGenerateResponse, PlaylistTrackItem } from '../schemas.js'

export async function generatePlaylist(
	config: LastFmConfig,
	params: PlaylistsGenerateRequest,
	init?: RequestInit,
): Promise<PlaylistsGenerateResponse> {
	const limit = Math.min(
		100,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 25),
	)

	const userService = createUserService(config)
	const artistService = createArtistService(config)

	let title = 'Generated Playlist'
	let description = ''
	const tracks: PlaylistTrackItem[] = []

	if (params.mode === 'heavy-rotation') {
		title = `${params.user}'s Heavy Rotation`
		description = 'Current top rotation tracks from the last 30 days.'

		const topRes = await userService.getTopTracks({ user: params.user, period: '1month', limit }, init)
		const raw = topRes.toptracks?.track ?? []
		const list = Array.isArray(raw) ? raw : [raw]

		for (const t of list) {
			const artist = typeof t.artist === 'object' && t.artist !== null ? (t.artist.name ?? '') : String(t.artist ?? '')
			const name = t.name ?? ''
			if (name && artist) {
				tracks.push({
					name,
					artist,
					duration: Number.parseInt(String(t.duration ?? '0'), 10) || undefined,
					sourceReason: `Top track (playcount: ${t.playcount})`,
				})
			}
		}
	} else if (params.mode === 'time-capsule') {
		title = `${params.user}'s Time Capsule`
		description = 'Forgotten favorites from past years with zero recent plays.'

		const [histRes, recentRes] = await Promise.all([
			userService.getTopTracks({ user: params.user, period: '12month', limit: 100 }, init),
			userService.getRecentTracks({ user: params.user, limit: 200 }, init),
		])

		const rawRecent = recentRes.recenttracks?.track ?? []
		const recentList = Array.isArray(rawRecent) ? rawRecent : [rawRecent]
		const recentTrackKeys = new Set(
			recentList.map((t) => {
				const art =
					typeof t.artist === 'object' && t.artist !== null
						? (t.artist['#text'] ?? t.artist.name ?? '')
						: String(t.artist ?? '')
				return `${(t.name ?? '').toLowerCase()}:::${art.toLowerCase()}`
			}),
		)

		const rawHist = histRes.toptracks?.track ?? []
		const histList = Array.isArray(rawHist) ? rawHist : [rawHist]

		for (const t of histList) {
			const artist = typeof t.artist === 'object' && t.artist !== null ? (t.artist.name ?? '') : String(t.artist ?? '')
			const name = t.name ?? ''
			const key = `${name.toLowerCase()}:::${artist.toLowerCase()}`
			if (name && artist && !recentTrackKeys.has(key)) {
				tracks.push({
					name,
					artist,
					duration: Number.parseInt(String(t.duration ?? '0'), 10) || undefined,
					sourceReason: 'Historic staple with 0 recent plays in last 90 days',
				})
				if (tracks.length >= limit) break
			}
		}
	} else if (params.mode === 'deep-cuts') {
		title = `${params.user}'s Deep Cuts & B-Sides`
		description = 'Lesser-known tracks by your top artists.'

		const topArtistsRes = await userService.getTopArtists({ user: params.user, period: 'overall', limit: 5 }, init)
		const rawArtists = topArtistsRes.topartists?.artist ?? []
		const topArtistList = Array.isArray(rawArtists) ? rawArtists : [rawArtists]

		for (const art of topArtistList) {
			if (!art.name) continue
			try {
				const topTracksRes = await artistService.getTopTracks({ artist: art.name, limit: 30 }, init)
				const rawTracks = topTracksRes.toptracks?.track ?? []
				const artTracks = Array.isArray(rawTracks) ? rawTracks : [rawTracks]

				// Take tracks from index 10 onwards (the deep cuts)
				const deepSlice = artTracks.slice(10, 16)
				for (const dt of deepSlice) {
					const dtArtist = typeof dt.artist === 'object' && dt.artist !== null ? (dt.artist.name ?? art.name) : art.name
					if (dt.name) {
						tracks.push({
							name: dt.name,
							artist: dtArtist,
							sourceReason: `Deep cut by ${art.name}`,
						})
					}
				}
			} catch {
				// skip on failure
			}
			if (tracks.length >= limit) break
		}
	} else if (params.mode === 'discovery-radar') {
		title = `${params.user}'s Discovery Radar`
		description = 'Fresh track recommendations from similar artists you haven’t scrobbled yet.'

		const topArtistsRes = await userService.getTopArtists({ user: params.user, period: 'overall', limit: 30 }, init)
		const rawArtists = topArtistsRes.topartists?.artist ?? []
		const allUserArtists = Array.isArray(rawArtists) ? rawArtists : [rawArtists]
		const knownSet = new Set(allUserArtists.map((a) => (a.name ?? '').toLowerCase().trim()))
		const seeds = allUserArtists.slice(0, 5)

		for (const seed of seeds) {
			if (!seed.name) continue
			try {
				const simRes = await artistService.getSimilar({ artist: seed.name, limit: 10 }, init)
				const rawSim = simRes.similarartists?.artist ?? []
				const simList = Array.isArray(rawSim) ? rawSim : [rawSim]

				for (const sim of simList) {
					if (!sim.name || knownSet.has(sim.name.toLowerCase().trim())) continue
					knownSet.add(sim.name.toLowerCase().trim()) // avoid duplicate suggestions

					const simTop = await artistService.getTopTracks({ artist: sim.name, limit: 2 }, init)
					const rawST = simTop.toptracks?.track ?? []
					const stList = Array.isArray(rawST) ? rawST : [rawST]
					for (const st of stList) {
						if (st.name) {
							tracks.push({
								name: st.name,
								artist: sim.name,
								sourceReason: `Recommended via similarity to ${seed.name}`,
							})
						}
					}
					if (tracks.length >= limit) break
				}
			} catch {
				// skip on failure
			}
			if (tracks.length >= limit) break
		}
	}

	const finalTracks = tracks.slice(0, limit)
	const m3u = formatM3U(finalTracks, title)
	const csv = formatCsv(finalTracks)
	const spotifyQueries = formatSpotifyQueries(finalTracks)

	return {
		user: params.user,
		mode: params.mode,
		title,
		description,
		totalTracks: finalTracks.length,
		tracks: finalTracks,
		formats: {
			m3u,
			csv,
			spotifyQueries,
		},
	}
}
