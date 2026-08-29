/**
 * Method registry — single source of truth for the docs tool (#92).
 *
 * For every canonical Last.fm method declared in `canonical-methods.ts`,
 * this module resolves:
 *  - the callable function exported from the matching service module
 *  - the Zod request schema (by convention `<ns><PascalName>RequestSchema`)
 *  - the Zod response schema (by convention `<ns><PascalName>ResponseSchema`)
 *  - the HTTP method (GET by default, POST for write methods)
 *  - whether it requires a session key (true for all write methods)
 *  - whether it requires an API signature (true for all write methods + auth)
 *
 * The result is exposed as a nested object keyed by namespace:
 *
 *   methodRegistry.artist.getInfo.schema   → Zod schema
 *   methodRegistry.artist.getInfo.fn       → the function
 *   methodRegistry.artist.getInfo.httpMethod
 *   ...
 *
 * The tool (`tool/`) imports this registry to wire its Hono routes and
 * Scalar UI. Adding a new method only requires:
 *  1. Adding the export to `src/services/<ns>.ts` and the matching Zod
 *     schemas to `src/services/<ns>.schemas.ts` (using the naming convention)
 *  2. Adding the `ns.method` string to `CANONICAL_METHODS`
 *  3. If the method breaks the namespace defaults (POST, signed, ...),
 *     adding an entry to `SPECIAL` below.
 */

import { type ZodTypeAny, z } from 'zod'
import * as albumSchemas from './album/schemas.js'
import * as artistSchemas from './artist/schemas.js'
import * as authSchemas from './auth/schemas.js'
import { CANONICAL_METHODS } from './canonical-methods.js'
import * as chartSchemas from './chart/schemas.js'
import type { LastFmClient } from './client.js'
import * as exporterSchemas from './exporter/schemas.js'
import * as geoSchemas from './geo/schemas.js'
import * as insightsSchemas from './insights/schemas.js'
import * as librarySchemas from './library/schemas.js'
import * as playlistsSchemas from './playlists/schemas.js'
import * as reportsSchemas from './reports/schemas.js'
import * as tagSchemas from './tag/schemas.js'
import * as trackSchemas from './track/schemas.js'
import * as userSchemas from './user/schemas.js'

// -- Types ----------------------------------------------------------------

export type BodyKind = 'query' | 'json'
export type HttpMethod = 'GET' | 'POST'
export type NamespaceKind = 'core' | 'insights' | 'extension'

export interface MethodMeta {
	/** Canonical `namespace.method` id (e.g. `artist.getInfo`). */
	readonly id: string
	/** Namespace (e.g. `artist`). */
	readonly ns: string
	/** Method name (e.g. `getInfo`). */
	readonly name: string
	/** Category classification of the namespace. */
	readonly kind: NamespaceKind
	/** Human-readable group for OpenAPI and documentation. */
	readonly group: string
	/** Resolve the callable from a LastFmClient. The tool calls this
	 *  per request so the method runs against the env-derived config
	 *  (apiKey, sharedSecret, sessionKey) instead of a placeholder. */
	readonly resolve: (client: LastFmClient) => (params: unknown, init?: RequestInit) => Promise<unknown>
	/** Zod request schema. */
	readonly schema: z.ZodTypeAny
	/** Zod response schema. */
	readonly response: z.ZodTypeAny
	/** HTTP method used by the tool. */
	readonly httpMethod: HttpMethod
	/** Where the params live in the request. */
	readonly bodyKind: BodyKind
	/** Requires an authenticated `sk` (session key). */
	readonly requiresSession: boolean
	/** Requires a signed request (api_sig computed by the package). */
	readonly requiresSignature: boolean
	/** Mark this method as deprecated in the OpenAPI spec (Hono's
	 *  `createRoute({...})` will surface it with `deprecated: true`,
	 *  which Scalar renders as a strikethrough on the operation). */
	readonly deprecated?: boolean
	/** Custom summary in OpenAPI spec. */
	readonly summary?: string
	/** Custom description in OpenAPI spec. */
	readonly description?: string
}

