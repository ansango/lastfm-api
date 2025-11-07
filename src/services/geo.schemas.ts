import { z } from "zod";
import {
	artistNameSchema,
	countrySchema,
	durationSchema,
	imageSchema,
	itemsPerPageSchema,
	limitSchema,
	listenersSchema,
	locSchema,
	mbidSchema,
	pageSchema,
	rankSchema,
	totalPagesSchema,
	totalSchema,
	trackNameSchema,
	urlSchema
} from "./schemas/index.js";

export const geoGetTopArtistsRequestSchema = z.object({
    country: countrySchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const geoGetTopArtistsResponseSchema = z.object({
    topartists: z.object({
        artist: z.array(z.object({
            name: artistNameSchema,
            listeners: listenersSchema,
            mbid: mbidSchema,
            url: urlSchema,
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            country: countrySchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});

export const geoGetTopTracksRequestSchema = z.object({
    country: countrySchema,
    location: locSchema.optional(),
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const geoGetTopTracksResponseSchema = z.object({
    tracks: z.object({
        track: z.array(z.object({
            name: trackNameSchema,
            duration: durationSchema,
            listeners: listenersSchema,
            mbid: mbidSchema,
            url: urlSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema),
            "@attr": z.object({
                rank: rankSchema
            })
        })),
        "@attr": z.object({
            country: countrySchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});

export type GeoGetTopArtistsRequest = z.infer<typeof geoGetTopArtistsRequestSchema>;
export type GeoGetTopArtistsResponse = z.infer<typeof geoGetTopArtistsResponseSchema>;
export type GeoGetTopTracksRequest = z.infer<typeof geoGetTopTracksRequestSchema>;
export type GeoGetTopTracksResponse = z.infer<typeof geoGetTopTracksResponseSchema>;
