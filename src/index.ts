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
export type * from './insights/index.js'
// Insights service & schemas
export * from './insights/index.js'

// Utilities
export { buildAuthUrl, buildUrl, fetcher, generateSignature, LastFmApiError, parseLastFmResponse } from './utils.js'
