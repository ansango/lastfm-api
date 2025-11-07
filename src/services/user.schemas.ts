import { z } from "zod";
import {
  ageSchema,
  albumCountSchema,
  albumNameSchema,
  artistCountSchema,
  artistNameSchema,
  bootstrapSchema,
  countSchema,
  countrySchema,
  datePropSchema,
  durationSchema,
  fromSchema,
  genderSchema,
  imageSchema,
  limitSchema,
  mbidSchema,
  pageSchema,
  periodSchema,
  playcountSchema,
  playlistsSchema,
  rankSchema,
  realNameSchema,
  subscriberSchema,
  tagNameSchema,
  textSchema,
  toSchema,
  totalPagesSchema,
  totalSchema,
  trackCountSchema,
  trackNameSchema,
  typeSchema,
  unixtimeSchema,
  urlSchema,
  userNameSchema,
} from "./schemas/index.js";

// Response schemas
export const userGetFriendsResponseSchema = z.record(z.string(), z.any());

// Request schemas
export const userGetFriendsRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const userGetInfoRequestSchema = z.object({
    user: userNameSchema
});

/**
 * User
 * @see https://www.last.fm/api/show/user.getInfo
 */
export const userSchema = z.object({
    name: userNameSchema,
    age: ageSchema,
    subscriber: subscriberSchema,
    realname: realNameSchema,
    bootstrap: bootstrapSchema,
    playcount: playcountSchema,
    artist_count: artistCountSchema,
    playlists: playlistsSchema,
    track_count: trackCountSchema,
    album_count: albumCountSchema,
    image: z.array(imageSchema),
    registered: z.object({
        unixtime: unixtimeSchema,
        "#text": z.number()
    }),
    country: countrySchema,
    gender: genderSchema,
    url: urlSchema,
    type: typeSchema
});

export const userGetInfoResponseSchema = z.object({
    user: userSchema
});

export const userGetLovedTracksRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const lovedTracksSchema = z.object({
    track: z.array(z.object({
        artist: z.object({
            name: artistNameSchema,
            mbid: mbidSchema,
            url: urlSchema
        }),
        date: datePropSchema,
        name: trackNameSchema,
        mbid: mbidSchema,
        url: urlSchema,
        image: z.array(imageSchema)
    })),
    "@attr": z.object({
        user: userNameSchema,
        totalPages: totalPagesSchema,
        pages: pageSchema,
        perPages: pageSchema,
        total: totalSchema
    })
});

export const userGetLovedTracksResponseSchema = z.object({
    lovedtracks: lovedTracksSchema
});

export const userGetRecentTracksRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
    from: fromSchema.optional(),
    to: toSchema.optional()
});

export const recentTracksSchema = z.object({
    track: z.array(z.object({
        artist: z.object({
            name: artistNameSchema,
            mbid: mbidSchema,
            "#text": artistNameSchema
        }),
        album: z.object({
            mbid: mbidSchema,
            "#text": albumNameSchema
        }),
        date: datePropSchema.optional(),
        name: trackNameSchema,
        mbid: mbidSchema,
        url: urlSchema,
        image: z.array(imageSchema),
        "@attr": z.object({
            nowplaying: z.boolean()
        }).optional()
    })),
    "@attr": z.object({
        user: userNameSchema,
        totalPages: totalPagesSchema,
        pages: pageSchema,
        perPages: pageSchema,
        total: totalSchema
    })
});

export const userGetRecentTracksResponseSchema = z.object({
    recenttracks: recentTracksSchema
});

export const userGetTopAlbumsRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
    period: periodSchema.optional()
});

export const topAlbumsSchema = z.object({
    album: z.array(z.object({
        artist: z.object({
            name: artistNameSchema,
            mbid: mbidSchema,
            url: urlSchema
        }),
        image: z.array(imageSchema),
        mbid: mbidSchema,
        url: urlSchema,
        playcount: playcountSchema,
        name: albumNameSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        user: userNameSchema,
        totalPages: totalPagesSchema,
        pages: pageSchema,
        perPages: pageSchema,
        total: totalSchema
    })
});

export const userGetTopAlbumsResponseSchema = z.object({
    topalbums: topAlbumsSchema
});

export const userGetTopArtistsRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
    period: periodSchema.optional()
});

