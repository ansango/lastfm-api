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
        image: z.ZodArray<z.ZodString>;
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
    image: z.ZodArray<z.ZodString>;
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
            image: z.ZodArray<z.ZodString>;
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
        image: z.ZodArray<z.ZodString>;
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
                image: z.ZodArray<z.ZodString>;
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
            image: z.ZodArray<z.ZodString>;
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
    page: z.ZodOptional<z.ZodString>;
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
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
            page: z.ZodString;
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
    page: z.ZodOptional<z.ZodString>;
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
            image: z.ZodArray<z.ZodString>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            artist: z.ZodString;
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const artistSearchRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
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
                image: z.ZodArray<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        "@attr": z.ZodObject<{
            for: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=artist.schemas.d.ts.map