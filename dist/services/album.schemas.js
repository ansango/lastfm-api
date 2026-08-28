import { z } from 'zod';
import { albumNameSchema, artistNameSchema, contentSchema, countSchema, durationSchema, forSchema, imageSchema, itemsPerPageSchema, langSchema, limitSchema, listenersSchema, mbidSchema, nameSchema, pageSchema, playcountSchema, publishedSchema, roleSchema, searchTermsSchema, startIndexSchema, startPageSchema, summarySchema, tagNameSchema, textSchema, totalResultsSchema, urlSchema, userNameSchema, } from './schemas/index.js';
const albumTagSchema = z.object({
    tag: z
        .union([
        z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
        })),
        z.object({
            name: tagNameSchema,
            url: urlSchema,
        }),
    ])
        .optional(),
});
const albumTrackArtistSchema = z.object({
    name: artistNameSchema,
    mbid: mbidSchema,
    url: urlSchema,
});
const albumTrackSchema = z.object({
    track: z.array(z.object({
        duration: durationSchema,
        name: nameSchema,
        url: urlSchema,
        artist: albumTrackArtistSchema,
    })),
});
const albumWikiSchema = z.object({
    published: publishedSchema,
    summary: summarySchema,
    content: contentSchema,
});
/**
 * Album
 * @see https://www.last.fm/api/show/album.getInfo
 */
export const albumSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema,
    tags: albumTagSchema,
    playcount: playcountSchema,
    image: z.array(imageSchema),
    tracks: albumTrackSchema.optional(),
    url: urlSchema,
    name: albumNameSchema,
    listeners: listenersSchema,
    wiki: albumWikiSchema,
    userplaycount: playcountSchema.optional(),
});
export const albumGetInfoRequestSchema = z.object({
    artist: artistNameSchema,
    album: albumNameSchema,
    mbid: mbidSchema.optional(),
    username: userNameSchema.optional(),
    lang: langSchema.optional(),
});
export const albumGetInfoResponseSchema = z.object({
    album: albumSchema,
});
export const albumGetTagsRequestSchema = z.object({
    artist: artistNameSchema,
    album: albumNameSchema,
    mbid: mbidSchema.optional(),
    user: userNameSchema,
});
export const albumGetTagsResponseSchema = z.object({
    tags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
        })),
    }),
    '@attr': z.object({
        album: albumNameSchema,
        artist: artistNameSchema,
    }),
});
export const albumGetTopTagsRequestSchema = z.object({
    artist: artistNameSchema,
    album: albumNameSchema,
    mbid: mbidSchema.optional(),
});
export const albumGetTopTagsResponseSchema = z.object({
    tags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
            count: countSchema,
        })),
    }),
    '@attr': z.object({
        album: albumNameSchema,
        artist: artistNameSchema,
    }),
});
export const albumSearchRequestSchema = z.object({
    album: albumNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
});
export const albumSearchResponseSchema = z.object({
    results: z.object({
        'opensearch:Query': z.object({
            '#text': textSchema,
            role: roleSchema,
            searchTerms: searchTermsSchema,
            startPage: startPageSchema,
        }),
        'opensearch:totalResults': totalResultsSchema,
        'opensearch:startIndex': startIndexSchema,
        'opensearch:itemsPerPage': itemsPerPageSchema,
        albummatches: z.object({
            album: z.array(z.object({
                name: albumNameSchema,
                artist: artistNameSchema,
                url: urlSchema,
                image: z.array(imageSchema),
                mbid: mbidSchema,
            })),
        }),
        '@attr': z.object({
            for: forSchema,
        }),
    }),
});
/**
 * Maximum number of tags accepted by `album.addTags` per the Last.fm
 * API. The docs are not explicit about the limit on `album.addTags`
 * specifically, but it matches the documented `track.addTags` /
 * `artist.addTags` cap.
 */
export const MAX_ALBUM_TAGS_PER_ADD = 10;
/**
 * Request shape for `album.addTags`. The `tags` array is sent on the
 * wire as a comma-separated string and validated to at most
 * `MAX_ALBUM_TAGS_PER_ADD` entries.
 * https://www.last.fm/api/show/album.addTags
 */
export const albumAddTagsRequestSchema = z.object({
    artist: artistNameSchema,
    album: albumNameSchema,
    tags: z.array(tagNameSchema).max(MAX_ALBUM_TAGS_PER_ADD, {
        message: `album.addTags accepts at most ${MAX_ALBUM_TAGS_PER_ADD} tags per request`,
    }),
    sk: z.string().optional(),
});
/**
 * Request shape for `album.removeTag`. A single tag is removed per
 * call.
 * https://www.last.fm/api/show/album.removeTag
 */
export const albumRemoveTagRequestSchema = z.object({
    artist: artistNameSchema,
    album: albumNameSchema,
    tag: tagNameSchema,
    sk: z.string().optional(),
});
/**
 * Empty success payload for the void tag-mutation methods. The Last.fm
 * response has no useful domain content, so the schema accepts any
 * shape and we expose the inferred type as `void` at the call site.
 */
export const albumTagMutationResponseSchema = z.unknown();
//# sourceMappingURL=album.schemas.js.map