export type MethodRegistry = Readonly<{
	[ns: string]: Readonly<{
		[name: string]: MethodMeta
	}>
}>

// -- Per-namespace wiring ------------------------------------------------

/**
 * Empty schema for methods that take no functional request parameters
 * (e.g. `auth.getToken`). The package constructs the URL using only
 * `api_key`, `api_sig` and the discriminator `method`.
 */
const EMPTY_SCHEMA: ZodTypeAny = z.object({})

/**
 * We validate the method exists at registry build time by spinning up
 * a throwaway client (the real per-app client is created by the tool
 * with the env-derived config). Construction only requires a non-empty
 * `apiKey`.
 */
const REGISTRY_PROBE: LastFmClient = (await import('./client.js')).createClient({
	apiKey: 'registry-probe',
})

type ServiceMethods = Readonly<Record<string, (...args: never[]) => unknown>>

type NamespaceConfig = Readonly<{
	methods: ServiceMethods
	schemas: Record<string, unknown>
	kind: NamespaceKind
	group: string
}>

const NS_CONFIG: Readonly<Record<string, NamespaceConfig>> = {
	artist: {
		methods: REGISTRY_PROBE.artist as unknown as ServiceMethods,
		schemas: artistSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	album: {
		methods: REGISTRY_PROBE.album as unknown as ServiceMethods,
		schemas: albumSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	track: {
		methods: REGISTRY_PROBE.track as unknown as ServiceMethods,
		schemas: trackSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	user: {
		methods: REGISTRY_PROBE.user as unknown as ServiceMethods,
		schemas: userSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	tag: {
		methods: REGISTRY_PROBE.tag as unknown as ServiceMethods,
		schemas: tagSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	chart: {
		methods: REGISTRY_PROBE.chart as unknown as ServiceMethods,
		schemas: chartSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	geo: {
		methods: REGISTRY_PROBE.geo as unknown as ServiceMethods,
		schemas: geoSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	library: {
		methods: REGISTRY_PROBE.library as unknown as ServiceMethods,
		schemas: librarySchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	auth: {
		methods: REGISTRY_PROBE.auth as unknown as ServiceMethods,
		schemas: authSchemas,
		kind: 'core',
		group: 'Last.fm Core API',
	},
	insights: {
		methods: REGISTRY_PROBE.insights as unknown as ServiceMethods,
		schemas: insightsSchemas,
		kind: 'insights',
		group: 'Insights & Analytics Engine',
	},
	reports: {
		methods: REGISTRY_PROBE.reports as unknown as ServiceMethods,
		schemas: reportsSchemas,
		kind: 'extension',
		group: 'Reports & Wrapped',
	},
	playlists: {
		methods: REGISTRY_PROBE.playlists as unknown as ServiceMethods,
		schemas: playlistsSchemas,
		kind: 'extension',
		group: 'Smart Playlists Generator',
	},
	exporter: {
		methods: REGISTRY_PROBE.exporter as unknown as ServiceMethods,
		schemas: exporterSchemas,
		kind: 'extension',
		group: 'Data Exporter & Backup',
	},
}

const NS_DEFAULTS: Readonly<
	Record<string, Pick<MethodMeta, 'httpMethod' | 'bodyKind' | 'requiresSession' | 'requiresSignature'>>
> = {
	artist: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	album: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	track: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	user: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	tag: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	chart: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	geo: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	library: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	auth: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: true },
	insights: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	reports: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	playlists: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
	exporter: { httpMethod: 'GET', bodyKind: 'query', requiresSession: false, requiresSignature: false },
}

/**
 * Methods that deviate from their namespace defaults.
 * Add an entry here when a new method is signed, requires session,
 * uses POST, or has a non-default body kind.
 */
const SPECIAL: Readonly<
	Record<
		string,
		Partial<
			Pick<
				MethodMeta,
				'httpMethod' | 'bodyKind' | 'requiresSession' | 'requiresSignature' | 'deprecated' | 'summary' | 'description'
			>
		>
	>
> = {
	// Write methods: POST + signed + require session
	'album.addTags': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'album.removeTag': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'artist.addTags': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'artist.removeTag': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.addTags': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.removeTag': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.love': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.unlove': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.updateNowPlaying': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },
	'track.scrobble': { httpMethod: 'POST', bodyKind: 'json', requiresSession: true, requiresSignature: true },

	// Insights analytics methods (computed by @ansango/lastfm-api)
	'insights.getSummary': {
		summary: 'insights.getSummary (@ansango/lastfm-api)',
		description:
			'Aggregates a user’s listening summary for a given period (top artists, tracks, albums, tags) and calculates mathematical Shannon diversity metrics (Shannon entropy and concentration shares).',
	},
	'insights.getNowPlaying': {
		summary: 'insights.getNowPlaying (@ansango/lastfm-api)',
		description:
			'Fetches the user’s current (or most recent) track and enriches it with artist biography (sanitized wiki/HTML) and similar artists with match scores.',
	},
	'insights.getHoursHistogram': {
		summary: 'insights.getHoursHistogram (@ansango/lastfm-api)',
		description:
			'Buckets a user’s recent scrobbles by hour-of-day (0..23 UTC) and weekday (0..6 Mon-Sun), calculating diurnal distribution and peak listening times.',
	},
	'insights.getBinges': {
		summary: 'insights.getBinges (@ansango/lastfm-api)',
		description:
			'Detects binge listening streaks (consecutive plays of the same artist or track) across a user’s recent scrobbles within a configurable maximum gap window.',
	},
	'insights.getTrends': {
		summary: 'insights.getTrends (@ansango/lastfm-api)',
		description:
			'Calculates ranking differentials (risers, fallers, newcomers, departures) between two time periods with rank and count delta metrics.',
	},
	'insights.getDiscoveries': {
		summary: 'insights.getDiscoveries (@ansango/lastfm-api)',
		description:
			'Detects newly discovered artists in a recent time window by comparing against the user’s historical baseline roster, sorted by first-seen timestamp.',
	},
	'insights.getMood': {
		summary: 'insights.getMood (@ansango/lastfm-api)',
		description:
			'Classifies a user’s emotional mood profile (energy vs. valence coordinates on a 2D Cartesian plane, quadrant label, and top genre categories) based on community tags.',
	},
	'insights.getPersonality': {
		summary: 'insights.getPersonality (@ansango/lastfm-api)',
		description:
			'Derives a holistic listener personality archetype (The Devotee, The Explorer, The Drifter, The DJ, The Nocturnal, The Archivist) based on multidimensional feature vectors.',
	},
	'insights.compareUsers': {
		summary: 'insights.compareUsers (@ansango/lastfm-api)',
		description:
			'Compares two Last.fm users’ listening affinity using Jaccard similarity over mutual top artist rosters, returning shared artists ranked by mutual playcount weight.',
	},
	'insights.getObscurityScore': {
		summary: 'insights.getObscurityScore (@ansango/lastfm-api)',
		description:
			'Evaluates a user’s top artists against global Last.fm popularity metrics to calculate an Obscurity / Hipster score (0-100), highlighting hidden gems and mainstream anchors.',
	},
	'insights.getForgottenFavorites': {
		summary: 'insights.getForgottenFavorites (@ansango/lastfm-api)',
		description:
			'Identifies historical favorite artists that the user has stopped listening to in the recent period, highlighting abandoned staples and revival opportunities.',
	},
	'insights.getObsessions': {
		summary: 'insights.getObsessions (@ansango/lastfm-api)',
		description:
			'Detects intense listening obsession episodes where a single artist or track heavily dominates a sliding listening window.',
	},
	'insights.getListeningStreaks': {
		summary: 'insights.getListeningStreaks (@ansango/lastfm-api)',
		description:
			'Calculates consecutive daily listening streaks, longest continuous streaks, and dry spells across recent scrobbles.',
	},
	'insights.getListeningHeatmap': {
		summary: 'insights.getListeningHeatmap (@ansango/lastfm-api)',
		description:
			'Generates a daily listening heatmap formatted with normalized intensity levels (0..4) suitable for GitHub-style calendar contribution representations.',
	},
	'insights.getAlbumHabits': {
		summary: 'insights.getAlbumHabits (@ansango/lastfm-api)',
		description:
			'Analyzes sequential listening history to assess album completion, cohesion score (0-100), and listener profile (Album Purist vs Playlist Shuffler).',
	},
	'insights.getGenreBreakdown': {
		summary: 'insights.getGenreBreakdown (@ansango/lastfm-api)',
		description:
			'Computes normalized genre breakdown, filtering out noise tags and calculating Herfindahl-Hirschman (HHI) concentration metrics.',
	},
	'insights.getGenreEvolution': {
		summary: 'insights.getGenreEvolution (@ansango/lastfm-api)',
		description: 'Tracks shifts in genre percentage shares (rising, fading, new) between two time periods.',
	},
	'insights.getSmartRecommendations': {
		summary: 'insights.getSmartRecommendations (@ansango/lastfm-api)',
		description:
			'Traverses Last.fm similarity graphs from user top artists to recommend unlistened artists with matched seed traceability.',
	},
	'insights.getBridgeArtists': {
		summary: 'insights.getBridgeArtists (@ansango/lastfm-api)',
		description: 'Finds artists that bridge two distinct genres or tags by computing cross-tag ranking overlap.',
	},
	'insights.compareTasteGroup': {
		summary: 'insights.compareTasteGroup (@ansango/lastfm-api)',
		description:
			'Compares 3 to 10 users simultaneously, computing pairwise Jaccard compatibility, consensus artists heard across the group, and identifying taste anchors and outliers.',
	},
	'reports.getWrapped': {
		summary: 'reports.getWrapped (@ansango/lastfm-api)',
		description:
			'Generates a comprehensive Year in Review / Wrapped report including seasonal listening breakdown, top entities, and busiest day.',
	},
	'reports.getMilestones': {
		summary: 'reports.getMilestones (@ansango/lastfm-api)',
		description:
			'Detects historical scrobble milestone achievements and projects the estimated date for the next target.',
	},
	'reports.getMonthlyDigest': {
		summary: 'reports.getMonthlyDigest (@ansango/lastfm-api)',
		description: 'Generates a monthly digest bulletin comparing listening activity to the previous month.',
	},
	'playlists.generate': {
		summary: 'playlists.generate (@ansango/lastfm-api)',
		description:
			'Generates a smart playlist based on algorithmic rules (time-capsule, deep-cuts, heavy-rotation, discovery-radar) with ready-to-use M3U and CSV formats.',
	},
	'exporter.exportScrobbles': {
		summary: 'exporter.exportScrobbles (@ansango/lastfm-api)',
		description:
			'Exports scrobble history with UTS checkpointing and multiple format engines (JSON, JSONL, CSV, ListenBrainz).',
	},
	'exporter.exportLovedTracks': {
		summary: 'exporter.exportLovedTracks (@ansango/lastfm-api)',
		description: 'Exports all loved tracks for a user in JSON or CSV format.',
	},
	'exporter.exportLibrary': {
		summary: 'exporter.exportLibrary (@ansango/lastfm-api)',
		description: 'Exports a user artist library with playcounts and metadata in JSON or CSV format.',
	},
}

// -- Builder -------------------------------------------------------------

const pascal = (s: string): string => s[0]?.toUpperCase() + s.slice(1)

function buildMethodMeta(id: string): MethodMeta {
	const dot = id.indexOf('.')
	if (dot < 0) throw new Error(`invalid canonical method id: ${id}`)
	const ns = id.slice(0, dot)
	const name = id.slice(dot + 1)

	const cfg = NS_CONFIG[ns]
	if (!cfg) throw new Error(`no NS_CONFIG for namespace "${ns}" (method ${id})`)

	const probe = cfg.methods[name]
	if (typeof probe !== 'function') {
		throw new Error(`method "${name}" is not exported from namespace "${ns}" (canonical id: ${id})`)
	}

	const pascalName = pascal(name)
	const schemaKey = `${ns}${pascalName}RequestSchema`
	const responseKey = `${ns}${pascalName}ResponseSchema`
	const schema = (cfg.schemas[schemaKey] as ZodTypeAny | undefined) ?? EMPTY_SCHEMA
	let response = cfg.schemas[responseKey] as ZodTypeAny | undefined

	// Fallback for tag-mutation methods that share a namespace-wide response
	// (e.g. artist.addTags → artistTagMutationResponseSchema, track.love → trackMutationResponseSchema).
	if (!response) {
		const tagMutKey = `${ns}TagMutationResponseSchema`
		const mutKey = `${ns}MutationResponseSchema`
		response =
			(cfg.schemas[tagMutKey] as ZodTypeAny | undefined) ?? (cfg.schemas[mutKey] as ZodTypeAny | undefined) ?? undefined
	}
	if (!response) {
		throw new Error(
			`response schema "${responseKey}" not found for namespace "${ns}". ` +
				`Add a SPECIAL entry to override the lookup.`,
		)
	}

	const defaults = NS_DEFAULTS[ns] ?? {
		httpMethod: 'GET' as const,
		bodyKind: 'query' as const,
		requiresSession: false,
		requiresSignature: false,
	}
	const override = SPECIAL[id] ?? {}

	const resolve = (client: LastFmClient) => {
		const fn = (client as any)[ns]?.[name]
		if (typeof fn !== 'function') {
			throw new Error(`method "${id}" not found on LastFmClient at runtime`)
		}
		return fn as (params: unknown, init?: RequestInit) => Promise<unknown>
	}

	return {
		id,
		ns,
		name,
		kind: cfg.kind,
		group: cfg.group,
		resolve,
		schema,
		response,
		...defaults,
		...override,
	}
}

export const INSIGHTS_METHODS = [
	'insights.getSummary',
	'insights.getNowPlaying',
	'insights.getHoursHistogram',
	'insights.getBinges',
	'insights.getTrends',
	'insights.getDiscoveries',
	'insights.getMood',
	'insights.getPersonality',
	'insights.compareUsers',
	'insights.getObscurityScore',
	'insights.getForgottenFavorites',
	'insights.getObsessions',
	'insights.getListeningStreaks',
	'insights.getListeningHeatmap',
	'insights.getAlbumHabits',
	'insights.getGenreBreakdown',
	'insights.getGenreEvolution',
	'insights.getSmartRecommendations',
	'insights.getBridgeArtists',
	'insights.compareTasteGroup',
] as const

export const REPORTS_METHODS = ['reports.getWrapped', 'reports.getMilestones', 'reports.getMonthlyDigest'] as const

export const PLAYLISTS_METHODS = ['playlists.generate'] as const

export const EXPORTER_METHODS = [
	'exporter.exportScrobbles',
	'exporter.exportLovedTracks',
	'exporter.exportLibrary',
] as const

export const ALL_REGISTRY_METHODS = [
	...CANONICAL_METHODS,
	...INSIGHTS_METHODS,
	...REPORTS_METHODS,
	...PLAYLISTS_METHODS,
	...EXPORTER_METHODS,
] as const

const registry: Record<string, Record<string, MethodMeta>> = {}
for (const id of ALL_REGISTRY_METHODS) {
	const meta = buildMethodMeta(id)
	let bucket = registry[meta.ns]
	if (!bucket) {
		bucket = {}
		registry[meta.ns] = bucket
	}
	bucket[meta.name] = meta
}

/**
 * Read-only method registry keyed by namespace and method name.
 *
 * @example
 *   methodRegistry.artist.getInfo.schema        // Zod schema
 *   methodRegistry.artist.getInfo.fn            // (params, init) => Promise<ArtistGetInfoResponse>
 *   methodRegistry.artist.getInfo.httpMethod    // 'GET'
 */
export const methodRegistry: MethodRegistry = Object.freeze(
	Object.fromEntries(Object.entries(registry).map(([ns, methods]) => [ns, Object.freeze(methods)])),
) as MethodRegistry

/** Flat array of all 57 method meta entries. */
export const allMethods: ReadonlyArray<MethodMeta> = Object.freeze(
	Object.values(methodRegistry).flatMap((methods) => Object.values(methods)),
)
