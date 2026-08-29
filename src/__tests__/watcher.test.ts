import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { TypedEventEmitter, type WatcherTrack } from '../watcher/index.js'
import { installFetchMock } from './helpers/fetch-mock.js'

describe('TypedEventEmitter', () => {
	test('supports on, emit, once, off, and listenerCount', () => {
		const emitter = new TypedEventEmitter<{
			testEvent: [num: number, str: string]
			otherEvent: [flag: boolean]
		}>()

		let callCount = 0
		let lastArgs: [number, string] | null = null

		const listener = (num: number, str: string) => {
			callCount++
			lastArgs = [num, str]
		}

		emitter.on('testEvent', listener)
		expect(emitter.listenerCount('testEvent')).toBe(1)

		emitter.emit('testEvent', 42, 'hello')
		expect(callCount).toBe(1)
		expect(lastArgs as [number, string] | null).toEqual([42, 'hello'])

		emitter.off('testEvent', listener)
		expect(emitter.listenerCount('testEvent')).toBe(0)

		emitter.emit('testEvent', 99, 'world')
		expect(callCount).toBe(1) // not called again

		// Test once
		let onceCalled = 0
		emitter.once('otherEvent', () => {
			onceCalled++
		})
		emitter.emit('otherEvent', true)
		emitter.emit('otherEvent', false)
		expect(onceCalled).toBe(1)
	})

	test('isolates listener errors without breaking other listeners', () => {
		const emitter = new TypedEventEmitter<{ ping: [val: string] }>()
		let secondCalled = false

		emitter.on('ping', () => {
			throw new Error('boom')
		})
		emitter.on('ping', () => {
			secondCalled = true
		})

		emitter.emit('ping', 'hi')
		expect(secondCalled).toBe(true)
	})
})

