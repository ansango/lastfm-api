# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Package rename:** The project is now published as `@ansango/lastfm-api` from
> [ansango/lastfm-api](https://github.com/ansango/lastfm-api). Entries below preserve the
> historical package and repository names used by their original releases.

## [3.7.0] - 2026-08-30

### ♻️ Code Refactoring

- **arch**: structure codebase into core, api, and modules layers ([2134783](https://github.com/ansango/lastfm-api/commit/2134783))
- **arch**: migrate from core/ to domain-first namespaces and clean insights architecture ([571fa41](https://github.com/ansango/lastfm-api/commit/571fa41))

### 📚 Documentation

- **insights**: add comprehensive mathematical models and algorithms guide (closes #168) ([a6447a7](https://github.com/ansango/lastfm-api/commit/a6447a7))


## [3.6.0] - 2026-08-29

### ✨ Features

- **watcher**: implement real-time scrobble watcher and event emitter (closes #164, #165) (#167) ([a9545a1](https://github.com/ansango/lastfm-api/commit/a9545a1))
- **cache**: implement pluggable cache layer (closes #163) (#166) ([4eaa1e0](https://github.com/ansango/lastfm-api/commit/4eaa1e0))

### ♻️ Code Refactoring

- **index**: remove dotenv loading for environment variables ([57236a6](https://github.com/ansango/lastfm-api/commit/57236a6))

### 🔧 Chores

- **docs**: update README with complete v3.5.0 features and remove dotenv and test-real ([e2abeb9](https://github.com/ansango/lastfm-api/commit/e2abeb9))


## [3.5.0] - 2026-08-29

### ✨ Features

- **exporter**: implement exporter namespace (closes #157) (#161) ([d7385ff](https://github.com/ansango/lastfm-api/commit/d7385ff))
- **playlists**: implement playlists namespace (closes #156) (#160) ([9113b17](https://github.com/ansango/lastfm-api/commit/9113b17))
- **reports**: implement reports namespace (closes #155) (#159) ([b5524e1](https://github.com/ansango/lastfm-api/commit/b5524e1))
- **core**: implement automatic async pagination and streaming iterators (closes #154) (#158) ([406caa0](https://github.com/ansango/lastfm-api/commit/406caa0))
- **insights**: implement compareTasteGroup (closes #143) (#150) ([49b69b4](https://github.com/ansango/lastfm-api/commit/49b69b4))
- **insights**: implement getSmartRecommendations and getBridgeArtists (closes #142) (#149) ([3b2b2f2](https://github.com/ansango/lastfm-api/commit/3b2b2f2))
- **insights**: implement getGenreBreakdown and getGenreEvolution (closes #141) (#148) ([4c82e23](https://github.com/ansango/lastfm-api/commit/4c82e23))
- **insights**: implement getAlbumHabits (closes #140) (#147) ([0b9ceeb](https://github.com/ansango/lastfm-api/commit/0b9ceeb))
- **insights**: implement getListeningStreaks and getListeningHeatmap (closes #139) (#146) ([756b4de](https://github.com/ansango/lastfm-api/commit/756b4de))
- **insights**: implement getForgottenFavorites and getObsessions (closes #138) (#145) ([aac4776](https://github.com/ansango/lastfm-api/commit/aac4776))
- **insights**: implement getObscurityScore (closes #137) (#144) ([83be889](https://github.com/ansango/lastfm-api/commit/83be889))

### 🐛 Bug Fixes

- **ci**: point test-real to src and smoke-test core entrypoints ([847da33](https://github.com/ansango/lastfm-api/commit/847da33))

### ♻️ Code Refactoring

- **arch**: decouple core canonical API from insights engine (closes #151) (#152) ([6e3b261](https://github.com/ansango/lastfm-api/commit/6e3b261))

### 📚 Documentation

- **insights**: document 11 new analytical methods in README and api-coverage (closes #136) ([35f5d60](https://github.com/ansango/lastfm-api/commit/35f5d60))

### 🔧 Chores

- **release**: bump version to v3.5.0 ([abcc3c7](https://github.com/ansango/lastfm-api/commit/abcc3c7))


## [3.5.0] - 2026-08-29

### ✨ Features

- **watcher**: implement real-time scrobble watcher and event emitter (closes #164, #165) (#167) ([a9545a1](https://github.com/ansango/lastfm-api/commit/a9545a1))
- **cache**: implement pluggable cache layer (closes #163) (#166) ([4eaa1e0](https://github.com/ansango/lastfm-api/commit/4eaa1e0))

### ♻️ Code Refactoring

- **index**: remove dotenv loading for environment variables ([57236a6](https://github.com/ansango/lastfm-api/commit/57236a6))

### 🔧 Chores

- **docs**: update README with complete v3.5.0 features and remove dotenv and test-real ([e2abeb9](https://github.com/ansango/lastfm-api/commit/e2abeb9))


## [3.4.0] - 2026-08-28

### ✨ Features

- **insights**: implement compareUsers with Jaccard affinity index (closes #125) ([95f39d6](https://github.com/ansango/lastfm-api/commit/95f39d6))
- **insights**: implement getMood psychometric classifier and getPersonality archetypes (closes #124) ([0aae0e8](https://github.com/ansango/lastfm-api/commit/0aae0e8))
- **insights**: implement getTrends ranking diff and getDiscoveries new-artist detector (closes #123) ([1a07234](https://github.com/ansango/lastfm-api/commit/1a07234))
- **insights**: implement getHoursHistogram and getBinges temporal analytics (closes #122) ([7615ba9](https://github.com/ansango/lastfm-api/commit/7615ba9))
- **insights**: implement getNowPlaying with artist bio and similarity enrichment (closes #121) ([9de9213](https://github.com/ansango/lastfm-api/commit/9de9213))
- **insights**: register getSummary route in method registry and Scalar OpenAPI docs ([875bafe](https://github.com/ansango/lastfm-api/commit/875bafe))
- **insights**: implement getSummary with Shannon diversity index (closes #120) ([28b03b0](https://github.com/ansango/lastfm-api/commit/28b03b0))
- **insights**: wire insights namespace in method registry ([2d1db4d](https://github.com/ansango/lastfm-api/commit/2d1db4d))
- **insights**: base architecture, Zod schemas infrastructure, and client wiring (closes #119) ([6ce9d4e](https://github.com/ansango/lastfm-api/commit/6ce9d4e))

### 📚 Documentation

- **insights**: add dedicated OpenAPI descriptions in Scalar for all 9 insight methods ([1115785](https://github.com/ansango/lastfm-api/commit/1115785))
- **insights**: documentation, OpenAPI Scalar integration, and CLI migration guide (closes #126) ([f325696](https://github.com/ansango/lastfm-api/commit/f325696))

### 🔧 Chores

- remove PROJECT_IDEAS.md ([a837c39](https://github.com/ansango/lastfm-api/commit/a837c39))
- update dependencies and configuration files - Bump @types/node to version 26.4.0 in package.json and bun.lock - Modify build script in package.json to use tsconfig.build.json - Update changelog script to handle undefined tags - Refactor recent tracks test for better readability - Adjust tsconfig files for improved build and development settings - Add tsconfig.build.json for build-specific configurations - Update .gitignore to exclude AGENTS.md ([2a1687f](https://github.com/ansango/lastfm-api/commit/2a1687f))


## [3.3.0] - 2026-08-28

### ✨ Features

- `auth.getToken()` now returns a pre-built `authUrl` so consumers don't have to
  construct the browser-flow URL themselves. The CLI prints it; Scalar renders it
  in the response. (#115) ([c69cd53](https://github.com/ansango/lastfm-api/commit/c69cd53))

### ⚠️ Breaking Changes

- `auth.getMobileSession` has been **removed**. The method was deprecated in 3.2.0
  (PR #106) with the warning that it would be removed in a future major release.
  Last.fm restricts this endpoint to mobile-classified API keys, which are not
  exposed through the public self-service create form. Every consumer can use the
  browser flow (`auth.getToken` + `auth.getSession`) instead. (#117) ([99c4466](https://github.com/ansango/lastfm-api/commit/99c4466))

  **Migration:**

  ```ts
  // 3.2.x — no longer compiles
  const { session } = await client.auth.getMobileSession({
    username: "...",
    password: "...",
  });

  // 3.3.0 — use the browser flow
  const { token, authUrl } = await client.auth.getToken();
  // open authUrl in a browser, authorize, copy token from URL bar
  const { session } = await client.auth.getSession({ token });
  ```

  The Scalar tool surface no longer exposes `POST /auth/get-mobile-session`. The
  `x-lastfm-sk` header description and the `AUTH_TAG_DESCRIPTION` were rewritten
  to point at the browser flow + `authUrl`. The 57-method surface is now 56.


## [3.2.0] - 2026-08-28

### ✨ Features

- **tool**: surface `x-lastfm-sk` header on the 10 POST signed methods in Scalar's "Try it" form (#100) ([b904451](https://github.com/ansango/lastfm-api/commit/b904451))

### 📚 Documentation

- document `sk` parameter and the browser auth flow on the 10 write methods (JSDoc + README) (#101) ([49c10da](https://github.com/ansango/lastfm-api/commit/49c10da))
- add Callback URL setup prerequisite to README and Scalar auth tag (#110) ([c64410d](https://github.com/ansango/lastfm-api/commit/c64410d))
- deprecate `auth.getMobileSession` and reorient the auth flow to lead with the web flow (#105) ([4446f10](https://github.com/ansango/lastfm-api/commit/4446f10))

### 🛠️ Tooling

- friendly startup error when `LASTFM_API_KEY` is missing (#103) ([cca87a2](https://github.com/ansango/lastfm-api/commit/cca87a2))
- add Biome for lint + format, replace unused Prettier config (#111) ([071c1e7](https://github.com/ansango/lastfm-api/commit/071c1e7))


## [3.1.3] - 2026-08-02

### 📚 Documentation

- update README for #59 #60 #61 ([bd1d51b](https://github.com/ansango/lastfm-client-ts/commit/bd1d51b))


## [3.1.2] - 2026-08-02

### 🐛 Bug Fixes

- **auth**: drop required api_key from authGetSessionRequestSchema (#62) ([f1158de](https://github.com/ansango/lastfm-client-ts/commit/f1158de))
- **errors**: normalize API errors via LastFmApiError (#61) ([143bede](https://github.com/ansango/lastfm-client-ts/commit/143bede))
- **track**: auto-inject sessionKey from config for scrobble calls (#60) ([b2c3599](https://github.com/ansango/lastfm-client-ts/commit/b2c3599))
- **track**: rename scrobble methods to canonical Last.fm names (#59) ([c997868](https://github.com/ansango/lastfm-client-ts/commit/c997868))
- default baseUrl in buildUrl and buildAuthUrl (#58) ([c6e45e6](https://github.com/ansango/lastfm-client-ts/commit/c6e45e6))

### 🔧 Chores

- rebuild dist before release ([ba62a5a](https://github.com/ansango/lastfm-client-ts/commit/ba62a5a))


## [3.1.1] - 2025-11-07

### 🔧 Chores

- update chore deps ([543dd25](https://github.com/ansango/lastfm-client-ts/commit/543dd25))
- remove unused dependencies and files ([8a3d5e2](https://github.com/ansango/lastfm-client-ts/commit/8a3d5e2))


## [3.1.0] - 2025-11-07

### ✨ Features

- export Zod schemas in addition to inferred types ([213ad43](https://github.com/ansango/lastfm-client-ts/commit/213ad43))


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
