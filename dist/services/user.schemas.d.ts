import { z } from "zod";
export declare const userGetFriendsResponseSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
export declare const userGetFriendsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const userGetInfoRequestSchema: z.ZodObject<{
    user: z.ZodString;
}, z.core.$strip>;
/**
 * User
 * @see https://www.last.fm/api/show/user.getInfo
 */
export declare const userSchema: z.ZodObject<{
    name: z.ZodString;
    age: z.ZodString;
    subscriber: z.ZodString;
    realname: z.ZodString;
    bootstrap: z.ZodString;
    playcount: z.ZodString;
    artist_count: z.ZodString;
    playlists: z.ZodString;
    track_count: z.ZodString;
    album_count: z.ZodString;
    image: z.ZodArray<z.ZodString>;
    registered: z.ZodObject<{
        unixtime: z.ZodNumber;
        "#text": z.ZodNumber;
    }, z.core.$strip>;
    country: z.ZodString;
    gender: z.ZodString;
    url: z.ZodString;
    type: z.ZodString;
}, z.core.$strip>;
export declare const userGetInfoResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        name: z.ZodString;
        age: z.ZodString;
        subscriber: z.ZodString;
        realname: z.ZodString;
        bootstrap: z.ZodString;
        playcount: z.ZodString;
        artist_count: z.ZodString;
        playlists: z.ZodString;
        track_count: z.ZodString;
        album_count: z.ZodString;
        image: z.ZodArray<z.ZodString>;
        registered: z.ZodObject<{
            unixtime: z.ZodNumber;
            "#text": z.ZodNumber;
        }, z.core.$strip>;
        country: z.ZodString;
        gender: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetLovedTracksRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const lovedTracksSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        date: z.ZodAny;
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodString;
        perPages: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetLovedTracksResponseSchema: z.ZodObject<{
    lovedtracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            date: z.ZodAny;
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodString;
            perPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetRecentTracksRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const recentTracksSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>;
        album: z.ZodObject<{
            mbid: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>;
        date: z.ZodOptional<z.ZodAny>;
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodString>;
        "@attr": z.ZodOptional<z.ZodObject<{
            nowplaying: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodString;
        perPages: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetRecentTracksResponseSchema: z.ZodObject<{
    recenttracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            album: z.ZodObject<{
                mbid: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            date: z.ZodOptional<z.ZodAny>;
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodString>;
            "@attr": z.ZodOptional<z.ZodObject<{
                nowplaying: z.ZodBoolean;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodString;
            perPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopAlbumsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const topAlbumsSchema: z.ZodObject<{
    album: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        image: z.ZodArray<z.ZodString>;
        mbid: z.ZodString;
        url: z.ZodString;
        playcount: z.ZodString;
        name: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodString;
        perPages: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopAlbumsResponseSchema: z.ZodObject<{
    topalbums: z.ZodObject<{
        album: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodString>;
            mbid: z.ZodString;
            url: z.ZodString;
            playcount: z.ZodString;
            name: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodString;
            perPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopArtistsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const topArtistsSchema: z.ZodObject<{
    artist: z.ZodArray<z.ZodObject<{
        image: z.ZodArray<z.ZodString>;
        mbid: z.ZodString;
        name: z.ZodString;
        playcount: z.ZodString;
        url: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodString;
        perPages: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopArtistsResponseSchema: z.ZodObject<{
    topartists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            image: z.ZodArray<z.ZodString>;
            mbid: z.ZodString;
            name: z.ZodString;
            playcount: z.ZodString;
            url: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodString;
            perPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTagsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const topTagsSchema: z.ZodObject<{
    tag: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTagsResponseSchema: z.ZodObject<{
    toptags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTracksRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const topTracksSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        mbid: z.ZodString;
        name: z.ZodString;
        image: z.ZodArray<z.ZodString>;
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        url: z.ZodString;
        duration: z.ZodString;
        playcount: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodString;
        perPages: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTracksResponseSchema: z.ZodObject<{
    toptracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            mbid: z.ZodString;
            name: z.ZodString;
            image: z.ZodArray<z.ZodString>;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            url: z.ZodString;
            duration: z.ZodString;
            playcount: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodString;
            perPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyAlbumChartRequestSchema: z.ZodObject<{
    user: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const weeklyAlbumChartAttrSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    user: z.ZodString;
}, z.core.$strip>;
export declare const weeklyAlbumChartSchema: z.ZodObject<{
    album: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            mbid: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>;
        mbid: z.ZodString;
        url: z.ZodString;
        name: z.ZodString;
        playcount: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        from: z.ZodString;
        user: z.ZodString;
        to: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyAlbumChartResponseSchema: z.ZodObject<{
    weeklyalbumchart: z.ZodObject<{
        album: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                mbid: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            mbid: z.ZodString;
            url: z.ZodString;
            name: z.ZodString;
            playcount: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            from: z.ZodString;
            user: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyArtistChartRequestSchema: z.ZodObject<{
    user: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const weeklyArtistChartSchema: z.ZodObject<{
    artist: z.ZodArray<z.ZodObject<{
        mbid: z.ZodString;
        url: z.ZodString;
        name: z.ZodString;
        playcount: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        to: z.ZodString;
        from: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyArtistChartResponseSchema: z.ZodObject<{
    weeklyartistchart: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            mbid: z.ZodString;
            url: z.ZodString;
            name: z.ZodString;
            playcount: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            to: z.ZodString;
            from: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyChartListRequestSchema: z.ZodObject<{
    user: z.ZodString;
}, z.core.$strip>;
export declare const weeklyChartListSchema: z.ZodObject<{
    chart: z.ZodArray<z.ZodObject<{
        "#text": z.ZodString;
        from: z.ZodString;
        to: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const userGetWeeklyChartListResponseSchema: z.ZodObject<{
    weeklychartlist: z.ZodObject<{
        chart: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyTrackChartRequestSchema: z.ZodObject<{
    user: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const weeklyTrackChartSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            mbid: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>;
        image: z.ZodArray<z.ZodString>;
        mbid: z.ZodString;
        url: z.ZodString;
        name: z.ZodString;
        playcount: z.ZodString;
        "@attr": z.ZodObject<{
            rank: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        to: z.ZodString;
        from: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetWeeklyTrackChartResponseSchema: z.ZodObject<{
    weeklytrackchart: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            artist: z.ZodObject<{
                mbid: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodString>;
            mbid: z.ZodString;
            url: z.ZodString;
            name: z.ZodString;
            playcount: z.ZodString;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            to: z.ZodString;
            from: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=user.schemas.d.ts.map