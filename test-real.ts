/**
 * Real test of @ansango/lastfm-api with actual API
 */

import 'dotenv/config'
import { createClient, LastFmClient, setGlobalConfig } from './src/index.js'

async function testUserInfo() {
	console.log('\n🎵 Test 1: Get User Info')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const userInfo = await client.user.getInfo({ user: 'ansango' })
		console.log('✓ User:', userInfo.user.name)
		console.log('✓ Real name:', userInfo.user.realname)
		console.log('✓ Country:', userInfo.user.country)
		console.log('✓ Total playcount:', userInfo.user.playcount)
		console.log('✓ Registered:', new Date(Number(userInfo.user.registered.unixtime) * 1000).toLocaleDateString())
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testTopArtists() {
	console.log('\n🎸 Test 2: Get Top Artists for User')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const topArtists = await client.user.getTopArtists({
			user: 'ansango',
			period: '1month',
			limit: 5,
		})

		console.log('✓ Top 5 Artists (Last Month):')
		topArtists.topartists.artist.forEach((artist, i) => {
			console.log(`  ${i + 1}. ${artist.name} - ${artist.playcount} plays`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testRecentTracks() {
	console.log('\n🎧 Test 3: Get Recent Tracks')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const recent = await client.user.getRecentTracks({
			user: 'ansango',
			limit: 5,
		})

		console.log('✓ Recent Tracks:')
		recent.recenttracks.track.slice(0, 5).forEach((track, _i) => {
			const nowPlaying = Boolean(track['@attr']?.nowplaying)
			const status = nowPlaying ? '🔴 NOW PLAYING' : '✓'
			console.log(`  ${status} ${track.name} - ${track.artist['#text']}`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testGlobalConfig() {
	console.log('\n🌍 Test 4: Global Configuration')
	console.log('━'.repeat(50))

	setGlobalConfig({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	const client = createClient()

	try {
		const topChartArtists = await client.chart.getTopArtists({ limit: 5 })
		console.log('✓ Global Top 5 Artists:')
		topChartArtists.artists.artist.forEach((artist, i) => {
			console.log(`  ${i + 1}. ${artist.name} - ${Number(artist.playcount).toLocaleString()} plays`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testAlbumSearch() {
	console.log('\n💿 Test 5: Album Search')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const albums = await client.album.search({
			album: 'The Dark Side of the Moon',
			limit: 3,
		})

		console.log('✓ Search results for "The Dark Side of the Moon":')
		albums.results.albummatches.album.forEach((album, i) => {
			console.log(`  ${i + 1}. ${album.name} by ${album.artist}`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testArtistInfo() {
	console.log('\n🎤 Test 6: Artist Info')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const artistInfo = await client.artist.getInfo({ artist: 'Radiohead' })
		console.log('✓ Artist:', artistInfo.artist.name)
		console.log('✓ Listeners:', Number(artistInfo.artist.stats.listeners).toLocaleString())
		console.log('✓ Play count:', Number(artistInfo.artist.stats.playcount).toLocaleString())

		if (artistInfo.artist.bio?.summary) {
			const summary = artistInfo.artist.bio.summary.replace(/<[^>]*>/g, '').substring(0, 150)
			console.log('✓ Bio:', `${summary}...`)
		}
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testModularImport() {
	console.log('\n📦 Test 7: Modular Import (Tree-shaking)')
	console.log('━'.repeat(50))

	try {
		const { createTrackService } = await import('./src/entrypoints/track.js')

		const trackService = createTrackService({
			apiKey: process.env.LASTFM_API_KEY!,
			baseUrl: process.env.LASTFM_BASE_URL || 'https://ws.audioscrobbler.com/2.0/',
		})

		const trackSearch = await trackService.search({
			track: 'Bohemian Rhapsody',
			limit: 3,
		})

		console.log('✓ Track search results:')
		trackSearch.results.trackmatches.track.forEach((track: { name: string; artist: string }, i: number) => {
			console.log(`  ${i + 1}. ${track.name} by ${track.artist}`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function testGeoService() {
	console.log('\n🗺️  Test 8: Geographic Top Artists')
	console.log('━'.repeat(50))

	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY!,
	})

	try {
		const topArtistsSpain = await client.geo.getTopArtists({
			country: 'spain',
			limit: 5,
		})

		console.log('✓ Top 5 Artists in Spain:')
		topArtistsSpain.topartists.artist.forEach((artist, i) => {
			console.log(`  ${i + 1}. ${artist.name} - ${Number(artist.listeners).toLocaleString()} listeners`)
		})
	} catch (error) {
		console.error('✗ Error:', error instanceof Error ? error.message : error)
	}
}

async function main() {
	console.log('\n╔════════════════════════════════════════════════╗')
	console.log('║   Last.fm Client TypeScript - Real API Test   ║')
	console.log('╚════════════════════════════════════════════════╝')

	await testUserInfo()
	await testTopArtists()
	await testRecentTracks()
	await testGlobalConfig()
	await testAlbumSearch()
	await testArtistInfo()
	await testModularImport()
	await testGeoService()

	console.log('\n╔════════════════════════════════════════════════╗')
	console.log('║          ✅ All Tests Completed!               ║')
	console.log('╚════════════════════════════════════════════════╝\n')
}

main().catch((error) => {
	console.error('\n❌ Fatal error:', error)
	process.exit(1)
})
