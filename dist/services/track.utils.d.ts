import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js';
export declare const parsePostParamsTrack: (config: LastFmConfig, params: TrackScrobbleRequest) => {
    api_sig: string;
    artist: string;
    track: string;
    timestamp: string;
    sk: string;
    album?: string | undefined;
};
export declare const parsePostParamsBatchTrack: (config: LastFmConfig, { tracks, sk }: BatchTracksScrobbleRequest) => string;
export declare const batchFetcher: (config: LastFmConfig, { body }: {
    body: string;
}) => Promise<boolean>;
//# sourceMappingURL=track.utils.d.ts.map