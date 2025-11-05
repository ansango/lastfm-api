/**
 * Example usage of lastfm-client-ts
 * 
 * This file demonstrates different ways to use the Last.fm client library.
 * 
 * Before running:
 * 1. Copy .env.example to .env
 * 2. Add your Last.fm API credentials
 * 3. Run: bun run example.ts
 */

import { LastFmClient, createClient, setGlobalConfig } from './src/index.js';

// Example 1: Using the client with explicit configuration
async function example1() {
	console.log('\n=== Example 1: Explicit Configuration ===');
	
	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY || 'demo_key'
	});

	try {
		const userInfo = await client.user.getInfo({ user: 'rj' });
		console.log('User:', userInfo.user.name);
		console.log('Playcount:', userInfo.user.playcount);
	} catch (error) {
		console.error('Error:', error);
	}
}

// Example 2: Using global configuration
async function example2() {
	console.log('\n=== Example 2: Global Configuration ===');
	
	setGlobalConfig({
		apiKey: process.env.LASTFM_API_KEY || 'demo_key'
	});

	const client = createClient();

	try {
		const topArtists = await client.chart.getTopArtists({ limit: 5 });
		console.log('Top 5 Artists:');
		topArtists.artists.artist.forEach((artist, i) => {
			console.log(`${i + 1}. ${artist.name} (${artist.playcount} plays)`);
		});
	} catch (error) {
		console.error('Error:', error);
	}
}

// Example 3: Using individual services
async function example3() {
	console.log('\n=== Example 3: Individual Services ===');
	
	const { createAlbumService } = await import('./src/services/album.js');
	
	const albumService = createAlbumService({
		apiKey: process.env.LASTFM_API_KEY || 'demo_key'
	});

	try {
		const albums = await albumService.search({ album: 'Believe', limit: 3 });
		console.log('Album search results:');
		albums.results.albummatches.album.forEach((album, i) => {
			console.log(`${i + 1}. ${album.name} by ${album.artist}`);
		});
	} catch (error) {
		console.error('Error:', error);
	}
}

// Example 4: Multiple services
async function example4() {
	console.log('\n=== Example 4: Multiple Services ===');
	
	const client = new LastFmClient({
		apiKey: process.env.LASTFM_API_KEY || 'demo_key'
	});

	try {
		// Search for an artist
		const artists = await client.artist.search({ artist: 'Radiohead', limit: 1 });
		const artistName = artists.results.artistmatches.artist[0].name;
		console.log(`Found artist: ${artistName}`);

		// Get artist info
		const artistInfo = await client.artist.getInfo({ artist: artistName });
		console.log(`Listeners: ${artistInfo.artist.stats.listeners}`);

		// Get top tracks
		const topTracks = await client.artist.getTopTracks({ artist: artistName, limit: 3 });
		console.log('Top tracks:');
		topTracks.toptracks.track.forEach((track, i) => {
			console.log(`${i + 1}. ${track.name} (${track.playcount} plays)`);
		});
	} catch (error) {
		console.error('Error:', error);
	}
}

// Run all examples
async function main() {
	console.log('Last.fm Client TypeScript - Examples\n');
	
	await example1();
	await example2();
	await example3();
	await example4();
	
	console.log('\n=== All examples completed ===\n');
}

main().catch(console.error);
