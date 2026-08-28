/**
 * Entry point for the local docs server (#92).
 *
 * Run with:
 *   bun run tool:dev
 *
 * Env vars (use the repo-root `.env`, see `tool/api-scalar/.env.example`):
 *   - LASTFM_API_KEY         (required for any "Try it" call)
 *   - LASTFM_SHARED_SECRET   (required for signed methods)
 *   - LASTFM_SESSION_KEY     (required for write methods)
 *   - PORT                   (default: 3000)
 */
import { mountOpenAPI } from './doc.js'
import { createApp } from './server.js'
import { validateOrExit } from './startup.js'

// Validate the env before building the Hono app. If LASTFM_API_KEY is
// missing, `validateOrExit` prints a friendly error with the create-form
// URL + a copy-pasteable `echo >> .env` snippet and process.exit(1)s.
validateOrExit()

const app = createApp()
mountOpenAPI(app, { serverUrl: `http://localhost:${process.env.PORT ?? '3000'}` })

const port = Number.parseInt(process.env.PORT ?? '3000', 10)

export default {
	port,
	fetch: app.fetch,
}
