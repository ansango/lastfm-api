import type { UserService } from '../core/services/user.js'
import type { WatcherOptions } from './schemas.js'
import { ScrobbleWatcher } from './watcher.js'

export interface WatcherService {
	/**
	 * Creates a real-time event-driven scrobble watcher for a given user.
	 */
	watchUser: (options: WatcherOptions) => ScrobbleWatcher

	/**
	 * Alias for `watchUser`.
	 */
	create: (options: WatcherOptions) => ScrobbleWatcher
}

export function createWatcherService(userService: UserService): WatcherService {
	return {
		watchUser: (options: WatcherOptions) => new ScrobbleWatcher(userService, options),
		create: (options: WatcherOptions) => new ScrobbleWatcher(userService, options),
	}
}
