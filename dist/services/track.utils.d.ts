import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js';
export declare const parsePostParamsTrack: (config: LastFmConfig, params: TrackScrobbleRequest) => {
    api_sig: string;
};
export declare const parsePostParamsBatchTrack: (config: LastFmConfig, { tracks, sk: skParam }: BatchTracksScrobbleRequest) => string;
export declare const batchFetcher: <T = unknown>(config: LastFmConfig, { body }: {
    body: string;
}) => Promise<T>;
//# sourceMappingURL=track.utils.d.ts.map