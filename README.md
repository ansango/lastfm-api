# @ansango/lastfm-api

[![NPM Version](https://img.shields.io/npm/v/%40ansango%2Flastfm-api.svg?branch=main)](https://www.npmjs.com/package/@ansango/lastfm-api)
[![Downloads Per Week](https://img.shields.io/npm/dw/%40ansango%2Flastfm-api.svg?color=blue)](https://www.npmjs.com/package/@ansango/lastfm-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A universal Last.fm API client for Node.js and Browser, written in TypeScript.

> [!NOTE]
> This package was previously published as `lastfm-client-ts`. The legacy package remains
> installable but is deprecated. Migrate by installing `@ansango/lastfm-api` and updating the
> package specifier in your imports; the exported API and subpaths are unchanged.

## Features

- ✅ **Universal**: Works in Node.js (≥20.0.0) and Browser
- ✅ **Complete coverage**: All 56 canonical Last.fm API methods across 9 namespaces
- ✅ **Insights & Analytics Engine**: 20 high-level derived analytical views (Shannon diversity, enriched Now Playing, diurnal histograms, binge runs, ranking diffs, new discoveries, 2D mood classification, personality archetypes, obscurity scores, streaks, heatmaps, album habits, genre breakdown & evolution, smart recommendations, bridge artists, and user/group comparison)
- ✅ **Reports & Wrapped Engine**: Custom Year-in-Review, historical milestone projections, and monthly digests
- ✅ **Smart Playlists Generator**: Algorithmic playlist generation (heavy rotation, time capsule, deep cuts, discovery radar) with M3U and CSV exports
- ✅ **Bulk Data Exporter & Backup**: Resilient scrobble, loved tracks, and library catalog backup with UTS checkpointing and ListenBrainz/JSONL/CSV formats
- ✅ **Async Pagination & Streaming**: Native `for await` streaming iterators (`iterateItems`, `collectAll`, `iteratePages`) with automatic rate limiting and boundary controls
- ✅ **TypeScript**: Full type safety with comprehensive type definitions
- ✅ **Zod Schemas**: Runtime validation schemas for all types
- ✅ **ESM**: Modern ES modules with tree-shaking support
- ✅ **Flexible**: Global configuration or per-instance configuration
- ✅ **Modular**: Import only what you need
- ✅ **Minimal Dependencies**: Only `js-md5` for API signatures and `zod` for runtime validation

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Using the Client Class](#using-the-client-class)
  - [Using Global Configuration](#using-global-configuration)
  - [Using Individual Services](#using-individual-services)
- [Zod Schema Validation](#zod-schema-validation)
- [Insights & Analytics Engine](#insights--analytics-engine)
- [Reports & Wrapped Engine](#reports--wrapped-engine)
- [Smart Playlists Generator](#smart-playlists-generator)
- [Bulk Data Exporter & Backup](#bulk-data-exporter--backup)
- [Async Pagination & Streaming Iterators](#async-pagination--streaming-iterators)
- [Environment Variables](#environment-variables)
- [Authentication & Scrobbling](#authentication--scrobbling)
- [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @ansango/lastfm-api
```

**Requirements:**
- Node.js ≥ 20.0.0 (for native fetch support)
- Modern browsers with fetch API support

## Quick Start

```typescript
import { LastFmClient } from '@ansango/lastfm-api';

// Create a client instance
const client = new LastFmClient({
  apiKey: 'YOUR_API_KEY'
});

// Fetch user information
const userInfo = await client.user.getInfo({ user: 'ansango' });
console.log(userInfo);

// Search for albums
const albums = await client.album.search({ album: 'Believe' });
console.log(albums);
```

## Usage

### Using the Client Class (Recommended)

The client class provides access to all API services in one place:

```typescript
import { LastFmClient } from '@ansango/lastfm-api';

const client = new LastFmClient({
  apiKey: 'YOUR_API_KEY',
  sharedSecret: 'YOUR_SHARED_SECRET', // Optional, required for authenticated methods
  sessionKey: 'USER_SESSION_KEY'      // Optional, required for user-specific methods
});

// User service
const userInfo = await client.user.getInfo({ user: 'ansango' });
const topArtists = await client.user.getTopArtists({ user: 'ansango', period: '7day' });

// Album service
const albumInfo = await client.album.getInfo({ artist: 'Cher', album: 'Believe' });
const albumSearch = await client.album.search({ album: 'Believe', limit: 10 });

// Artist service
const artistInfo = await client.artist.getInfo({ artist: 'Radiohead' });
const similarArtists = await client.artist.getSimilar({ artist: 'Radiohead' });

// Track service
const trackInfo = await client.track.getInfo({ artist: 'The Beatles', track: 'Yesterday' });
const trackSearch = await client.track.search({ track: 'Yesterday', limit: 10 });

// Scrobble (auth required — `sk` is auto-injected from `config.sessionKey`)
const scrobbleResult = await client.track.scrobble({
  artist: 'Cher',
  track: 'Believe',
  timestamp: Math.floor(Date.now() / 1000),
});

// Batch scrobble (max 50 tracks per call)
const batchResult = await client.track.scrobbleMany({
  tracks: [
    { artist: 'Cher', track: 'Believe', timestamp: 1700000000 },
    { artist: 'Cher', track: 'If You Believe', timestamp: 1700000600 },
  ],
});

// Chart service
const topChartArtists = await client.chart.getTopArtists();
const topChartTracks = await client.chart.getTopTracks();

// Tag service
const tagInfo = await client.tag.getInfo({ tag: 'rock' });
const topTagArtists = await client.tag.getTopArtists({ tag: 'rock' });

// Geo service
const topArtistsByCountry = await client.geo.getTopArtists({ country: 'spain' });

// Library service
const libraryArtists = await client.library.getArtists({ user: 'ansango' });

// Auth service (for scrobbling and authenticated methods)
const session = await client.auth.getSession({ token: 'AUTH_TOKEN' });
// Request an auth token (signed GET, no sk)
const { token, authUrl } = await client.auth.getToken();

// Insights & analytics engine
const summary = await client.insights.getSummary({ user: 'ansango', period: '7day' });
const nowPlaying = await client.insights.getNowPlaying({ user: 'ansango' });
const mood = await client.insights.getMood({ user: 'ansango', period: '1month' });
const personality = await client.insights.getPersonality({ user: 'ansango' });
const comparison = await client.insights.compareUsers({ userA: 'ansango', userB: 'friend' });

// Now-playing and tag/love mutations (all require an authenticated session)
await client.track.updateNowPlaying({
  artist: 'Cher',
  track: 'Believe',
  album: 'Believe',
  duration: 240
});

await client.track.addTags({
  artist: 'Cher',
  track: 'Believe',
  tags: ['favorites', '90s']
});
await client.track.love({ artist: 'Cher', track: 'Believe' });

await client.album.addTags({ artist: 'Cher', album: 'Believe', tags: ['favorites'] });
await client.artist.addTags({ artist: 'Cher', tags: ['favorites'] });
```

### Using Global Configuration

Set configuration globally and reuse it across multiple client instances:

```typescript
import { setGlobalConfig, createClient } from '@ansango/lastfm-api';

// Set global configuration once
setGlobalConfig({
  apiKey: process.env.LASTFM_API_KEY!,
  sharedSecret: process.env.LASTFM_SHARED_SECRET
});

// Create clients without passing config
const client1 = createClient();
const client2 = createClient();

// Both clients use the same global configuration
const user1 = await client1.user.getInfo({ user: 'user1' });
const user2 = await client2.user.getInfo({ user: 'user2' });
```

### Using Individual Services

Import only the services you need for better tree-shaking:

```typescript
// Import only the user service
import { createUserService } from '@ansango/lastfm-api/user';
import type { UserGetInfoRequest } from '@ansango/lastfm-api/user';

const userService = createUserService({
  apiKey: 'YOUR_API_KEY'
});

const params: UserGetInfoRequest = { user: 'ansango' };
const userInfo = await userService.getInfo(params);
```

```typescript
// Import multiple services
import { createAlbumService } from '@ansango/lastfm-api/album';
import { createTrackService } from '@ansango/lastfm-api/track';

const config = { apiKey: 'YOUR_API_KEY' };

const albumService = createAlbumService(config);
const trackService = createTrackService(config);

const albums = await albumService.search({ album: 'Abbey Road' });
const tracks = await trackService.search({ track: 'Come Together' });
```

**Available service imports:**
- `@ansango/lastfm-api/core` (canonical methods + pagination)
- `@ansango/lastfm-api/user`
- `@ansango/lastfm-api/album`
- `@ansango/lastfm-api/artist`
- `@ansango/lastfm-api/track`
- `@ansango/lastfm-api/tag`
- `@ansango/lastfm-api/chart`
- `@ansango/lastfm-api/geo`
- `@ansango/lastfm-api/library`
- `@ansango/lastfm-api/auth`
- `@ansango/lastfm-api/insights`
- `@ansango/lastfm-api/reports`
- `@ansango/lastfm-api/playlists`
- `@ansango/lastfm-api/exporter`

## Zod Schema Validation

The library includes automatically generated Zod schemas for runtime validation. These schemas mirror all TypeScript types and can be used to validate API responses or user input at runtime.

### Importing Schemas

Schemas are available through modular imports, following the same pattern as the services:

```typescript
import { userGetInfoRequestSchema, userGetInfoResponseSchema } from '@ansango/lastfm-api/user/schemas';
import { albumSearchRequestSchema } from '@ansango/lastfm-api/album/schemas';
import { trackGetInfoResponseSchema } from '@ansango/lastfm-api/track/schemas';
import { insightsSummaryResponseSchema } from '@ansango/lastfm-api/insights/schemas';
import { reportsWrappedResponseSchema } from '@ansango/lastfm-api/reports/schemas';
import { playlistsGenerateResponseSchema } from '@ansango/lastfm-api/playlists/schemas';
import { exporterScrobblesResponseSchema } from '@ansango/lastfm-api/exporter/schemas';
```

### Usage Example

```typescript
import { userGetInfoRequestSchema, userGetInfoResponseSchema } from '@ansango/lastfm-api/user/schemas';

// Validate request parameters
const params = { user: 'ansango' };
const validatedParams = userGetInfoRequestSchema.parse(params);

// Validate API response
const response = await fetch(`https://ws.audioscrobbler.com/2.0/...`);
const data = await response.json();
const validatedData = userGetInfoResponseSchema.parse(data);

// Safe parsing (doesn't throw)
const result = userGetInfoResponseSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

**Available schema imports:**
- `@ansango/lastfm-api/core/schemas`
- `@ansango/lastfm-api/user/schemas`
- `@ansango/lastfm-api/album/schemas`
- `@ansango/lastfm-api/artist/schemas`
- `@ansango/lastfm-api/track/schemas`
- `@ansango/lastfm-api/tag/schemas`
- `@ansango/lastfm-api/chart/schemas`
- `@ansango/lastfm-api/geo/schemas`
- `@ansango/lastfm-api/library/schemas`
- `@ansango/lastfm-api/auth/schemas`
- `@ansango/lastfm-api/insights/schemas`
- `@ansango/lastfm-api/reports/schemas`
- `@ansango/lastfm-api/playlists/schemas`
- `@ansango/lastfm-api/exporter/schemas`
- `@ansango/lastfm-api/schemas` (base types like `imageSchema`, `datePropSchema`, etc.)

## Insights & Analytics Engine

The package includes a comprehensive, built-in analytics engine providing 20 high-level derived views and statistical metrics computed over Last.fm data:

```typescript
import { createClient } from '@ansango/lastfm-api';

const client = createClient();

// 1. Summary & Shannon Diversity
const summary = await client.insights.getSummary({ user: 'ansango', period: '7day' });
console.log(`Total Scrobbles: ${summary.totalScrobbles}, Normalized Diversity: ${summary.diversity?.normalized}`);

// 2. Enriched Now Playing with Artist Biography and Similar Artists
const nowPlaying = await client.insights.getNowPlaying({ user: 'ansango', similarLimit: 3 });

// 3. Diurnal & Weekday Histogram
const histogram = await client.insights.getHoursHistogram({ user: 'ansango', sinceDays: 30 });
console.log(`Peak Hour: ${histogram.peakHour}:00, Night Share: ${(histogram.nightShare * 100).toFixed(0)}%`);

// 4. Binge Listening Streak Detection
const binges = await client.insights.getBinges({ user: 'ansango', minLength: 3, maxGapSeconds: 1800 });

// 5. Ranking Trends Differentials (Risers, Fallers, Newcomers, Departures)
const trends = await client.insights.getTrends({
  user: 'ansango',
  target: 'artists',
  currentPeriod: '7day',
  previousPeriod: '1month'
});

// 6. New Artist Discoveries
const discoveries = await client.insights.getDiscoveries({ user: 'ansango', windowDays: 7 });

// 7. 2D Mood Classification (Energy vs. Valence)
const mood = await client.insights.getMood({ user: 'ansango', period: '1month' });
console.log(`Mood: ${mood.label} (Energy: ${mood.axes.energy}, Valence: ${mood.axes.valence})`);

// 8. Listener Personality Archetype
const personality = await client.insights.getPersonality({ user: 'ansango' });
console.log(`Archetype: ${personality.archetype.emoji} ${personality.archetype.name} - ${personality.archetype.blurb}`);

// 9. User-to-User Taste Clash (Jaccard Similarity)
const comparison = await client.insights.compareUsers({ userA: 'ansango', userB: 'friend' });
console.log(`Taste Compatibility: ${comparison.compatibilityScore}% (Jaccard: ${comparison.jaccard})`);

// 10. Obscurity & Hipster Score (Hidden Gems & Mainstream Anchors)
const obscurity = await client.insights.getObscurityScore({ user: 'ansango', limit: 20 });
console.log(`Score: ${obscurity.obscurityScore}/100 (${obscurity.category})`);

// 11. Forgotten Favorites (Revival Candidates)
const forgotten = await client.insights.getForgottenFavorites({ user: 'ansango', historicPeriod: '12month', recentPeriod: '1month' });

// 12. Listening Obsession Episodes
const obsessions = await client.insights.getObsessions({ user: 'ansango', windowSize: 20, thresholdRatio: 0.35 });

// 13. Consecutive Daily Streaks & Dry Spells
const streaks = await client.insights.getListeningStreaks({ user: 'ansango' });
console.log(`Longest Streak: ${streaks.longestStreakDays} days`);

// 14. 365-Day Daily Heatmap
const heatmap = await client.insights.getListeningHeatmap({ user: 'ansango', days: 90 });

// 15. Album Habits & Cohesion Score (Album Purist vs Playlist Shuffler)
const habits = await client.insights.getAlbumHabits({ user: 'ansango', minSessionTracks: 3 });
console.log(`Cohesion: ${habits.cohesionScore}% (${habits.profile})`);

// 16. Genre Breakdown with HHI Concentration Index
const genres = await client.insights.getGenreBreakdown({ user: 'ansango', period: 'overall' });
console.log(`Specialization: ${genres.specializationLevel} (HHI: ${genres.hhiIndex})`);

// 17. Genre Evolution & Temporal Shifts (Rising, Fading, New)
const evolution = await client.insights.getGenreEvolution({ user: 'ansango', currentPeriod: '1month', previousPeriod: '12month' });

// 18. Smart Similarity Graph Recommendations
const recs = await client.insights.getSmartRecommendations({ user: 'ansango', seedLimit: 5, limit: 10 });

// 19. Bridge Artists Connecting Two Disparate Genres
const bridges = await client.insights.getBridgeArtists({ tagA: 'post-punk', tagB: 'electronic' });

// 20. Multi-User Taste Group Comparison (Consensus & Outlier Detection)
const group = await client.insights.compareTasteGroup({ users: ['alice', 'bob', 'carol'], period: 'overall' });
console.log(`Group Average Compatibility: ${group.groupAverageCompatibility}%`);
```

## Reports & Wrapped Engine

Generate shareable annual recaps, historical milestones, and monthly digests:

```typescript
import { createClient } from '@ansango/lastfm-api';

const client = createClient();

// 1. Year in Review / Wrapped
const wrapped = await client.reports.getWrapped({ user: 'ansango', year: 2024 });
console.log(`Top Artist of the Year: ${wrapped.topArtists[0].name}`);
console.log(`Summer Anthem: ${wrapped.seasons.summer.topTrack} by ${wrapped.seasons.summer.topArtist}`);
console.log(`Busiest Day: ${wrapped.busiestDay.date} (${wrapped.busiestDay.scrobbles} plays)`);

// 2. Scrobble Milestones Tracker & Projection
const milestones = await client.reports.getMilestones({ user: 'ansango', targets: [1000, 5000, 10000, 50000] });
console.log(`Next milestone: ${milestones.nextMilestone.target} scrobbles (ETA: ${milestones.nextMilestone.projectedDate})`);

// 3. Monthly Comparative Digest
const digest = await client.reports.getMonthlyDigest({ user: 'ansango', year: 2024, month: 2 });
console.log(`Growth vs previous month: ${digest.growthPercentage}%`);
```

## Smart Playlists Generator

Algorithmic playlist creation with direct export to standard formats:

```typescript
import { createClient } from '@ansango/lastfm-api';

const client = createClient();

// Generate smart playlist (time-capsule, deep-cuts, heavy-rotation, discovery-radar)
const playlist = await client.playlists.generate({
  user: 'ansango',
  mode: 'time-capsule',
  limit: 25,
});

// Pre-rendered standard formats:
console.log(playlist.formats.m3u); // Standard #EXTM3U playlist file content
console.log(playlist.formats.csv); // CSV spreadsheet
console.log(playlist.formats.spotifyQueries); // Spotify search query list
```

## Bulk Data Exporter & Backup

Resilient scrobble history export with checkpointing and multiple output formats:

```typescript
import { createClient } from '@ansango/lastfm-api';

const client = createClient();

// Export scrobbles with ListenBrainz / JSONL / CSV formatting & checkpointing
const exportData = await client.exporter.exportScrobbles({
  user: 'ansango',
  format: 'listenbrainz', // 'json' | 'jsonl' | 'csv' | 'listenbrainz'
  limit: 1000,
});

// Resumable checkpoint timestamp
console.log(`Resume from: ${exportData.nextCheckpointUts}`);
```

## Async Pagination & Streaming Iterators

Stream large Last.fm datasets seamlessly using standard `for await` loops:

```typescript
import { createClient, iterateItems } from '@ansango/lastfm-api';

const client = createClient();

for await (const track of iterateItems(
  (params) => client.user.getRecentTracks(params),
  (res) => ({
    items: res.recenttracks?.track ?? [],
    totalPages: Number(res.recenttracks?.['@attr']?.totalPages ?? 1),
    currentPage: Number(res.recenttracks?.['@attr']?.page ?? 1),
  }),
  { user: 'ansango', limit: 200 },
  { maxItems: 1000 }
)) {
  console.log(`${track.name} - ${track.artist['#text']}`);
}
```

## Environment Variables

In Node.js environments, the client automatically loads configuration from environment variables:

```bash
# .env file
LASTFM_API_KEY=your_api_key_here
LASTFM_SHARED_SECRET=your_shared_secret_here
LASTFM_SESSION_KEY=user_session_key_here

# Optional: Custom base URL
LASTFM_BASE_URL=https://ws.audioscrobbler.com/2.0/
```

```typescript
// Configuration is loaded automatically from process.env
import { createClient } from '@ansango/lastfm-api';

const client = createClient(); // Uses environment variables
```

**Browser Usage:**

In browser environments, pass configuration explicitly or use your bundler's environment variable system:

```typescript
// Vite
const client = new LastFmClient({
  apiKey: import.meta.env.VITE_LASTFM_API_KEY
});

// Webpack
const client = new LastFmClient({
  apiKey: process.env.REACT_APP_LASTFM_API_KEY
});
```

## Authentication & Scrobbling

Methods that mutate user state require an authenticated session. The full list of write methods is:

- `auth.getSession`, `auth.getToken`
- `track.scrobble`, `track.updateNowPlaying`
- `track.addTags`, `track.removeTag`, `track.love`, `track.unlove`
- `album.addTags`, `album.removeTag`
- `artist.addTags`, `artist.removeTag`

The browser flow below works for every self-service API key — there is no mobile flow in this package anymore.

### Browser flow (recommended — works for all self-service keys)

The browser flow is the canonical Last.fm auth path and works with the API key every self-service user gets from <https://www.last.fm/api/account/create>.

```typescript
import { LastFmClient } from '@ansango/lastfm-api';

// 1. Get a request token (signed GET, no session needed).
const client = new LastFmClient({
  apiKey: process.env.LASTFM_API_KEY!,
  sharedSecret: process.env.LASTFM_SHARED_SECRET!,
});
const { token } = await client.auth.getToken();

// 2. Direct the user to authorize the token in a browser:
//    https://www.last.fm/api/auth/?api_key=<KEY>&token=<token>
//    After authorizing, Last.fm redirects to the callback URL configured
//    on the API account (the token appears in the URL).

// 3. Exchange the authorized token for a session key.
const { session } = await client.auth.getSession({ token });
const sessionKey = session.key; // pass this to write methods
```

### Callback URL setup (one-time, in your Last.fm account)

Before the browser flow works end-to-end, set a callback URL on your API account at <https://www.last.fm/api/account>:

1. Open <https://www.last.fm/api/account>, find your app, click **Edit**.
2. In the **Callback URL** field, enter a URL.
3. Save.

**What to enter depends on how you'll consume the token:**

- **Manual flow (default):** any URL works. Last.fm redirects there with `?token=<token>` in the URL bar; you copy the token by hand. Examples that are valid: `http://example.com/`, `http://localhost:3000/`, even `oops`. The URL is just a destination.
- **Auto-catch flow (with a local server, e.g. `lastfm-cli`'s `--callback` flag):** set it to the URL where your local server listens. Default for the CLI is `http://127.0.0.1:8765/`. Use `127.0.0.1`, not `localhost` — Last.fm's redirect host matching is strict.

If you skip this step, the redirect after **Allow access** lands on a Last.fm error page instead of your URL, and the token is lost. You have to call `auth.getToken` again and re-authorize.

> **Note:** `auth.getMobileSession` was removed in v3.3.0. Last.fm restricts that endpoint to mobile-classified API keys, which are not exposed through the public self-service create form; the browser flow above works for every API key Last.fm issues today.

### Passing the session key to write methods

Once you have a session key, you can pass it in two ways:

- **Per-request** (`params.sk`): preferred for ad-hoc calls or one-off scripts.
- **On the `LastFmConfig`** (`sessionKey`): preferred for long-lived clients; the transport injects it into every signed call automatically.

```typescript
// Option A: session key in the config (recommended for long-lived clients).
const client = new LastFmClient({
  apiKey: process.env.LASTFM_API_KEY!,
  sharedSecret: process.env.LASTFM_SHARED_SECRET!,
  sessionKey: process.env.LASTFM_SESSION_KEY!,
});

// `sk` is auto-injected from config.sessionKey; you don't need to pass it.
await client.track.scrobble({
  artist: 'Cher',
  track: 'Believe',
  timestamp: Math.floor(Date.now() / 1000),
});

// Option B: session key per-request (preferred for ad-hoc calls).
await client.track.scrobble({
  artist: 'Cher',
  track: 'Believe',
  timestamp: Math.floor(Date.now() / 1000),
  sk: 'paste-the-session-key-here',
});
```

> **Note:** The previous method names `postTrackScrobble` and `postBatchTrackScrobble` are still available as deprecated aliases. They forward to `scrobble` and `scrobbleMany` respectively and will be removed in the next major release.

## Error Handling

API errors throw a `LastFmApiError` that carries the HTTP status and the Last.fm error code, so consumers can distinguish failures programmatically:

```typescript
import { LastFmClient, LastFmApiError } from '@ansango/lastfm-api';

try {
  await client.user.getInfo({ user: 'nonexistent_user_xyz' });
} catch (e) {
  if (e instanceof LastFmApiError) {
    console.error(`Last.fm error ${e.code}: ${e.message} (HTTP ${e.httpStatus})`);
    // e.g. "Last.fm error 14: This token has not been authorized (HTTP 401)"
  } else {
    throw e;
  }
}
```

The `code` is the numeric error code from the [Last.fm API documentation](https://www.last.fm/api/show/user.getInfo#errors) (e.g. `9` for "Invalid session key", `10` for "Invalid API key", `29` for "Rate limit exceeded").

## API Reference

### Client

The main client class with all services:

```typescript
class LastFmClient {
  core: LastFmCoreClient;
  user: UserService;
  album: AlbumService;
  artist: ArtistService;
  track: TrackService;
  tag: TagService;
  chart: ChartService;
  geo: GeoService;
  library: LibraryService;
  auth: AuthService;
  insights: InsightsService;
  reports: ReportsService;
  playlists: PlaylistsService;
  exporter: ExporterService;
  
  constructor(config?: Partial<LastFmConfig>);
  getConfig(): Readonly<LastFmConfig>;
}
```

### Configuration

```typescript
interface LastFmConfig {
  apiKey: string;           // Required: Your Last.fm API key
  sharedSecret?: string;    // Optional: Required for authenticated methods
  sessionKey?: string;      // Optional: User session key for scrobbling
  baseUrl?: string;         // Optional: API base URL (default: https://ws.audioscrobbler.com/2.0/)
}

// Configuration functions
function createConfig(options?: Partial<LastFmConfig>): LastFmConfig;
function setGlobalConfig(config: Partial<LastFmConfig>): void;
function getGlobalConfig(): LastFmConfig;
function resetGlobalConfig(): void;
```

### Services

The package covers all 56 canonical Last.fm API methods across 9 namespaces, plus 20 derived analytical methods in `InsightsService`, 3 reporting methods in `ReportsService`, 3 smart playlist methods in `PlaylistsService`, and 3 data export engines in `ExporterService` (83 total endpoints). See [docs/api-coverage.md](docs/api-coverage.md) for the full table.

- **CoreClient (`core`)**: Bundle of all 56 canonical Last.fm methods with built-in async pagination (`iterateItems`, `collectAll`, `iteratePages`)
- **UserService**: 13 methods — `getInfo`, `getFriends`, `getLovedTracks`, `getRecentTracks`, `getTopAlbums`, `getTopArtists`, `getTopTags`, `getTopTracks`, `getWeeklyAlbumChart`, `getWeeklyArtistChart`, `getWeeklyChartList`, `getWeeklyTrackChart`, `getPersonalTags`
- **AlbumService**: 6 methods — `getInfo`, `getTags`, `getTopTags`, `search`, `addTags`¹, `removeTag`¹
- **ArtistService**: 10 methods — `getInfo`, `getTags`, `getSimilar`, `getTopTags`, `getTopAlbums`, `getTopTracks`, `search`, `getCorrection`, `addTags`¹, `removeTag`¹
- **TrackService**: 12 methods — `getInfo`, `getSimilar`, `getTags`, `getTopTags`, `search`, `scrobble`¹, `getCorrection`, `addTags`¹, `removeTag`¹, `love`¹, `unlove`¹, `updateNowPlaying`¹
- **TagService**: 7 methods — `getInfo`, `getSimilar`, `getTopAlbums`, `getTopArtists`, `getTopTags`, `getTopTracks`, `getWeeklyChartList`
- **ChartService**: 3 methods — `getTopArtists`, `getTopTags`, `getTopTracks`
- **GeoService**: 2 methods — `getTopArtists`, `getTopTracks`
- **LibraryService**: 1 method — `getArtists`
- **AuthService**: 2 methods — `getSession`, `getToken` (removed `getMobileSession` in v3.3.0)
- **InsightsService**: 20 methods — `getSummary`, `getNowPlaying`, `getHoursHistogram`, `getBinges`, `getTrends`, `getDiscoveries`, `getMood`, `getPersonality`, `compareUsers`, `getObscurityScore`, `getObsessions`, `getForgottenFavorites`, `getListeningStreaks`, `getListeningHeatmap`, `getAlbumHabits`, `getGenreBreakdown`, `getGenreEvolution`, `getSmartRecommendations`, `getBridgeArtists`, `compareTasteGroup`
- **ReportsService**: 3 methods — `getWrapped`, `getMilestones`, `getMonthlyDigest`
- **PlaylistsService**: 3 methods — `generate`, `exportM3U`, `exportCsv`
- **ExporterService**: 3 methods — `exportScrobbles`, `exportLovedTracks`, `exportLibrary`

¹ Requires an authenticated session.

## TypeScript Support

The library is fully typed with comprehensive TypeScript definitions:

```typescript
import { LastFmClient } from '@ansango/lastfm-api';
import type {
  UserGetInfoRequest,
  UserGetInfoResponse,
  AlbumSearchRequest,
  AlbumSearchResponse
} from '@ansango/lastfm-api';

const client = new LastFmClient({ apiKey: 'YOUR_API_KEY' });

// Type-safe requests and responses
const userParams: UserGetInfoRequest = { user: 'ansango' };
const userInfo: UserGetInfoResponse = await client.user.getInfo(userParams);

const albumParams: AlbumSearchRequest = { album: 'Believe', limit: 10 };
const albums: AlbumSearchResponse = await client.album.search(albumParams);
```

All request parameters and response types are exported for your convenience.

## Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Scripts

```bash
# Install dependencies
bun install

# Run in development mode (watch mode)
bun run dev

# Build the project
bun run build

# Typecheck (no emit)
bun run typecheck

# Run deterministic unit tests (no network, mocked fetch)
bun run test:unit # or simply 'bun test'

# Lint (Biome — formatter + linter, single command)
bun run lint

# Auto-fix what Biome can (formatting, safe lint fixes)
bun run lint:fix

# Format only (no lint)
bun run format
bun run format:check

# Run the local interactive docs server (Hono + Scalar, see #92)
bun run tool:dev

# Clean build artifacts
bun run clean
```

## Interactive API Explorer

The repo ships with a local Hono + Scalar server under `tool/api-scalar/`
that turns the package into a fully interactive OpenAPI explorer. All 56
canonical Last.fm methods and 27 extension methods (83 total operations)
are wired declaratively into 5 collapsible sections from the package's
own Zod schemas and service functions.

```sh
bun install --cwd tool/api-scalar
cp tool/api-scalar/.env.example .env   # fill in LASTFM_API_KEY and LASTFM_SHARED_SECRET
bun run tool:dev
```

Then open <http://localhost:3000>. "Try it" calls the real Last.fm API
through the package; the shared secret and session key live in env vars,
never in the browser. See [`tool/api-scalar/README.md`](./tool/api-scalar/README.md)
for the full guide and [`#92`](https://github.com/ansango/lastfm-api/issues/92)
for the design notes.

### Testing

The test suite consists of deterministic unit tests with mocked `globalThis.fetch`:

- **`bun test`** (or **`bun run test:unit`**) — covers every method that the package implements, asserts the correct `namespace.method` routing, validates that `api_key`/`format=json` are present, and verifies that Last.fm error envelopes surface as `LastFmApiError`. They do not require an API key or any network access, and they run as part of CI on every push and pull request.
- **`inventory.test.ts`** — asserts the **56/56 canonical-method baseline** ensuring every namespace.method pair listed in the official Last.fm API index is exposed on the `LastFmClient` and callable. The per-namespace breakdown is mirrored in [docs/api-coverage.md](docs/api-coverage.md).

### Release Process

This project uses automated release scripts:

```bash
# Create a patch release (1.0.0 -> 1.0.1)
bun run release:patch

# Create a minor release (1.0.0 -> 1.1.0)
bun run release:minor

# Create a major release (1.0.0 -> 2.0.0)
bun run release:major

# Create an alpha release (1.0.0 -> 1.0.1-alpha.0)
bun run release:alpha

# Create a beta release (1.0.0 -> 1.0.1-beta.0)
bun run release:beta
```

The release script will:
- Run tests
- Build the project
- Generate changelog from commits
- Bump version in package.json
- Create git tag
- Create GitHub release
- Publish to npm

For more details, see [scripts/README.md](scripts/README.md).

## License

[MIT](LICENSE) © [Anibal Santos](https://github.com/ansango)
