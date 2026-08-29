/**
 * Isomorphic, zero-dependency typed event emitter compatible with Node.js, Bun, and Browsers.
 */

export type Listener<T extends unknown[] = unknown[]> = (...args: T) => void

export class TypedEventEmitter<Events extends Record<string, unknown[]>> {
	private readonly listeners = new Map<keyof Events, Set<Listener>>()

	public on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
		let set = this.listeners.get(event)
		if (!set) {
			set = new Set()
			this.listeners.set(event, set)
		}
		set.add(listener as Listener)
		return this
	}

	public once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
		const onceWrapper = ((...args: Events[K]) => {
			this.off(event, onceWrapper)
			listener(...args)
		}) as unknown as Listener
		return this.on(event, onceWrapper as (...args: Events[K]) => void)
	}

	public off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this {
		const set = this.listeners.get(event)
		if (set) {
			set.delete(listener as Listener)
			if (set.size === 0) {
				this.listeners.delete(event)
			}
		}
		return this
	}

	public emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
		const set = this.listeners.get(event)
		if (!set || set.size === 0) return false

		for (const listener of Array.from(set)) {
			try {
				listener(...args)
			} catch (err) {
				// Prevent listener exceptions from breaking the emitter loop
				if (event !== ('error' as unknown as K)) {
					const errorSet = this.listeners.get('error' as unknown as keyof Events)
					if (errorSet) {
						for (const errorListener of Array.from(errorSet)) {
							try {
								errorListener(err)
							} catch {
								// ignore error in error handler
							}
						}
					}
				}
			}
		}
		return true
	}

	public removeAllListeners<K extends keyof Events>(event?: K): this {
		if (event) {
			this.listeners.delete(event)
		} else {
			this.listeners.clear()
		}
		return this
	}

	public listenerCount<K extends keyof Events>(event: K): number {
		return this.listeners.get(event)?.size ?? 0
	}
}
