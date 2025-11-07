import { z } from "zod";
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
    image: z.ZodArray<z.ZodString>;
    "@attr": z.ZodObject<{
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
        image: z.ZodArray<z.ZodString>;
        "@attr": z.ZodObject<{
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
            image: z.ZodArray<z.ZodString>;
            "@attr": z.ZodObject<{
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
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
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
        "@attr": z.ZodObject<{
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
        "@attr": z.ZodObject<{
            artist: z.ZodString;
            track: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const trackSearchRequestSchema: z.ZodObject<{
    track: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
    artist: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackScrobbleRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    track: z.ZodString;
    timestamp: z.ZodString;
    sk: z.ZodString;
    album: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const trackScrobbleResponseSchema: z.ZodObject<{
    scrobbles: z.ZodObject<{
        scrobble: z.ZodObject<{
            artist: z.ZodObject<{
                corrected: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            album: z.ZodObject<{
                corrected: z.ZodString;
            }, z.core.$strip>;
            track: z.ZodObject<{
                corrected: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            ignoredMessage: z.ZodObject<{
                code: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            albumArtist: z.ZodObject<{
                corrected: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            timestamp: z.ZodString;
        }, z.core.$strip>;
        "@attr": z.ZodObject<{
            accepted: z.ZodNumber;
            ignored: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const batchTracksScrobbleRequestSchema: z.ZodObject<{
    tracks: z.ZodArray<z.ZodObject<{
        artist: z.ZodString;
        track: z.ZodString;
        timestamp: z.ZodString;
        album: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    sk: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=track.schemas.d.ts.map