export const topArtistsSchema = z.object({
    artist: z.array(z.object({
        image: z.array(imageSchema),
        mbid: mbidSchema,
        name: artistNameSchema,
        playcount: playcountSchema,
        url: urlSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        user: userNameSchema,
        totalPages: totalPagesSchema,
        pages: pageSchema,
        perPages: pageSchema,
        total: totalSchema
    })
});

export const userGetTopArtistsResponseSchema = z.object({
    topartists: topArtistsSchema
});

export const userGetTopTagsRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const topTagsSchema = z.object({
    tag: z.array(z.object({
        name: tagNameSchema,
        url: urlSchema,
        count: countSchema
    })),
    "@attr": z.object({
        user: userNameSchema
    })
});

export const userGetTopTagsResponseSchema = z.object({
    toptags: topTagsSchema
});

export const userGetTopTracksRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional(),
    period: periodSchema.optional()
});

export const topTracksSchema = z.object({
    track: z.array(z.object({
        mbid: mbidSchema,
        name: trackNameSchema,
        image: z.array(imageSchema),
        artist: z.object({
            name: artistNameSchema,
            mbid: mbidSchema,
            url: urlSchema
        }),
        url: urlSchema,
        duration: durationSchema,
        playcount: playcountSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        user: userNameSchema,
        totalPages: totalPagesSchema,
        pages: pageSchema,
        perPages: pageSchema,
        total: totalSchema
    })
});

export const userGetTopTracksResponseSchema = z.object({
    toptracks: topTracksSchema
});

export const userGetWeeklyAlbumChartRequestSchema = z.object({
    user: userNameSchema,
    from: fromSchema.optional(),
    to: toSchema.optional()
});

export const weeklyAlbumChartAttrSchema = z.object({
    from: fromSchema,
    to: toSchema,
    user: userNameSchema
});

export const weeklyAlbumChartSchema = z.object({
    album: z.array(z.object({
        artist: z.object({
            mbid: mbidSchema,
            "#text": textSchema
        }),
        mbid: mbidSchema,
        url: urlSchema,
        name: albumNameSchema,
        playcount: playcountSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        from: fromSchema,
        user: userNameSchema,
        to: toSchema
    })
});

export const userGetWeeklyAlbumChartResponseSchema = z.object({
    weeklyalbumchart: weeklyAlbumChartSchema
});

export const userGetWeeklyArtistChartRequestSchema = z.object({
    user: userNameSchema,
    from: fromSchema.optional(),
    to: toSchema.optional()
});

export const weeklyArtistChartSchema = z.object({
    artist: z.array(z.object({
        mbid: mbidSchema,
        url: urlSchema,
        name: artistNameSchema,
        playcount: playcountSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        user: userNameSchema,
        to: toSchema,
        from: fromSchema
    })
});

export const userGetWeeklyArtistChartResponseSchema = z.object({
    weeklyartistchart: weeklyArtistChartSchema
});

export const userGetWeeklyChartListRequestSchema = z.object({
    user: userNameSchema
});

export const weeklyChartListSchema = z.object({
    chart: z.array(z.object({
        "#text": textSchema,
        from: fromSchema,
        to: toSchema
    }))
});

export const userGetWeeklyChartListResponseSchema = z.object({
    weeklychartlist: weeklyChartListSchema
});

export const userGetWeeklyTrackChartRequestSchema = z.object({
    user: userNameSchema,
    from: fromSchema.optional(),
    to: toSchema.optional()
});

export const weeklyTrackChartSchema = z.object({
    track: z.array(z.object({
        artist: z.object({
            mbid: mbidSchema,
            "#text": textSchema
        }),
        image: z.array(imageSchema),
        mbid: mbidSchema,
        url: urlSchema,
        name: trackNameSchema,
        playcount: playcountSchema,
        "@attr": z.object({
            rank: rankSchema
        })
    })),
    "@attr": z.object({
        user: userNameSchema,
        to: toSchema,
        from: fromSchema
    })
});

export const userGetWeeklyTrackChartResponseSchema = z.object({
    weeklytrackchart: weeklyTrackChartSchema
});

// Inferred types
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
