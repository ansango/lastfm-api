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

import { CANONICAL_METHODS } from './canonical-methods.js'
import type { LastFmClient } from './client.js'
import * as albumSchemas from './services/album.schemas.js'
import * as artistSchemas from './services/artist.schemas.js'
import * as authSchemas from './services/auth.schemas.js'
import * as chartSchemas from './services/chart.schemas.js'
import * as geoSchemas from './services/geo.schemas.js'
import * as librarySchemas from './services/library.schemas.js'
import * as tagSchemas from './services/tag.schemas.js'
import * as trackSchemas from './services/track.schemas.js'
import * as userSchemas from './services/user.schemas.js'

// -- Types ----------------------------------------------------------------

export type BodyKind = 'query' | 'json'
export type HttpMethod = 'GET' | 'POST'

export interface MethodMeta {
	/** Canonical `namespace.method` id (e.g. `artist.getInfo`). */
	readonly id: string
	/** Namespace (e.g. `artist`). */
	readonly ns: string
	/** Method name (e.g. `getInfo`). */
	readonly name: string
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
}>

const NS_CONFIG: Readonly<Record<string, NamespaceConfig>> = {
	artist: { methods: REGISTRY_PROBE.artist as unknown as ServiceMethods, schemas: artistSchemas },
	album: { methods: REGISTRY_PROBE.album as unknown as ServiceMethods, schemas: albumSchemas },
	track: { methods: REGISTRY_PROBE.track as unknown as ServiceMethods, schemas: trackSchemas },
	user: { methods: REGISTRY_PROBE.user as unknown as ServiceMethods, schemas: userSchemas },
	tag: { methods: REGISTRY_PROBE.tag as unknown as ServiceMethods, schemas: tagSchemas },
	chart: { methods: REGISTRY_PROBE.chart as unknown as ServiceMethods, schemas: chartSchemas },
	geo: { methods: REGISTRY_PROBE.geo as unknown as ServiceMethods, schemas: geoSchemas },
	library: { methods: REGISTRY_PROBE.library as unknown as ServiceMethods, schemas: librarySchemas },
	auth: { methods: REGISTRY_PROBE.auth as unknown as ServiceMethods, schemas: authSchemas },
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
}

/**
 * Methods that deviate from their namespace defaults.
 * Add an entry here when a new method is signed, requires session,
 * uses POST, or has a non-default body kind.
 */
const SPECIAL: Readonly<
	Record<
		string,
		Partial<Pick<MethodMeta, 'httpMethod' | 'bodyKind' | 'requiresSession' | 'requiresSignature' | 'deprecated'>>
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
	// Auth: getMobileSession is POST + signed but does NOT need a session.
	// Deprecated as of #105: only works for mobile-class API keys, which
	// are not self-service. See src/services/auth.ts for the full note.
	'auth.getMobileSession': { httpMethod: 'POST', bodyKind: 'json', requiresSession: false, deprecated: true },
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
		throw new Error(`method "${name}" is not exported from services/${ns}.ts (canonical id: ${id})`)
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
			`response schema "${responseKey}" not found in services/${ns}.schemas.ts. ` +
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
		resolve,
		schema,
		response,
		...defaults,
		...override,
	}
}

const registry: Record<string, Record<string, MethodMeta>> = {}
for (const id of CANONICAL_METHODS) {
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
