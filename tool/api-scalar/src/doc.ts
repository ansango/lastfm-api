/**
 * OpenAPI doc + Scalar UI wiring (HU2 of #92).
 *
 * Mounts:
 *  - `GET /doc`  — raw OpenAPI 3.0 JSON
 *  - `GET /`     — Scalar API reference UI
 */

import type { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { name as pkgName, version as pkgVersion } from '../../../package.json' with { type: 'json' }

const PKG_NAME = typeof pkgName === 'string' ? pkgName : '@ansango/lastfm-api'
const PKG_VERSION = typeof pkgVersion === 'string' ? pkgVersion : '0.0.0'

/**
 * Brief auth flow shown in the Scalar UI at the top of the `auth` tag.
 * Kept in Markdown so Scalar renders it as-is.
 */
const AUTH_TAG_DESCRIPTION = [
	'## Auth flow',
	'',
	'Last.fm has two practical auth paths: the **web flow** (browser-based, works for every self-service API key) and the **desktop flow** (operationally identical to web, just with a localhost callback URL for the CLI). The `auth.getMobileSession` endpoint documented in the official Last.fm spec is **not wired in this package** — it requires a mobile-class API key that is not exposed through the public self-service create form, and every consumer we know of can use the web flow instead. This tool leads with the web flow.',
	'',
	'### Prerequisite: set your callback URL on the API account',
	'',
	"Before you authorize a token, set a **Callback URL** on your Last.fm API account at <https://www.last.fm/api/account>. Last.fm redirects to this URL with the token after you click **Allow access**. For the manual flow (default), any URL works — `http://localhost:3000/`, `http://example.com/`, even a string that doesn't resolve. The tool expects you to copy the token from the URL bar. If you skip this step the redirect lands on a Last.fm error page and the token is lost. See the [package README](https://github.com/ansango/lastfm-api#callback-url-setup-one-time-in-your-lastfm-account) for full setup steps.",
	'',
	'### 1. Get a session key — web flow (recommended)',
	'',
	'**a.** `GET /auth/get-token` — returns a request token AND a pre-built `authUrl`. Signed, no session needed.',
	'',
	'**b.** Open the returned `authUrl` (or paste `https://www.last.fm/api/auth/?api_key=<LASTFM_API_KEY>&token=<token>` manually) in a browser. Log in if prompted, click **Allow access**. Last.fm redirects to the callback URL configured on your API account with the same `token` in the URL bar.',
	'',
	'**c.** `GET /auth/get-session?token=<token>` — returns `{ session: { key: "<session-key>" } }`. The token is consumed.',
	'',
	'### 2. Use it on write methods — pass it per-request',
	'',
	'- Add header `x-lastfm-sk: <your-key>` to any POST request (the 10 write methods).',
	'- Scalar renders a "Headers" section in the "Try it" form for those routes.',
	'- Alternative: pass `sk` in the JSON body, or set `LASTFM_SESSION_KEY` in the env. Header wins.',
	'',
	"**No persistence.** The tool never writes the session key to disk. Closing the browser loses it; repeat step 1 to get a new one. The `LASTFM_API_KEY` and `LASTFM_SHARED_SECRET` env vars stay in your shell — they're not sensitive in the same way.",
].join('\n')

export function mountOpenAPI(app: OpenAPIHono, opts: { serverUrl?: string } = {}): void {
	const serverUrl = opts.serverUrl ?? process.env.DOCS_SERVER_URL ?? 'http://localhost:3000'

	app.doc('/doc', {
		openapi: '3.0.0',
		info: {
			title: `${PKG_NAME} — local docs server`,
			version: PKG_VERSION,
			description:
				'Interactive API explorer for @ansango/lastfm-api. All canonical Last.fm methods and Insights analytics are wired declaratively from the method registry; "Try it" calls the real Last.fm API via the package.',
		},
		servers: [{ url: serverUrl, description: 'Local docs server' }],
		'x-tagGroups': [
			{
				name: 'Last.fm Core API',
				tags: ['user', 'artist', 'album', 'track', 'tag', 'chart', 'geo', 'library', 'auth'],
			},
			{
				name: 'Insights & Analytics Engine',
				tags: ['insights'],
			},
			{
				name: 'Reports & Wrapped',
				tags: ['reports'],
			},
			{
				name: 'Smart Playlists Generator',
				tags: ['playlists'],
			},
			{
				name: 'Data Exporter & Backup',
				tags: ['exporter'],
			},
		],
		tags: [
			{
				name: 'user',
				description: 'Official Last.fm user profile, scrobbles, top charts, and social relationships.',
			},
			{
				name: 'artist',
				description: 'Official Last.fm artist metadata, discography, tags, and corrections.',
			},
			{
				name: 'album',
				description: 'Official Last.fm album metadata, tracklists, and tag operations.',
			},
			{
				name: 'track',
				description: 'Official Last.fm track info, scrobbling (single & batch), love/unlove, and now playing.',
			},
			{
				name: 'tag',
				description: 'Official Last.fm community tag exploration and top charts.',
			},
			{
				name: 'chart',
				description: 'Official Last.fm global top charts for artists and tracks.',
			},
			{
				name: 'geo',
				description: 'Official Last.fm geo-localized top charts by country.',
			},
			{
				name: 'library',
				description: 'Official Last.fm user library queries.',
			},
			{
				name: 'auth',
				description: AUTH_TAG_DESCRIPTION,
			},
			{
				name: 'insights',
				description:
					'Higher-level analytical insights and derived metrics computed over Last.fm data (Shannon diversity, enriched now playing, diurnal histograms, binge runs, ranking differentials, discoveries, 2D mood classification, personality archetypes, obscurity scores, forgotten favorites, obsessions, streaks, heatmaps, album habits, genre breakdown & evolution, smart recommendations, bridge artists, and taste group clustering).',
			},
			{
				name: 'reports',
				description:
					'Year in Review / Wrapped reports, seasonal listening profiles, historical scrobble milestone tracker, and monthly comparative digests.',
			},
			{
				name: 'playlists',
				description:
					'Algorithmic smart playlist generation (time capsule, deep cuts, heavy rotation, discovery radar) with M3U, CSV, and search-query formatters.',
			},
			{
				name: 'exporter',
				description:
					'Bulk scrobble history export with UTS checkpointing, loved tracks backup, library archive, and multi-format exporters (JSON, JSONL, CSV, ListenBrainz).',
			},
		],
	})

	app.get(
		'/',
		// Scalar's `HtmlRenderingConfiguration` type is narrow; the full
		// set of options (`showToolbar`, `defaultOpenAllTags`, ...) lives
		// on `ApiReferenceConfigurationWithSource` and is not re-exported
		// by `@scalar/hono-api-reference`. The runtime accepts all of
		// them, so we cast to widen.
		Scalar({
			url: '/doc',
			pageTitle: `${PKG_NAME} — API reference`,
			showToolbar: 'never',
			defaultOpenAllTags: true,
		} as Parameters<typeof Scalar>[0]),
	)
}
