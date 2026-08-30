// Core (Transport, Auth, Errors, Pagination, Base Schemas, Config)

// Canonical Last.fm API Namespaces
export * from '@/api/index.js'
// Canonical Methods
export { CANONICAL_METHODS, type CanonicalMethod } from '@/canonical-methods.js'
// Client Facade
export {
	createClient,
	createClient as createCoreClient,
	LastFmClient,
	LastFmClient as LastFmCoreClient,
} from '@/client.js'
export * from '@/core/index.js'
// Feature Modules & Extensions
export * from '@/modules/index.js'

// Transport & Signature Utilities
export {
	buildAuthUrl,
	buildUrl,
	fetcher,
	generateSignature,
	LastFmApiError,
	parseLastFmResponse,
	signedPost,
} from '@/utils.js'
