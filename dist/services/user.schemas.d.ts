import { z } from "zod";
export declare const userGetFriendsResponseSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
export declare const userGetFriendsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
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
    image: z.ZodArray<z.ZodObject<{
        "#text": z.ZodString;
        size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
    }, z.core.$strip>>;
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
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
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
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const lovedTracksSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        date: z.ZodObject<{
            uts: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>;
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
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
            date: z.ZodObject<{
                uts: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>;
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetRecentTracksRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
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
        date: z.ZodOptional<z.ZodObject<{
            uts: z.ZodString;
            "#text": z.ZodString;
        }, z.core.$strip>>;
        name: z.ZodString;
        mbid: z.ZodString;
        url: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
        "@attr": z.ZodOptional<z.ZodObject<{
            nowplaying: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    "@attr": z.ZodObject<{
        user: z.ZodString;
        totalPages: z.ZodString;
        pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
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
            date: z.ZodOptional<z.ZodObject<{
                uts: z.ZodString;
                "#text": z.ZodString;
            }, z.core.$strip>>;
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            "@attr": z.ZodOptional<z.ZodObject<{
                nowplaying: z.ZodBoolean;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopAlbumsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    period: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"overall">, z.ZodLiteral<"7day">, z.ZodLiteral<"1month">, z.ZodLiteral<"3month">, z.ZodLiteral<"6month">, z.ZodLiteral<"12month">]>>;
}, z.core.$strip>;
export declare const topAlbumsSchema: z.ZodObject<{
    album: z.ZodArray<z.ZodObject<{
        artist: z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
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
        pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
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
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
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
            pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopArtistsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    period: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"overall">, z.ZodLiteral<"7day">, z.ZodLiteral<"1month">, z.ZodLiteral<"3month">, z.ZodLiteral<"6month">, z.ZodLiteral<"12month">]>>;
}, z.core.$strip>;
export declare const topArtistsSchema: z.ZodObject<{
    artist: z.ZodArray<z.ZodObject<{
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
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
        pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopArtistsResponseSchema: z.ZodObject<{
    topartists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
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
            pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTagsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
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
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    period: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"overall">, z.ZodLiteral<"7day">, z.ZodLiteral<"1month">, z.ZodLiteral<"3month">, z.ZodLiteral<"6month">, z.ZodLiteral<"12month">]>>;
}, z.core.$strip>;
export declare const topTracksSchema: z.ZodObject<{
    track: z.ZodArray<z.ZodObject<{
        mbid: z.ZodString;
        name: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
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
        pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userGetTopTracksResponseSchema: z.ZodObject<{
    toptracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            mbid: z.ZodString;
            name: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
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
            pages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPages: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
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
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
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
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
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
export type UserGetFriendsRequest = z.infer<typeof userGetFriendsRequestSchema>;
export type UserGetFriendsResponse = z.infer<typeof userGetFriendsResponseSchema>;
export type UserGetInfoRequest = z.infer<typeof userGetInfoRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type UserGetInfoResponse = z.infer<typeof userGetInfoResponseSchema>;
export type UserGetLovedTracksRequest = z.infer<typeof userGetLovedTracksRequestSchema>;
export type LovedTracks = z.infer<typeof lovedTracksSchema>;
export type UserGetLovedTracksResponse = z.infer<typeof userGetLovedTracksResponseSchema>;
export type UserGetRecentTracksRequest = z.infer<typeof userGetRecentTracksRequestSchema>;
export type RecentTracks = z.infer<typeof recentTracksSchema>;
export type UserGetRecentTracksResponse = z.infer<typeof userGetRecentTracksResponseSchema>;
export type UserGetTopAlbumsRequest = z.infer<typeof userGetTopAlbumsRequestSchema>;
export type TopAlbums = z.infer<typeof topAlbumsSchema>;
export type UserGetTopAlbumsResponse = z.infer<typeof userGetTopAlbumsResponseSchema>;
export type UserGetTopArtistsRequest = z.infer<typeof userGetTopArtistsRequestSchema>;
export type TopArtists = z.infer<typeof topArtistsSchema>;
export type UserGetTopArtistsResponse = z.infer<typeof userGetTopArtistsResponseSchema>;
export type UserGetTopTagsRequest = z.infer<typeof userGetTopTagsRequestSchema>;
export type TopTags = z.infer<typeof topTagsSchema>;
export type UserGetTopTagsResponse = z.infer<typeof userGetTopTagsResponseSchema>;
export type UserGetTopTracksRequest = z.infer<typeof userGetTopTracksRequestSchema>;
export type TopTracks = z.infer<typeof topTracksSchema>;
export type UserGetTopTracksResponse = z.infer<typeof userGetTopTracksResponseSchema>;
export type UserGetWeeklyAlbumChartRequest = z.infer<typeof userGetWeeklyAlbumChartRequestSchema>;
export type WeeklyAlbumChartAttr = z.infer<typeof weeklyAlbumChartAttrSchema>;
export type WeeklyAlbumChart = z.infer<typeof weeklyAlbumChartSchema>;
export type UserGetWeeklyAlbumChartResponse = z.infer<typeof userGetWeeklyAlbumChartResponseSchema>;
export type UserGetWeeklyArtistChartRequest = z.infer<typeof userGetWeeklyArtistChartRequestSchema>;
export type WeeklyArtistChart = z.infer<typeof weeklyArtistChartSchema>;
export type UserGetWeeklyArtistChartResponse = z.infer<typeof userGetWeeklyArtistChartResponseSchema>;
export type UserGetWeeklyChartListRequest = z.infer<typeof userGetWeeklyChartListRequestSchema>;
export type WeeklyChartList = z.infer<typeof weeklyChartListSchema>;
export type UserGetWeeklyChartListResponse = z.infer<typeof userGetWeeklyChartListResponseSchema>;
export type UserGetWeeklyTrackChartRequest = z.infer<typeof userGetWeeklyTrackChartRequestSchema>;
export type WeeklyTrackChart = z.infer<typeof weeklyTrackChartSchema>;
export type UserGetWeeklyTrackChartResponse = z.infer<typeof userGetWeeklyTrackChartResponseSchema>;
//# sourceMappingURL=user.schemas.d.ts.map