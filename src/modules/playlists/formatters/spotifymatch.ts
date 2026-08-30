import type { PlaylistTrackItem } from '../schemas.js'

export function formatSpotifyQueries(tracks: PlaylistTrackItem[]): string[] {
	return tracks.map((t) => `track:${t.name} artist:${t.artist}`)
}
