import { z } from "zod";
export declare const artistStatsSchema: z.ZodObject<{
    listeners: z.ZodString;
    playcount: z.ZodString;
    userplaycount: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const artistSimilarSchema: z.ZodObject<{
    artist: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const artistTagsSchema: z.ZodObject<{
    tag: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const artistBioSchema: z.ZodObject<{
    links: z.ZodObject<{
        link: z.ZodObject<{
            "#text": z.ZodString;
            rel: z.ZodString;
            href: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    published: z.ZodString;
    summary: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
/**
 * Artist
 * @see https://www.last.fm/api/show/artist.getInfo
 */
export declare const artistSchema: z.ZodObject<{
    name: z.ZodString;
    mbid: z.ZodString;
    url: z.ZodString;
    image: z.ZodArray<z.ZodObject<{
        "#text": z.ZodString;
        size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
    }, z.core.$strip>>;
    ontour: z.ZodString;
    stats: z.ZodObject<{
        listeners: z.ZodString;
        playcount: z.ZodString;
        userplaycount: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    similar: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    bio: z.ZodObject<{
        links: z.ZodObject<{
            link: z.ZodObject<{
                "#text": z.ZodString;
                rel: z.ZodString;
                href: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>;
        published: z.ZodString;
        summary: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistGetInfoRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
    user: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const artistGetInfoResponseSchema: z.ZodObject<{
    artist: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
        ontour: z.ZodString;
        stats: z.ZodObject<{
            listeners: z.ZodString;
            playcount: z.ZodString;
            userplaycount: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        similar: z.ZodObject<{
            artist: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                image: z.ZodArray<z.ZodObject<{
                    "#text": z.ZodString;
                    size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        tags: z.ZodObject<{
            tag: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        bio: z.ZodObject<{
            links: z.ZodObject<{
                link: z.ZodObject<{
                    "#text": z.ZodString;
                    rel: z.ZodString;
                    href: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>;
            published: z.ZodString;
            summary: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistGetTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const artistGetTagsResponseSchema: z.ZodObject<{
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Artist correction entry returned by `artist.getCorrection`.
 *
 * Last.fm returns a list of corrections. Each entry carries the
 * canonical artist identity (`name`, `mbid`, `url`) and a positional
 * `index` attribute indicating which input this correction maps to.
 * https://www.last.fm/api/show/artist.getCorrection
 */
export declare const artistCorrectionSchema: z.ZodObject<{
    artist: z.ZodObject<{
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>;
    "@attr": z.ZodOptional<z.ZodObject<{
        index: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const artistGetCorrectionRequestSchema: z.ZodObject<{
    artist: z.ZodString;
}, z.core.$strip>;
export declare const artistGetCorrectionResponseSchema: z.ZodObject<{
    corrections: z.ZodObject<{
        correction: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            "@attr": z.ZodOptional<z.ZodObject<{
                index: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodOptional<z.ZodObject<{
            artist: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Maximum number of tags accepted by `artist.addTags` per the Last.fm
 * API documentation.
 */
export declare const MAX_ARTIST_TAGS_PER_ADD = 10;
/**
 * Request shape for `artist.addTags`. The `tags` array is sent on the
 * wire as a comma-separated string and validated to at most
 * `MAX_ARTIST_TAGS_PER_ADD` entries.
 * https://www.last.fm/api/show/artist.addTags
 */
export declare const artistAddTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Request shape for `artist.removeTag`. A single tag is removed per
 * call.
 * https://www.last.fm/api/show/artist.removeTag
 */
export declare const artistRemoveTagRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    tag: z.ZodString;
    sk: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Empty success payload for the void tag-mutation methods.
 */
export declare const artistTagMutationResponseSchema: z.ZodUnknown;
export declare const artistGetSimilarRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const artistGetSimilarResponseSchema: z.ZodObject<{
    similarartists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            match: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistGetTopAlbumsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const artistGetTopAlbumsResponseSchema: z.ZodObject<{
    topalbums: z.ZodObject<{
        album: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            playcount: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistGetTopTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const artistGetTopTagsResponseSchema: z.ZodObject<{
    toptags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistGetTopTracksRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const artistGetTopTracksResponseSchema: z.ZodObject<{
    toptracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            playcount: z.ZodString;
            listeners: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistSearchRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const artistSearchResponseSchema: z.ZodObject<{
    results: z.ZodObject<{
        "opensearch:Query": z.ZodObject<{
            "#text": z.ZodString;
            role: z.ZodString;
            searchTerms: z.ZodString;
            startPage: z.ZodString;
        }, z.core.$strip>;
        "opensearch:totalResults": z.ZodString;
        "opensearch:startIndex": z.ZodString;
        "opensearch:itemsPerPage": z.ZodString;
        artistmatches: z.ZodObject<{
            artist: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                listeners: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
                image: z.ZodArray<z.ZodObject<{
                    "#text": z.ZodString;
                    size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        "@attr": z.ZodObject<{
            for: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ArtistStats = z.infer<typeof artistStatsSchema>;
export type ArtistSimilar = z.infer<typeof artistSimilarSchema>;
export type ArtistTags = z.infer<typeof artistTagsSchema>;
export type ArtistBio = z.infer<typeof artistBioSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type ArtistGetInfoRequest = z.infer<typeof artistGetInfoRequestSchema>;
export type ArtistGetInfoResponse = z.infer<typeof artistGetInfoResponseSchema>;
export type ArtistGetTagsRequest = z.infer<typeof artistGetTagsRequestSchema>;
export type ArtistGetTagsResponse = z.infer<typeof artistGetTagsResponseSchema>;
export type ArtistCorrection = z.infer<typeof artistCorrectionSchema>;
export type ArtistGetCorrectionRequest = z.infer<typeof artistGetCorrectionRequestSchema>;
export type ArtistGetCorrectionResponse = z.infer<typeof artistGetCorrectionResponseSchema>;
export type ArtistAddTagsRequest = z.infer<typeof artistAddTagsRequestSchema>;
export type ArtistRemoveTagRequest = z.infer<typeof artistRemoveTagRequestSchema>;
export type ArtistTagMutationResponse = z.infer<typeof artistTagMutationResponseSchema>;
export type ArtistGetSimilarRequest = z.infer<typeof artistGetSimilarRequestSchema>;
export type ArtistGetSimilarResponse = z.infer<typeof artistGetSimilarResponseSchema>;
export type ArtistGetTopAlbumsRequest = z.infer<typeof artistGetTopAlbumsRequestSchema>;
export type ArtistGetTopAlbumsResponse = z.infer<typeof artistGetTopAlbumsResponseSchema>;
export type ArtistGetTopTagsRequest = z.infer<typeof artistGetTopTagsRequestSchema>;
export type ArtistGetTopTagsResponse = z.infer<typeof artistGetTopTagsResponseSchema>;
export type ArtistGetTopTracksRequest = z.infer<typeof artistGetTopTracksRequestSchema>;
export type ArtistGetTopTracksResponse = z.infer<typeof artistGetTopTracksResponseSchema>;
export type ArtistSearchRequest = z.infer<typeof artistSearchRequestSchema>;
export type ArtistSearchResponse = z.infer<typeof artistSearchResponseSchema>;
//# sourceMappingURL=artist.schemas.d.ts.map