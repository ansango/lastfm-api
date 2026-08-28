import type { PlaylistTrackItem } from '../schemas.js'

export function formatM3U(tracks: PlaylistTrackItem[], title = 'Playlist'): string {
	const lines = ['#EXTM3U', `#PLAYLIST:${title}`]
	for (const t of tracks) {
		const duration = t.duration && t.duration > 0 ? t.duration : -1
		lines.push(`#EXTINF:${duration},${t.artist} - ${t.name}`)
		lines.push(`${t.artist} - ${t.name}.mp3`)
	}
	return lines.join('\n')
}
