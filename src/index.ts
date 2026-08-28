// Configuration

// Clients
export { createClient, LastFmClient } from './client.js'
export {
	createConfig,
	getGlobalConfig,
	type LastFmConfig,
	resetGlobalConfig,
	setGlobalConfig,
} from './config.js'
// Canonical methods inventory
export { CANONICAL_METHODS, type CanonicalMethod } from './core/canonical-methods.js'
export { createCoreClient, LastFmCoreClient } from './core/client.js'
export * from './core/pagination.js'
export type * from './core/schemas/index.js'
export * from './core/schemas/index.js'
// Core services & schemas
export * from './core/services/index.js'
export type * from './exporter/index.js'
// Exporter service & schemas
export * from './exporter/index.js'
export type * from './insights/index.js'
// Insights service & schemas
export * from './insights/index.js'
export type * from './playlists/index.js'
// Playlists service & schemas
export * from './playlists/index.js'
export type * from './reports/index.js'
// Reports service & schemas
export * from './reports/index.js'

// Utilities
export { buildAuthUrl, buildUrl, fetcher, generateSignature, LastFmApiError, parseLastFmResponse } from './utils.js'
