import { z } from 'zod';
export declare const trackArtistSchema: z.ZodObject<{
    name: z.ZodString;
    mbid: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;
export declare const trackAlbumSchema: z.ZodObject<{
    artist: z.ZodString;
    title: z.ZodString;
    mbid: z.ZodString;
    url: z.ZodString;
    image: z.ZodArray<z.ZodObject<{
        '#text': z.ZodString;
        size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
    }, z.core.$strip>>;
    '@attr': z.ZodObject<{
        position: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackTopTagSchema: z.ZodObject<{
    tag: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const trackWikiSchema: z.ZodObject<{
    published: z.ZodString;
    summary: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
/**
 * Track
 * @see https://www.last.fm/api/show/track.getInfo
 */
export declare const trackSchema: z.ZodObject<{
    name: z.ZodString;
    mbid: z.ZodString;
    url: z.ZodString;
    duration: z.ZodString;
    listeners: z.ZodString;
    playcount: z.ZodString;
    artist: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>;
    album: z.ZodObject<{
        artist: z.ZodString;
        title: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            '#text': z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
        '@attr': z.ZodObject<{
            position: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    topTags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    wiki: z.ZodObject<{
        published: z.ZodString;
        summary: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
    userplaycount: z.ZodString;
}, z.core.$strip>;
export declare const trackGetInfoRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackGetInfoResponseSchema: z.ZodObject<{
    track: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        duration: z.ZodString;
        listeners: z.ZodString;
        playcount: z.ZodString;
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        album: z.ZodObject<{
            artist: z.ZodString;
            title: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                '#text': z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            '@attr': z.ZodObject<{
                position: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>;
        topTags: z.ZodObject<{
            tag: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        wiki: z.ZodObject<{
            published: z.ZodString;
            summary: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
        userplaycount: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackGetSimilarRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const trackGetSimilarResponseSchema: z.ZodObject<{
    similartracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            playcount: z.ZodString;
            mbid: z.ZodString;
            match: z.ZodString;
            url: z.ZodString;
            duration: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodObject<{
                '#text': z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        '@attr': z.ZodObject<{
            artist: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackGetTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    user: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackGetTagsResponseSchema: z.ZodObject<{
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
        '@attr': z.ZodObject<{
            artist: z.ZodString;
            track: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackGetTopTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackGetTopTagsResponseSchema: z.ZodObject<{
    toptags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        '@attr': z.ZodObject<{
            artist: z.ZodString;
            track: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackSearchRequestSchema: z.ZodObject<{
    track: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    artist: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackSearchResponseSchema: z.ZodObject<{
    results: z.ZodObject<{
        'opensearch:Query': z.ZodObject<{
            '#text': z.ZodString;
            role: z.ZodString;
            searchTerms: z.ZodString;
            startPage: z.ZodString;
        }, z.core.$strip>;
        'opensearch:totalResults': z.ZodString;
        'opensearch:startIndex': z.ZodString;
        'opensearch:itemsPerPage': z.ZodString;
        trackmatches: z.ZodObject<{
            track: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                artist: z.ZodString;
                url: z.ZodString;
                listeners: z.ZodString;
                image: z.ZodArray<z.ZodObject<{
                    '#text': z.ZodString;
                    size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
                }, z.core.$strip>>;
                mbid: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        '@attr': z.ZodObject<{
            for: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
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
export declare const trackCorrectionSchema: z.ZodObject<{
    track: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>;
    artist: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>;
    artistcorrected: z.ZodOptional<z.ZodString>;
    trackcorrected: z.ZodOptional<z.ZodString>;
    '@attr': z.ZodOptional<z.ZodObject<{
        index: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const trackGetCorrectionRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
}, z.core.$strip>;
export declare const trackGetCorrectionResponseSchema: z.ZodObject<{
    corrections: z.ZodObject<{
        correction: z.ZodArray<z.ZodObject<{
            track: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            artistcorrected: z.ZodOptional<z.ZodString>;
            trackcorrected: z.ZodOptional<z.ZodString>;
            '@attr': z.ZodOptional<z.ZodObject<{
                index: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        '@attr': z.ZodOptional<z.ZodObject<{
            artist: z.ZodString;
            track: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackScrobbleRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    timestamp: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    sk: z.ZodOptional<z.ZodString>;
    album: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackScrobbleResponseSchema: z.ZodObject<{
    scrobbles: z.ZodObject<{
        scrobble: z.ZodObject<{
            artist: z.ZodObject<{
                corrected: z.ZodString;
                '#text': z.ZodString;
            }, z.core.$strip>;
            album: z.ZodObject<{
                corrected: z.ZodString;
            }, z.core.$strip>;
            track: z.ZodObject<{
                corrected: z.ZodString;
                '#text': z.ZodString;
            }, z.core.$strip>;
            ignoredMessage: z.ZodObject<{
                code: z.ZodString;
                '#text': z.ZodString;
            }, z.core.$strip>;
            albumArtist: z.ZodObject<{
                corrected: z.ZodString;
                '#text': z.ZodString;
            }, z.core.$strip>;
            timestamp: z.ZodString;
        }, z.core.$strip>;
        '@attr': z.ZodObject<{
            accepted: z.ZodNumber;
            ignored: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const batchTracksScrobbleRequestSchema: z.ZodObject<{
    tracks: z.ZodArray<z.ZodObject<{
        track: z.ZodString;
        artist: z.ZodString;
        album: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>>;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Maximum number of tags accepted by `track.addTags` per the Last.fm
 * API documentation.
 */
export declare const MAX_TRACK_TAGS_PER_ADD = 10;
/**
 * Request shape for `track.addTags`. The `tags` array is sent on the
 * wire as a comma-separated string and validated to at most
 * `MAX_TRACK_TAGS_PER_ADD` entries.
 * https://www.last.fm/api/show/track.addTags
 */
export declare const trackAddTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Request shape for `track.removeTag`. A single tag is removed per
 * call.
 * https://www.last.fm/api/show/track.removeTag
 */
export declare const trackRemoveTagRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    tag: z.ZodString;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Request shape for `track.love` / `track.unlove`. Both share the
 * same body — only the method name changes.
 * https://www.last.fm/api/show/track.love
 * https://www.last.fm/api/show/track.unlove
 */
export declare const trackLoveRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackUnloveRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Empty success payload for the void tag/love mutations.
 */
export declare const trackMutationResponseSchema: z.ZodUnknown;
/**
 * Request shape for `track.updateNowPlaying`. Optional fields are
 * omitted from both the body and the signature when undefined.
 * https://www.last.fm/api/show/track.updateNowPlaying
 */
export declare const trackUpdateNowPlayingRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    album: z.ZodOptional<z.ZodString>;
    trackNumber: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    context: z.ZodOptional<z.ZodString>;
    mbid: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    albumArtist: z.ZodOptional<z.ZodString>;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * `{ corrected, "#text" }` payload returned for the textual fields of
 * a now-playing announcement. `corrected` is sent by Last.fm as a
 * JSON string ("0" / "1").
 */
export declare const correctedTextFieldSchema: z.ZodObject<{
    corrected: z.ZodString;
    '#text': z.ZodString;
}, z.core.$strip>;
/**
 * `{ corrected }` payload for fields that don't carry a `#text`
 * value (e.g. `album` in the now-playing response).
 */
export declare const correctedFlagOnlyFieldSchema: z.ZodObject<{
    corrected: z.ZodString;
}, z.core.$strip>;
/**
 * `ignoredMessage` block returned by the now-playing endpoint when
 * the request is accepted but partially or fully ignored.
 */
export declare const nowPlayingIgnoredMessageSchema: z.ZodObject<{
    code: z.ZodString;
    '#text': z.ZodString;
}, z.core.$strip>;
/**
 * Response root for `track.updateNowPlaying`. The `nowplaying` block
 * carries the corrected identities and the ignored-message code; all
 * inner fields are optional because Last.fm only echoes the parts
 * that were actually processed.
 */
export declare const trackUpdateNowPlayingResponseSchema: z.ZodObject<{
    nowplaying: z.ZodObject<{
        track: z.ZodOptional<z.ZodObject<{
            corrected: z.ZodString;
            '#text': z.ZodString;
        }, z.core.$strip>>;
        artist: z.ZodOptional<z.ZodObject<{
            corrected: z.ZodString;
            '#text': z.ZodString;
        }, z.core.$strip>>;
        album: z.ZodOptional<z.ZodObject<{
            corrected: z.ZodString;
        }, z.core.$strip>>;
        albumArtist: z.ZodOptional<z.ZodObject<{
            corrected: z.ZodString;
            '#text': z.ZodString;
        }, z.core.$strip>>;
        ignoredMessage: z.ZodObject<{
            code: z.ZodString;
            '#text': z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TrackArtist = z.infer<typeof trackArtistSchema>;
export type TrackAlbum = z.infer<typeof trackAlbumSchema>;
export type TrackTopTag = z.infer<typeof trackTopTagSchema>;
export type TrackWiki = z.infer<typeof trackWikiSchema>;
export type Track = z.infer<typeof trackSchema>;
export type TrackGetInfoRequest = z.infer<typeof trackGetInfoRequestSchema>;
export type TrackGetInfoResponse = z.infer<typeof trackGetInfoResponseSchema>;
export type TrackGetSimilarRequest = z.infer<typeof trackGetSimilarRequestSchema>;
export type TrackGetSimilarResponse = z.infer<typeof trackGetSimilarResponseSchema>;
export type TrackGetTagsRequest = z.infer<typeof trackGetTagsRequestSchema>;
export type TrackGetTagsResponse = z.infer<typeof trackGetTagsResponseSchema>;
export type TrackGetTopTagsRequest = z.infer<typeof trackGetTopTagsRequestSchema>;
export type TrackGetTopTagsResponse = z.infer<typeof trackGetTopTagsResponseSchema>;
export type TrackSearchRequest = z.infer<typeof trackSearchRequestSchema>;
export type TrackSearchResponse = z.infer<typeof trackSearchResponseSchema>;
export type TrackCorrection = z.infer<typeof trackCorrectionSchema>;
export type TrackGetCorrectionRequest = z.infer<typeof trackGetCorrectionRequestSchema>;
export type TrackGetCorrectionResponse = z.infer<typeof trackGetCorrectionResponseSchema>;
export type TrackScrobbleRequest = z.infer<typeof trackScrobbleRequestSchema>;
export type TrackScrobbleResponse = z.infer<typeof trackScrobbleResponseSchema>;
export type BatchTracksScrobbleRequest = z.infer<typeof batchTracksScrobbleRequestSchema>;
export type TrackAddTagsRequest = z.infer<typeof trackAddTagsRequestSchema>;
export type TrackRemoveTagRequest = z.infer<typeof trackRemoveTagRequestSchema>;
export type TrackLoveRequest = z.infer<typeof trackLoveRequestSchema>;
export type TrackUnloveRequest = TrackLoveRequest;
export type TrackMutationResponse = z.infer<typeof trackMutationResponseSchema>;
export type TrackUpdateNowPlayingRequest = z.infer<typeof trackUpdateNowPlayingRequestSchema>;
export type CorrectedTextField = z.infer<typeof correctedTextFieldSchema>;
export type CorrectedFlagOnlyField = z.infer<typeof correctedFlagOnlyFieldSchema>;
export type NowPlayingIgnoredMessage = z.infer<typeof nowPlayingIgnoredMessageSchema>;
export type TrackUpdateNowPlayingResponse = z.infer<typeof trackUpdateNowPlayingResponseSchema>;
//# sourceMappingURL=track.schemas.d.ts.map