describe('ScrobbleWatcher', () => {
	let mock: ReturnType<typeof installFetchMock>
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: 'test-key' })
	})

	afterEach(() => {
		mock.restore()
	})

	test('detects nowPlaying track and emits nowPlaying event', async () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
			intervalMs: 5000,
		})

		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'Paranoid Android',
						artist: { '#text': 'Radiohead', mbid: '' },
						album: { '#text': 'OK Computer', mbid: '' },
						url: 'https://last.fm/track/1',
						image: [],
						'@attr': { nowplaying: 'true' },
					},
					{
						name: 'Karma Police',
						artist: { '#text': 'Radiohead', mbid: '' },
						album: { '#text': 'OK Computer', mbid: '' },
						url: 'https://last.fm/track/2',
						image: [],
						date: { uts: '1700000000', '#text': '14 Nov 2023, 12:00' },
					},
				],
				'@attr': { user: 'ansango', page: '1', totalPages: '1', total: '2' },
			},
		})

		let nowPlayingTrack: WatcherTrack | null = null
		watcher.on('nowPlaying', (track) => {
			nowPlayingTrack = track
		})

		await watcher.pollOnce()

		expect(nowPlayingTrack).not.toBeNull()
		expect((nowPlayingTrack as WatcherTrack | null)?.name).toBe('Paranoid Android')
		expect((nowPlayingTrack as WatcherTrack | null)?.artist).toBe('Radiohead')
		expect((nowPlayingTrack as WatcherTrack | null)?.nowPlaying).toBe(true)
		expect(watcher.getCurrentNowPlaying()?.name).toBe('Paranoid Android')
		expect(watcher.getLastScrobble()?.name).toBe('Karma Police')
	})

	test('detects new completed scrobbles on subsequent polls', async () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
		})

		// 1st Poll (Baseline: highest uts is 1700000000)
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'Karma Police',
						artist: { '#text': 'Radiohead', mbid: '' },
						date: { uts: '1700000000', '#text': '14 Nov 2023, 12:00' },
					},
				],
				'@attr': { user: 'ansango', page: '1', totalPages: '1', total: '1' },
			},
		})

		const scrobbles: WatcherTrack[] = []
		watcher.on('scrobble', (track) => {
			scrobbles.push(track)
		})

		await watcher.pollOnce()
		expect(scrobbles.length).toBe(0) // 1st poll sets baseline, no new scrobble event

		// 2nd Poll: 2 new tracks with UTS > 1700000000
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'No Surprises',
						artist: { '#text': 'Radiohead', mbid: '' },
						date: { uts: '1700000500', '#text': '14 Nov 2023, 12:08' },
					},
					{
						name: 'Exit Music',
						artist: { '#text': 'Radiohead', mbid: '' },
						date: { uts: '1700000250', '#text': '14 Nov 2023, 12:04' },
					},
					{
						name: 'Karma Police',
						artist: { '#text': 'Radiohead', mbid: '' },
						date: { uts: '1700000000', '#text': '14 Nov 2023, 12:00' },
					},
				],
				'@attr': { user: 'ansango', page: '1', totalPages: '1', total: '3' },
			},
		})

		await watcher.pollOnce()

		// Should emit in chronological order: Exit Music (1700000250) then No Surprises (1700000500)
		expect(scrobbles.length).toBe(2)
		expect(scrobbles[0].name).toBe('Exit Music')
		expect(scrobbles[1].name).toBe('No Surprises')

		// 3rd Poll: No new tracks
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'No Surprises',
						artist: { '#text': 'Radiohead', mbid: '' },
						date: { uts: '1700000500', '#text': '14 Nov 2023, 12:08' },
					},
				],
				'@attr': { user: 'ansango', page: '1', totalPages: '1', total: '3' },
			},
		})

		await watcher.pollOnce()
		expect(scrobbles.length).toBe(2) // No duplicates!
	})

	test('emits nowPlayingEnd when playback stops or song changes', async () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
		})

		let endedTrack: WatcherTrack | null = null
		watcher.on('nowPlayingEnd', (track) => {
			endedTrack = track
		})

		// Poll 1: Track is now playing
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'Track A',
						artist: { '#text': 'Artist A', mbid: '' },
						'@attr': { nowplaying: 'true' },
					},
				],
			},
		})
		await watcher.pollOnce()
		expect(watcher.getCurrentNowPlaying()?.name).toBe('Track A')

		// Poll 2: No longer now playing
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'Track A',
						artist: { '#text': 'Artist A', mbid: '' },
						date: { uts: '1700000000', '#text': 'date' },
					},
				],
			},
		})
		await watcher.pollOnce()

		expect(endedTrack).not.toBeNull()
		expect((endedTrack as WatcherTrack | null)?.name).toBe('Track A')
		expect(watcher.getCurrentNowPlaying()).toBeNull()
	})

	test('emits idle when no listening activity for threshold period', async () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
			idleThresholdMs: 1000, // 1 second threshold
		})

		// Poll 1: Baseline scrobble from 2 hours ago
		const oldUts = Math.floor(Date.now() / 1000) - 7200
		mock.respondWithJson({
			recenttracks: {
				track: [
					{
						name: 'Old Track',
						artist: { '#text': 'Old Artist', mbid: '' },
						date: { uts: String(oldUts), '#text': 'old' },
					},
				],
			},
		})

		let idleEmitted = false
		watcher.on('idle', (status) => {
			idleEmitted = true
			expect(status.user).toBe('ansango')
			expect(status.idleMinutes).toBeGreaterThanOrEqual(120)
		})

		await watcher.pollOnce()
		expect(idleEmitted).toBe(true)
	})

	test('handles errors cleanly via error event without breaking lifecycle', async () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
		})

		let caughtError: Error | null = null
		watcher.on('error', (err) => {
			caughtError = err
		})

		mock.respondWithHttpError(500, 'Internal Server Error')
		await watcher.pollOnce()

		expect(caughtError).not.toBeNull()
		expect((caughtError as Error | null)?.message).toContain('500')
	})

	test('lifecycle controls start, stop, and isRunning', () => {
		const watcher = client.watcher.watchUser({
			user: 'ansango',
			intervalMs: 10_000,
		})

		expect(watcher.isRunning()).toBe(false)
		watcher.start()
		expect(watcher.isRunning()).toBe(true)
		watcher.stop()
		expect(watcher.isRunning()).toBe(false)
	})
})
