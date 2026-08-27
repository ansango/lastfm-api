import { z } from "zod";
import { albumNameSchema, artistNameSchema, contentSchema, countSchema, durationSchema, imageSchema, itemsPerPageSchema, limitSchema, listenersSchema, matchSchema, mbidSchema, pageSchema, playcountSchema, positionSchema, publishedSchema, roleSchema, searchTermsSchema, startIndexSchema, startPageSchema, summarySchema, tagNameSchema, totalResultsSchema, trackNameSchema, urlSchema, userNameSchema, } from "./schemas/index.js";
export const trackArtistSchema = z.object({
    name: artistNameSchema,
    mbid: mbidSchema,
    url: urlSchema
});
export const trackAlbumSchema = z.object({
    artist: artistNameSchema,
    title: albumNameSchema,
    mbid: mbidSchema,
    url: urlSchema,
    image: z.array(imageSchema),
    "@attr": z.object({
        position: positionSchema
    })
});
export const trackTopTagSchema = z.object({
    tag: z.array(z.object({
        name: tagNameSchema,
        url: urlSchema
    }))
});
export const trackWikiSchema = z.object({
    published: publishedSchema,
    summary: summarySchema,
    content: contentSchema
});
/**
 * Track
 * @see https://www.last.fm/api/show/track.getInfo
 */
export const trackSchema = z.object({
    name: trackNameSchema,
    mbid: mbidSchema,
    url: urlSchema,
    duration: durationSchema,
    listeners: listenersSchema,
    playcount: playcountSchema,
    artist: trackArtistSchema,
    album: trackAlbumSchema,
    topTags: trackTopTagSchema,
    wiki: trackWikiSchema,
    userplaycount: playcountSchema
});
export const trackGetInfoRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    mbid: mbidSchema.optional(),
    username: userNameSchema.optional()
});
export const trackGetInfoResponseSchema = z.object({
    track: trackSchema
});
export const trackGetSimilarRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    mbid: mbidSchema.optional(),
    limit: limitSchema.optional()
});
export const trackGetSimilarResponseSchema = z.object({
    similartracks: z.object({
        track: z.array(z.object({
            name: trackNameSchema,
            playcount: playcountSchema,
            mbid: mbidSchema,
            match: matchSchema,
            url: urlSchema,
            duration: durationSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            artist: artistNameSchema
        })
    })
});
export const trackGetTagsRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    mbid: mbidSchema.optional(),
    user: userNameSchema.optional()
});
export const trackGetTagsResponseSchema = z.object({
    tags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema
        })),
        "@attr": z.object({
            artist: artistNameSchema,
            track: trackNameSchema
        })
    })
});
export const trackGetTopTagsRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    mbid: mbidSchema.optional()
});
export const trackGetTopTagsResponseSchema = z.object({
    toptags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
            count: countSchema
        })),
        "@attr": z.object({
            artist: artistNameSchema,
            track: trackNameSchema
        })
    })
});
export const trackSearchRequestSchema = z.object({
    track: trackNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
    artist: artistNameSchema.optional()
});
export const trackSearchResponseSchema = z.object({
    results: z.object({
        "opensearch:Query": z.object({
            "#text": z.string(),
            role: roleSchema,
            searchTerms: searchTermsSchema,
            startPage: startPageSchema
        }),
        "opensearch:totalResults": totalResultsSchema,
        "opensearch:startIndex": startIndexSchema,
        "opensearch:itemsPerPage": itemsPerPageSchema,
        trackmatches: z.object({
            track: z.array(z.object({
                name: trackNameSchema,
                artist: artistNameSchema,
                url: urlSchema,
                listeners: listenersSchema,
                image: z.array(imageSchema),
                mbid: mbidSchema
            }))
        }),
        "@attr": z.object({
            for: z.string()
        })
    })
});
/**
 * Track correction entry returned by `track.getCorrection`.
 *
 * Each entry carries the canonical track and artist identities
 * (`name`, `mbid`, `url`) and per-field "corrected" flags plus a
 * positional `index` attribute indicating which input this correction
 * maps to.
 *
 * The `corrected` flags and the `index` are sent by Last.fm as JSON
 * strings ("0" / "1") — we accept them as strings.
 * https://www.last.fm/api/show/track.getCorrection
 */
