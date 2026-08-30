import type { UserService } from '@/api/user/service.js'
import { TypedEventEmitter } from './emitter.js'
import type { WatcherIdleStatus, WatcherOptions, WatcherPollStatus, WatcherTrack } from './schemas.js'

export interface WatcherEvents extends Record<string, unknown[]> {
	nowPlaying: [track: WatcherTrack]
	nowPlayingEnd: [track: WatcherTrack]
	scrobble: [track: WatcherTrack]
	idle: [status: WatcherIdleStatus]
	poll: [status: WatcherPollStatus]
	error: [err: Error]
}

export class ScrobbleWatcher extends TypedEventEmitter<WatcherEvents> {
	private readonly userService: UserService
	private readonly user: string
	private readonly intervalMs: number
	private readonly idleThresholdMs: number
	private readonly emitInitial: boolean

	private running = false
	private timer: ReturnType<typeof setInterval> | null = null
	private lastNowPlayingKey: string | null = null
	private currentNowPlayingTrack: WatcherTrack | null = null
	private lastProcessedUts: number | null = null
	private lastActivityUts: number | null = null
	private isIdle = false
	private lastScrobbleTrack: WatcherTrack | null = null
	private polling = false

	constructor(userService: UserService, options: WatcherOptions) {
		super()
		this.userService = userService
		this.user = options.user
		this.intervalMs = Math.max(options.intervalMs ?? 10_000, 2_000)
		this.idleThresholdMs = options.idleThresholdMs ?? 300_000
		this.emitInitial = options.emitInitial ?? true

		if (options.autoStart) {
			this.start()
		}
	}

	public start(): this {
		if (this.running) return this
		this.running = true

		// Immediate initial poll
		void this.pollOnce()

		this.timer = setInterval(() => {
			if (this.running) {
				void this.pollOnce()
			}
		}, this.intervalMs)

		return this
	}

	public stop(): this {
		this.running = false
		if (this.timer !== null) {
			clearInterval(this.timer)
			this.timer = null
		}
		return this
	}

	public isRunning(): boolean {
		return this.running
	}

	public getCurrentNowPlaying(): WatcherTrack | null {
		return this.currentNowPlayingTrack
	}

	public getLastScrobble(): WatcherTrack | null {
		return this.lastScrobbleTrack
	}

	public async pollOnce(): Promise<void> {
		if (this.polling) return
		this.polling = true

		try {
			const res = await this.userService.getRecentTracks({
				user: this.user,
				limit: 10,
			})

			const rawTracks = res.recenttracks?.track ?? []
			const checkedAt = Date.now()
			let hasNowPlaying = false
			let scrobblesFound = 0

			// 1. Process Now Playing
			const firstTrack = rawTracks[0]
			const isFirstTrackNowPlaying = Boolean(firstTrack?.['@attr']?.nowplaying)

			if (firstTrack && isFirstTrackNowPlaying) {
				hasNowPlaying = true
				const artistName = typeof firstTrack.artist === 'string' ? firstTrack.artist : firstTrack.artist['#text']
				const trackKey = `${firstTrack.name}::${artistName}`
				const nowPlayingTrack: WatcherTrack = {
					name: firstTrack.name,
					artist: artistName,
					album: typeof firstTrack.album === 'string' ? firstTrack.album : firstTrack.album?.['#text'],
					url: firstTrack.url,
					image: firstTrack.image,
					mbid: firstTrack.mbid,
					nowPlaying: true,
				}

				if (this.lastNowPlayingKey !== trackKey) {
					if (this.currentNowPlayingTrack) {
						this.emit('nowPlayingEnd', this.currentNowPlayingTrack)
					}
					this.currentNowPlayingTrack = nowPlayingTrack
					this.lastNowPlayingKey = trackKey
					this.lastActivityUts = Math.floor(checkedAt / 1000)
					this.isIdle = false
					this.emit('nowPlaying', nowPlayingTrack)
				}
			} else {
				if (this.currentNowPlayingTrack) {
					this.emit('nowPlayingEnd', this.currentNowPlayingTrack)
					this.currentNowPlayingTrack = null
					this.lastNowPlayingKey = null
				}
			}

			// 2. Process Historical Scrobbles
			const completedScrobbles: Array<{ raw: (typeof rawTracks)[0]; uts: number }> = []
			for (const t of rawTracks) {
				if (!t['@attr']?.nowplaying && t.date?.uts) {
					const uts = Number(t.date.uts)
					if (!Number.isNaN(uts)) {
						completedScrobbles.push({ raw: t, uts })
					}
				}
			}

			if (this.lastProcessedUts === null) {
				// Initial poll baseline
				if (completedScrobbles.length > 0) {
					this.lastProcessedUts = completedScrobbles[0].uts
					const newest = completedScrobbles[0].raw
					const artistName = typeof newest.artist === 'string' ? newest.artist : newest.artist['#text']
					this.lastScrobbleTrack = {
						name: newest.name,
						artist: artistName,
						album: typeof newest.album === 'string' ? newest.album : newest.album?.['#text'],
						url: newest.url,
						image: newest.image,
						mbid: newest.mbid,
						nowPlaying: false,
						uts: completedScrobbles[0].uts,
						scrobbledAt: completedScrobbles[0].uts * 1000,
					}
					this.lastActivityUts = this.lastProcessedUts
				} else {
					this.lastProcessedUts = 0
				}
			} else {
				// Find newly scrobbled tracks since lastProcessedUts
				const newScrobbles = completedScrobbles
					.filter((item) => item.uts > (this.lastProcessedUts ?? 0))
					.sort((a, b) => a.uts - b.uts) // Emit in chronological order

				for (const item of newScrobbles) {
					const t = item.raw
					const artistName = typeof t.artist === 'string' ? t.artist : t.artist['#text']
					const scrobbleTrack: WatcherTrack = {
						name: t.name,
						artist: artistName,
						album: typeof t.album === 'string' ? t.album : t.album?.['#text'],
						url: t.url,
						image: t.image,
						mbid: t.mbid,
						nowPlaying: false,
						uts: item.uts,
						scrobbledAt: item.uts * 1000,
					}
					this.lastScrobbleTrack = scrobbleTrack
					this.lastProcessedUts = Math.max(this.lastProcessedUts, item.uts)
					this.lastActivityUts = this.lastProcessedUts
					this.isIdle = false
					scrobblesFound++
					this.emit('scrobble', scrobbleTrack)
				}
			}

			// 3. Check for Idle
			if (!hasNowPlaying && this.lastActivityUts !== null) {
				const elapsedMs = checkedAt - this.lastActivityUts * 1000
				if (elapsedMs >= this.idleThresholdMs) {
					if (!this.isIdle) {
						this.isIdle = true
						const idleMinutes = Math.floor(elapsedMs / 60_000)
						this.emit('idle', {
							user: this.user,
							lastSeenUts: this.lastActivityUts,
							idleMinutes,
							checkedAt,
						})
					}
				}
			}

			this.emit('poll', {
				user: this.user,
				checkedAt,
				hasNowPlaying,
				scrobblesFound,
			})
		} catch (err) {
			this.emit('error', err instanceof Error ? err : new Error(String(err)))
		} finally {
			this.polling = false
		}
	}
}
