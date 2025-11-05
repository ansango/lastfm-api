# lastfm-client-ts

[![NPM Version](https://img.shields.io/npm/v/lastfm-client-ts.svg?branch=main)](https://www.npmjs.com/package/lastfm-client-ts)
[![Downloads Per Week](https://img.shields.io/npm/dw/lastfm-client-ts.svg?color=blue)](https://www.npmjs.com/package/lastfm-client-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A universal Last.fm API client for Node.js and Browser, written in TypeScript.

## Features

- ✅ **Universal**: Works in Node.js (≥20.0.0) and Browser
- ✅ **TypeScript**: Full type safety with comprehensive type definitions
- ✅ **ESM**: Modern ES modules with tree-shaking support
- ✅ **Flexible**: Global configuration or per-instance configuration
- ✅ **Modular**: Import only what you need
- ✅ **Zero Dependencies**: Only `js-md5` for API signatures

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Using the Client Class](#using-the-client-class)
  - [Using Global Configuration](#using-global-configuration)
  - [Using Individual Services](#using-individual-services)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install lastfm-client-ts
```

**Requirements:**
- Node.js ≥ 20.0.0 (for native fetch support)
- Modern browsers with fetch API support

## Quick Start

```typescript
import { LastFmClient } from 'lastfm-client-ts';

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
import { LastFmClient } from 'lastfm-client-ts';

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
```

### Using Global Configuration

Set configuration globally and reuse it across multiple client instances:

```typescript
import { setGlobalConfig, createClient } from 'lastfm-client-ts';

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
import { createUserService } from 'lastfm-client-ts/user';
import type { UserGetInfoRequest } from 'lastfm-client-ts/user';

const userService = createUserService({
  apiKey: 'YOUR_API_KEY'
});

const params: UserGetInfoRequest = { user: 'ansango' };
const userInfo = await userService.getInfo(params);
```

```typescript
// Import multiple services
import { createAlbumService } from 'lastfm-client-ts/album';
import { createTrackService } from 'lastfm-client-ts/track';

const config = { apiKey: 'YOUR_API_KEY' };

const albumService = createAlbumService(config);
const trackService = createTrackService(config);

const albums = await albumService.search({ album: 'Abbey Road' });
const tracks = await trackService.search({ track: 'Come Together' });
```

**Available service imports:**
- `lastfm-client-ts/user`
- `lastfm-client-ts/album`
- `lastfm-client-ts/artist`
- `lastfm-client-ts/track`
- `lastfm-client-ts/tag`
- `lastfm-client-ts/chart`
- `lastfm-client-ts/geo`
- `lastfm-client-ts/library`
- `lastfm-client-ts/auth`

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
import { createClient } from 'lastfm-client-ts';

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

## API Reference

### Client

The main client class with all services:

```typescript
class LastFmClient {
  user: UserService;
  album: AlbumService;
  artist: ArtistService;
  track: TrackService;
  tag: TagService;
  chart: ChartService;
  geo: GeoService;
  library: LibraryService;
  auth: AuthService;
  
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

Each service provides methods for interacting with specific Last.fm API endpoints:

- **UserService**: User-related methods (getInfo, getTopArtists, getRecentTracks, etc.)
- **AlbumService**: Album methods (getInfo, search, getTags, etc.)
- **ArtistService**: Artist methods (getInfo, getSimilar, getTopAlbums, etc.)
- **TrackService**: Track methods (getInfo, search, scrobble, etc.)
- **TagService**: Tag methods (getInfo, getTopArtists, getTopTracks, etc.)
- **ChartService**: Chart methods (getTopArtists, getTopTracks, etc.)
- **GeoService**: Geographic methods (getTopArtists, getTopTracks by country)
- **LibraryService**: Library methods (getArtists, etc.)
- **AuthService**: Authentication methods (getSession, etc.)

## TypeScript Support

The library is fully typed with comprehensive TypeScript definitions:

```typescript
import { LastFmClient } from 'lastfm-client-ts';
import type {
  UserGetInfoRequest,
  UserGetInfoResponse,
  AlbumSearchRequest,
  AlbumSearchResponse
} from 'lastfm-client-ts';

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
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) © [Anibal Santos](https://github.com/ansango)
