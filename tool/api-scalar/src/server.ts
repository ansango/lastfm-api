/**
 * Hono + OpenAPIHono foundation for the docs tool (HU2 of #92).
 *
 * Creates a single OpenAPIHono app, wires error/notFound handlers, and
 * exposes a helper `wireApp(app, opts)` that registers all 57 routes
 * from the method registry with their Hono route + handler.
 */
import { OpenAPIHono } from '@hono/zod-openapi'
import { createClient, type LastFmClient } from '../../../src/client.js'

import { allMethods } from '../../../src/method-registry.js'
import { buildHandler, buildRoute } from './build-route.js'

export interface AppOptions {
	/** API key to inject into the call config. If absent, the env `LASTFM_API_KEY` is used. */
	apiKey?: string
	/** Shared secret for request signing. */
	sharedSecret?: string
	/** Default session key for write methods. */
	sessionKey?: string
}

/**
 * Build a fresh OpenAPIHono app with all 57 routes registered from the
 * method registry. Tests use this to spin up an app per scenario; the
 * production entry uses it once.
 */
export function createApp(opts: AppOptions = {}): OpenAPIHono {
	const apiKey = opts.apiKey ?? process.env.LASTFM_API_KEY
	const sharedSecret = opts.sharedSecret ?? process.env.LASTFM_SHARED_SECRET
	const sessionKey = opts.sessionKey ?? process.env.LASTFM_SESSION_KEY

	if (!apiKey) {
		throw new Error('createApp: no apiKey provided. Pass opts.apiKey or set LASTFM_API_KEY in the env.')
	}

	const client: LastFmClient = createClient({ apiKey, sharedSecret, sessionKey })

	const app = new OpenAPIHono()

	app.notFound((c: any) => c.json({ message: 'Not Found', path: new URL(c.req.url).pathname }, 404))
	app.onError((err: unknown, c: any) => {
		const message = err instanceof Error ? err.message : 'Internal Server Error'
		return c.json({ message }, 500)
	})

	wireApp(app, { client })
	return app
}

/**
 * Register all methods from the registry onto an existing OpenAPIHono.
 * Public so the entry can layer Scalar/doc middleware after the routes
 * are wired.
 */
export function wireApp(app: OpenAPIHono, opts: { client: LastFmClient }): void {
	for (const meta of allMethods) {
		app.openapi(buildRoute(meta) as any, buildHandler(meta, opts.client) as any)
	}
}
