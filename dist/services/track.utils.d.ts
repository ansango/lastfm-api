import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.types.js';
export declare const parsePostParamsTrack: (config: LastFmConfig, params: TrackScrobbleRequest) => {
    api_sig: string;
    artist: import("./base.types.js").ArtistName;
    track: import("./base.types.js").TrackName;
    timestamp: string;
    sk: string;
    album?: import("./base.types.js").AlbumName;
};
export declare const parsePostParamsBatchTrack: (config: LastFmConfig, { tracks, sk }: BatchTracksScrobbleRequest) => string;
export declare const batchFetcher: (config: LastFmConfig, { body }: {
    body: string;
}) => Promise<boolean>;
//# sourceMappingURL=track.utils.d.ts.map