import { z } from 'zod'

export const cacheStoreStatsSchema = z.object({
	hits: z.number().int().nonnegative(),
	misses: z.number().int().nonnegative(),
	size: z.number().int().nonnegative(),
})

export const cacheOptionsSchema = z.object({
	defaultTtlMs: z.number().positive().optional(),
	ttlByNamespace: z.record(z.string(), z.number().positive()).optional(),
	ttlByMethod: z.record(z.string(), z.number().positive()).optional(),
	enabled: z.boolean().optional(),
})

export type CacheStoreStatsPayload = z.infer<typeof cacheStoreStatsSchema>
export type CacheOptionsSchema = z.infer<typeof cacheOptionsSchema>