export const trackCorrectionSchema = z.object({
    track: z.object({
        name: trackNameSchema,
        mbid: mbidSchema,
        url: urlSchema
    }),
    artist: z.object({
        name: artistNameSchema,
        mbid: mbidSchema,
        url: urlSchema
    }),
    artistcorrected: z.string().optional(),
    trackcorrected: z.string().optional(),
    "@attr": z.object({
        index: z.string()
    }).optional()
});
export const trackGetCorrectionRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema
});
export const trackGetCorrectionResponseSchema = z.object({
    corrections: z.object({
        correction: z.array(trackCorrectionSchema),
        "@attr": z.object({
            artist: artistNameSchema,
            track: trackNameSchema
        }).optional()
    })
});
export const trackScrobbleRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    timestamp: z.union([z.string(), z.number()]),
    sk: z.string().optional(),
    album: albumNameSchema.optional()
});
export const trackScrobbleResponseSchema = z.object({
    scrobbles: z.object({
        scrobble: z.object({
            artist: z.object({
                corrected: z.string(),
                "#text": artistNameSchema
            }),
            album: z.object({
                corrected: z.string()
            }),
            track: z.object({
                corrected: z.string(),
                "#text": trackNameSchema
            }),
            ignoredMessage: z.object({
                code: z.string(),
                "#text": z.string()
            }),
            albumArtist: z.object({
                corrected: z.string(),
                "#text": albumNameSchema
            }),
            timestamp: z.string()
        }),
        "@attr": z.object({
            accepted: z.number(),
            ignored: z.number()
        })
    })
});
export const batchTracksScrobbleRequestSchema = z.object({
    tracks: z.array(trackScrobbleRequestSchema.omit({ "sk": true })),
    sk: z.string().optional()
});
/**
 * Request shape for `track.updateNowPlaying`. Optional fields are
 * omitted from both the body and the signature when undefined.
 * https://www.last.fm/api/show/track.updateNowPlaying
 */
export const trackUpdateNowPlayingRequestSchema = z.object({
    artist: artistNameSchema,
    track: trackNameSchema,
    album: albumNameSchema.optional(),
    // Wire casing preserved: `trackNumber` and `albumArtist`, not
    // snake_case. The transport's `cleanParams` strips undefined.
    trackNumber: z.union([z.string(), z.number()]).optional(),
    context: z.string().optional(),
    mbid: mbidSchema.optional(),
    duration: z.union([z.string(), z.number()]).optional(),
    albumArtist: artistNameSchema.optional(),
    sk: z.string().optional()
});
/**
 * `{ corrected, "#text" }` payload returned for the textual fields of
 * a now-playing announcement. `corrected` is sent by Last.fm as a
 * JSON string ("0" / "1").
 */
export const correctedTextFieldSchema = z.object({
    corrected: z.string(),
    "#text": z.string()
});
/**
 * `{ corrected }` payload for fields that don't carry a `#text`
 * value (e.g. `album` in the now-playing response).
 */
export const correctedFlagOnlyFieldSchema = z.object({
    corrected: z.string()
});
/**
 * `ignoredMessage` block returned by the now-playing endpoint when
 * the request is accepted but partially or fully ignored.
 */
export const nowPlayingIgnoredMessageSchema = z.object({
    code: z.string(),
    "#text": z.string()
});
/**
 * Response root for `track.updateNowPlaying`. The `nowplaying` block
 * carries the corrected identities and the ignored-message code; all
 * inner fields are optional because Last.fm only echoes the parts
 * that were actually processed.
 */
export const trackUpdateNowPlayingResponseSchema = z.object({
    nowplaying: z.object({
        track: correctedTextFieldSchema.optional(),
        artist: correctedTextFieldSchema.optional(),
        album: correctedFlagOnlyFieldSchema.optional(),
        albumArtist: correctedTextFieldSchema.optional(),
        ignoredMessage: nowPlayingIgnoredMessageSchema
    })
});
//# sourceMappingURL=track.schemas.js.map