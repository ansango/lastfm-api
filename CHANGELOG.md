# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-11-07

### ♻️ Code Refactoring

- convert all types to Zod schemas with inferred types ([484478d](https://github.com/ansango/lastfm-client-ts/commit/484478d))


## [2.2.1] - 2025-11-07

### 🐛 Bug Fixes

- add files field to package.json to ensure all dist files are published ([30e5cc4](https://github.com/ansango/lastfm-client-ts/commit/30e5cc4))


## [2.2.0] - 2025-11-07

### ✨ Features

- add zod schema validation support ([f0caf4a](https://github.com/ansango/lastfm-client-ts/commit/f0caf4a))

### 🔧 Chores

- update gitignore for generated files and examples ([cde4af1](https://github.com/ansango/lastfm-client-ts/commit/cde4af1))


## [2.1.0] - 2025-11-05

### ✨ Features

- **release**: add automated release workflow, scripts and docs ([cd85827](https://github.com/ansango/lastfm-client-ts/commit/cd85827))
- **rewrite**: complete v2.0.0-alpha.1 refactor — universal ESM Last.fm client ([bc6d43b](https://github.com/ansango/lastfm-client-ts/commit/bc6d43b))
- **readme**: contributing ([5d4559e](https://github.com/ansango/lastfm-client-ts/commit/5d4559e))
- **pkg**: up pkg ([0d0ef42](https://github.com/ansango/lastfm-client-ts/commit/0d0ef42))
- **readme**: adding dotenv ([65b130f](https://github.com/ansango/lastfm-client-ts/commit/65b130f))
- **readme**: basic readme ([cb467cb](https://github.com/ansango/lastfm-client-ts/commit/cb467cb))
- **pkg**: update package ([5f80e0f](https://github.com/ansango/lastfm-client-ts/commit/5f80e0f))
- **chart**: service and types ([8d3f612](https://github.com/ansango/lastfm-client-ts/commit/8d3f612))
- **build**: build geo ([9f98f98](https://github.com/ansango/lastfm-client-ts/commit/9f98f98))
- **geo**: service and types ([eadebaa](https://github.com/ansango/lastfm-client-ts/commit/eadebaa))
- **library**: service and type library ([1a89551](https://github.com/ansango/lastfm-client-ts/commit/1a89551))
- **tag**: tag service and types ([3d6de29](https://github.com/ansango/lastfm-client-ts/commit/3d6de29))
- **tag**: service tag added ([87de559](https://github.com/ansango/lastfm-client-ts/commit/87de559))
- **track**: track types and services ([f5e6363](https://github.com/ansango/lastfm-client-ts/commit/f5e6363))
- **track**: track service ([62f342c](https://github.com/ansango/lastfm-client-ts/commit/62f342c))
- **artist**: done artist ([59de841](https://github.com/ansango/lastfm-client-ts/commit/59de841))
- **typed**: fix types ([0738393](https://github.com/ansango/lastfm-client-ts/commit/0738393))
- **build**: artist service build ([a8bf981](https://github.com/ansango/lastfm-client-ts/commit/a8bf981))
- **artist**: service constructor ([02c1db0](https://github.com/ansango/lastfm-client-ts/commit/02c1db0))
- **types**: split api types ([5a90a8d](https://github.com/ansango/lastfm-client-ts/commit/5a90a8d))
- **dist**: build album done ([50ec5cb](https://github.com/ansango/lastfm-client-ts/commit/50ec5cb))
- **album**: services album ([bd509d2](https://github.com/ansango/lastfm-client-ts/commit/bd509d2))
- **primitives**: refactor primitives ([3d8a5d3](https://github.com/ansango/lastfm-client-ts/commit/3d8a5d3))
- **refactor types**: refator types user and base types ([e9d17b8](https://github.com/ansango/lastfm-client-ts/commit/e9d17b8))
- **album**: album services ([4ab012f](https://github.com/ansango/lastfm-client-ts/commit/4ab012f))
- **dist**: build dist ([c0e434e](https://github.com/ansango/lastfm-client-ts/commit/c0e434e))
- **config**: config api modules ([19bc7d9](https://github.com/ansango/lastfm-client-ts/commit/19bc7d9))
- **docs**: functions ([0896be4](https://github.com/ansango/lastfm-client-ts/commit/0896be4))
- **docs**: user docs generated ([e47c4c5](https://github.com/ansango/lastfm-client-ts/commit/e47c4c5))
- **package pub**: pub package dem ([c9d6b1d](https://github.com/ansango/lastfm-client-ts/commit/c9d6b1d))
- **reset**: reset version npm ([1f0a23f](https://github.com/ansango/lastfm-client-ts/commit/1f0a23f))
- **ignore**: npm ignore ([2d08998](https://github.com/ansango/lastfm-client-ts/commit/2d08998))
- **dist**: added dist ([329d2fb](https://github.com/ansango/lastfm-client-ts/commit/329d2fb))
- **lock**: yarn lock ([6854da4](https://github.com/ansango/lastfm-client-ts/commit/6854da4))
- **typed**: split types ([1249635](https://github.com/ansango/lastfm-client-ts/commit/1249635))
- **config**: dist and test ([c34b106](https://github.com/ansango/lastfm-client-ts/commit/c34b106))
- **fetcher**: fetcher and types req res ([be94106](https://github.com/ansango/lastfm-client-ts/commit/be94106))
- **config**: added config and method endpoints ([ac9921e](https://github.com/ansango/lastfm-client-ts/commit/ac9921e))
- **ts**: config typescript ([c1edaa4](https://github.com/ansango/lastfm-client-ts/commit/c1edaa4))
- **readme**: minimal readme added ([5264665](https://github.com/ansango/lastfm-client-ts/commit/5264665))
- **pkg**: init with package ([9f12384](https://github.com/ansango/lastfm-client-ts/commit/9f12384))

### 🐛 Bug Fixes

- **build**: fix not published ([6e26de1](https://github.com/ansango/lastfm-client-ts/commit/6e26de1))
- **fix album tag**: fix album tag type with correct api definition ([e46598c](https://github.com/ansango/lastfm-client-ts/commit/e46598c))
- **track**: user recent track, isnowplaying ([fc03f5e](https://github.com/ansango/lastfm-client-ts/commit/fc03f5e))
- **user**: user recent track type fixed ([cd0be82](https://github.com/ansango/lastfm-client-ts/commit/cd0be82))
- **readme**: list ([3b84393](https://github.com/ansango/lastfm-client-ts/commit/3b84393))
- **readme**: fix readme ([66b22bd](https://github.com/ansango/lastfm-client-ts/commit/66b22bd))
- **fetcher**: fetcher and types ([4eb2aad](https://github.com/ansango/lastfm-client-ts/commit/4eb2aad))

### ⚡ Performance Improvements

- **build**: build client ([c30c9d0](https://github.com/ansango/lastfm-client-ts/commit/c30c9d0))


## [2.0.0-alpha.1] - 2025-11-05

### ✨ Features

- **rewrite**: complete v2.0.0-alpha.1 refactor — universal ESM Last.fm client ([bc6d43b](https://github.com/ansango/lastfm-client-ts/commit/bc6d43b))
- **readme**: contributing ([5d4559e](https://github.com/ansango/lastfm-client-ts/commit/5d4559e))
- **pkg**: up pkg ([0d0ef42](https://github.com/ansango/lastfm-client-ts/commit/0d0ef42))
- **readme**: adding dotenv ([65b130f](https://github.com/ansango/lastfm-client-ts/commit/65b130f))
- **readme**: basic readme ([cb467cb](https://github.com/ansango/lastfm-client-ts/commit/cb467cb))
- **pkg**: update package ([5f80e0f](https://github.com/ansango/lastfm-client-ts/commit/5f80e0f))
- **chart**: service and types ([8d3f612](https://github.com/ansango/lastfm-client-ts/commit/8d3f612))
- **build**: build geo ([9f98f98](https://github.com/ansango/lastfm-client-ts/commit/9f98f98))
- **geo**: service and types ([eadebaa](https://github.com/ansango/lastfm-client-ts/commit/eadebaa))
- **library**: service and type library ([1a89551](https://github.com/ansango/lastfm-client-ts/commit/1a89551))
- **tag**: tag service and types ([3d6de29](https://github.com/ansango/lastfm-client-ts/commit/3d6de29))
- **tag**: service tag added ([87de559](https://github.com/ansango/lastfm-client-ts/commit/87de559))
- **track**: track types and services ([f5e6363](https://github.com/ansango/lastfm-client-ts/commit/f5e6363))
- **track**: track service ([62f342c](https://github.com/ansango/lastfm-client-ts/commit/62f342c))
- **artist**: done artist ([59de841](https://github.com/ansango/lastfm-client-ts/commit/59de841))
- **typed**: fix types ([0738393](https://github.com/ansango/lastfm-client-ts/commit/0738393))
- **build**: artist service build ([a8bf981](https://github.com/ansango/lastfm-client-ts/commit/a8bf981))
- **artist**: service constructor ([02c1db0](https://github.com/ansango/lastfm-client-ts/commit/02c1db0))
- **types**: split api types ([5a90a8d](https://github.com/ansango/lastfm-client-ts/commit/5a90a8d))
- **dist**: build album done ([50ec5cb](https://github.com/ansango/lastfm-client-ts/commit/50ec5cb))
- **album**: services album ([bd509d2](https://github.com/ansango/lastfm-client-ts/commit/bd509d2))
- **primitives**: refactor primitives ([3d8a5d3](https://github.com/ansango/lastfm-client-ts/commit/3d8a5d3))
- **refactor types**: refator types user and base types ([e9d17b8](https://github.com/ansango/lastfm-client-ts/commit/e9d17b8))
- **album**: album services ([4ab012f](https://github.com/ansango/lastfm-client-ts/commit/4ab012f))
- **dist**: build dist ([c0e434e](https://github.com/ansango/lastfm-client-ts/commit/c0e434e))
- **config**: config api modules ([19bc7d9](https://github.com/ansango/lastfm-client-ts/commit/19bc7d9))
- **docs**: functions ([0896be4](https://github.com/ansango/lastfm-client-ts/commit/0896be4))
- **docs**: user docs generated ([e47c4c5](https://github.com/ansango/lastfm-client-ts/commit/e47c4c5))
- **package pub**: pub package dem ([c9d6b1d](https://github.com/ansango/lastfm-client-ts/commit/c9d6b1d))
- **reset**: reset version npm ([1f0a23f](https://github.com/ansango/lastfm-client-ts/commit/1f0a23f))
- **ignore**: npm ignore ([2d08998](https://github.com/ansango/lastfm-client-ts/commit/2d08998))
- **dist**: added dist ([329d2fb](https://github.com/ansango/lastfm-client-ts/commit/329d2fb))
- **lock**: yarn lock ([6854da4](https://github.com/ansango/lastfm-client-ts/commit/6854da4))
- **typed**: split types ([1249635](https://github.com/ansango/lastfm-client-ts/commit/1249635))
- **config**: dist and test ([c34b106](https://github.com/ansango/lastfm-client-ts/commit/c34b106))
- **fetcher**: fetcher and types req res ([be94106](https://github.com/ansango/lastfm-client-ts/commit/be94106))
- **config**: added config and method endpoints ([ac9921e](https://github.com/ansango/lastfm-client-ts/commit/ac9921e))
- **ts**: config typescript ([c1edaa4](https://github.com/ansango/lastfm-client-ts/commit/c1edaa4))
- **readme**: minimal readme added ([5264665](https://github.com/ansango/lastfm-client-ts/commit/5264665))
- **pkg**: init with package ([9f12384](https://github.com/ansango/lastfm-client-ts/commit/9f12384))

### 🐛 Bug Fixes

- **build**: fix not published ([6e26de1](https://github.com/ansango/lastfm-client-ts/commit/6e26de1))
- **fix album tag**: fix album tag type with correct api definition ([e46598c](https://github.com/ansango/lastfm-client-ts/commit/e46598c))
- **track**: user recent track, isnowplaying ([fc03f5e](https://github.com/ansango/lastfm-client-ts/commit/fc03f5e))
- **user**: user recent track type fixed ([cd0be82](https://github.com/ansango/lastfm-client-ts/commit/cd0be82))
- **readme**: list ([3b84393](https://github.com/ansango/lastfm-client-ts/commit/3b84393))
- **readme**: fix readme ([66b22bd](https://github.com/ansango/lastfm-client-ts/commit/66b22bd))
- **fetcher**: fetcher and types ([4eb2aad](https://github.com/ansango/lastfm-client-ts/commit/4eb2aad))

### ⚡ Performance Improvements

- **build**: build client ([c30c9d0](https://github.com/ansango/lastfm-client-ts/commit/c30c9d0))


## [2.0.0-alpha.1] - 2025-11-05

### 🚀 Major Refactoring

Complete rewrite of the library to be a universal, framework-agnostic Last.fm API client.

### ✨ Added

- **Universal support**: Works in both Node.js (≥20.0.0) and browser environments
- **ESM modules**: Full ES module support with proper exports
- **Class-based architecture**: New `LastFmClient` class for easier usage
- **Factory pattern**: All services are now factory functions with dependency injection
- **Global configuration**: Support for both global and per-instance configuration
- **Modular imports**: Tree-shakable imports for individual services
- **Type safety**: Comprehensive TypeScript types for all services
- **Configuration validation**: Strict API key validation with helpful error messages
- **Entry points**: Dedicated entry points for each service (`lastfm-client-ts/user`, etc.)
- **Native fetch**: Uses native fetch API (Node.js 18+) instead of polyfills

### 🔄 Changed

- **BREAKING**: Migrated from CommonJS to ESM
- **BREAKING**: Changed from static service exports to factory functions
- **BREAKING**: Removed SvelteKit-specific dependencies (`$lib/utils`, `$env/static/private`)
- **BREAKING**: Configuration now requires explicit API key (no more hardcoded defaults)
- **BREAKING**: Service interfaces renamed (e.g., `UserApiMethods` → `UserService`)
- **BREAKING**: Minimum Node.js version is now 20.0.0
- Updated all dependencies to latest stable versions:
  - TypeScript: 4.9.5 → 5.9.3
  - @types/node: 18.14.6 → 24.10.0
  - rimraf: 4.3.1 → 6.1.0
  - dotenv: 16.0.3 → 17.2.3

### 🗑️ Removed

- **BREAKING**: Removed `cross-fetch` dependency (uses native fetch)
- **BREAKING**: Removed `method` constant exports
- **BREAKING**: Removed `buildUrl` from main exports (moved to utilities)
- **BREAKING**: Removed peer dependencies
- Removed all SvelteKit-specific code

### 📦 Dependencies

- Added: `js-md5@0.8.3` (for API signatures)
- Removed: `cross-fetch` (no longer needed)
- Moved `dotenv` to devDependencies (only needed for development)

### 📚 Documentation

- Complete rewrite of README with modern examples
- Added comprehensive API documentation
- Added usage examples for all import patterns
- Added TypeScript usage examples
- Created example.ts with multiple usage scenarios
- Updated .env.example with new variable names

### 🔧 Configuration

- New configuration system with `createConfig()`, `setGlobalConfig()`, `getGlobalConfig()`
- Configuration now loaded from environment variables in Node.js
- Support for custom base URL
- Support for shared secret and session key

### 🏗️ Architecture

New file structure:
```
src/
├── client.ts          # LastFmClient class
├── config.ts          # Configuration system
├── utils.ts           # Universal utilities
├── index.ts           # Main entry point
├── services/          # Service implementations
│   ├── user.ts
│   ├── album.ts
│   ├── artist.ts
│   ├── track.ts
│   ├── tag.ts
│   ├── chart.ts
│   ├── geo.ts
│   ├── library.ts
│   ├── auth.ts       # Now properly exported
│   └── *.types.ts    # Type definitions
└── entrypoints/       # Modular entry points
    ├── user.ts
    ├── album.ts
    └── ...
```

### 🐛 Fixed

- Auth service is now properly exported
- Fixed missing `generateSignature` implementation
- Fixed all import paths to use `.js` extensions for ESM
- Fixed configuration to work in both Node.js and browser

### 🔒 Security

- API key is now required and validated
- No hardcoded credentials
- Proper environment variable handling

### 📝 Migration Guide

If you're upgrading from 1.x, here's what you need to know:

**Before (1.x):**
```typescript
import { userApiMethods } from 'lastfm-client-ts';
const info = await userApiMethods.getInfo({ user: 'rj' });
```

**After (2.0):**
```typescript
import { LastFmClient } from 'lastfm-client-ts';
const client = new LastFmClient({ apiKey: 'YOUR_KEY' });
const info = await client.user.getInfo({ user: 'rj' });
```

Or with individual services:
```typescript
import { createUserService } from 'lastfm-client-ts/user';
const userService = createUserService({ apiKey: 'YOUR_KEY' });
const info = await userService.getInfo({ user: 'rj' });
```

## [1.0.4-alpha.2] - Previous version

See git history for older changes.
