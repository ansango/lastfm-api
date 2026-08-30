import { z } from 'zod'
import { imageSchema, userNameSchema } from '../../core/schemas/index.js'

export const watcherTrackSchema = z.object({
	name: z.string(),
	artist: z.string(),
	album: z.string().optional(),
	url: z.string().optional(),
	image: z.array(imageSchema).optional(),
	mbid: z.string().optional(),
	nowPlaying: z.boolean(),
	uts: z.number().int().optional(),
	scrobbledAt: z.number().int().optional(),
})

export const watcherIdleStatusSchema = z.object({
	user: userNameSchema,
	lastSeenUts: z.number().int().nullable(),
	idleMinutes: z.number().nonnegative(),
	checkedAt: z.number().int(),
})

export const watcherPollStatusSchema = z.object({
	user: userNameSchema,
	checkedAt: z.number().int(),
	hasNowPlaying: z.boolean(),
	scrobblesFound: z.number().int().nonnegative(),
})

export const watcherOptionsSchema = z.object({
	user: userNameSchema,
	intervalMs: z.number().int().min(2_000).default(10_000).optional(),
	idleThresholdMs: z.number().int().min(10_000).default(300_000).optional(),
	emitInitial: z.boolean().default(true).optional(),
	autoStart: z.boolean().default(false).optional(),
})

export type WatcherTrack = z.infer<typeof watcherTrackSchema>
export type WatcherIdleStatus = z.infer<typeof watcherIdleStatusSchema>
export type WatcherPollStatus = z.infer<typeof watcherPollStatusSchema>
export type WatcherOptions = z.infer<typeof watcherOptionsSchema>
