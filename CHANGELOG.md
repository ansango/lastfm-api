# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
