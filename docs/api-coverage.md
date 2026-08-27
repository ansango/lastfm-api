# API coverage audit

This document is the human-readable companion to `src/__tests__/inventory.test.ts`,
which is the executable source of truth. The inventory test asserts that the
package implements all 57 canonical Last.fm API methods and that each one is
callable on the `LastFmClient`.

If you add or remove a method, update both this file and the inventory test
in the same PR.

## Summary

- **Coverage: 57 / 57** canonical Last.fm methods across 9 namespaces.
- **Baseline: 43 / 57** at the start of epic #67.
- **Gap closed by epic #67 (PRs #83–#89):** 14 new methods.
- **Wrappers and aliases** (e.g. `track.scrobbleMany`, `track.postTrackScrobble`)
  are intentionally **not counted** as separate canonical methods; they all
  target `track.scrobble`.

## Per-namespace breakdown

| Namespace | Count | Methods |
|---|---:|---|
| `artist` | 10 | `getInfo`, `getTags`, `getSimilar`, `getTopTags`, `getTopAlbums`, `getTopTracks`, `search`, `getCorrection`¹, `addTags`², `removeTag`² |
| `album` | 6 | `getInfo`, `getTags`, `getTopTags`, `search`, `addTags`², `removeTag`² |
| `track` | 12 | `getInfo`, `getSimilar`, `getTags`, `getTopTags`, `search`, `scrobble`, `getCorrection`¹, `addTags`², `removeTag`², `love`², `unlove`², `updateNowPlaying`² |
| `user` | 13 | `getInfo`, `getFriends`, `getLovedTracks`, `getRecentTracks`, `getTopAlbums`, `getTopArtists`, `getTopTags`, `getTopTracks`, `getWeeklyAlbumChart`, `getWeeklyArtistChart`, `getWeeklyChartList`, `getWeeklyTrackChart`, `getPersonalTags`¹ |
| `tag` | 7 | `getInfo`, `getSimilar`, `getTopAlbums`, `getTopArtists`, `getTopTags`, `getTopTracks`, `getWeeklyChartList` |
| `chart` | 3 | `getTopArtists`, `getTopTags`, `getTopTracks` |
| `geo` | 2 | `getTopArtists`, `getTopTracks` |
| `library` | 1 | `getArtists` |
| `auth` | 3 | `getSession`, `getToken`¹, `getMobileSession`¹ |
| **Total** | **57** | |

¹ Added under epic #67 to close the gap from the 43/57 baseline.
² Added under epic #67. Requires an authenticated session (`sk`).

## Transport classification

Each method falls into one of three transport categories, all implemented in
`src/utils.ts`:

| Category | Transport | Methods | Signing | Session |
|---|---|---|---|---|
| Public unsigned GET | `buildUrl` + `fetcher` | 42 (all reads) | none | none |
| Signed GET | `buildAuthUrl` + `fetcher` | 3 (`auth.getSession`, `auth.getToken`, future signed GETs) | `api_sig` | no |
| Signed POST | `signedPost` | 12 (writes) | `api_sig` | yes for non-`getMobileSession` |

`auth.getMobileSession` is the one signed POST that does not require an
existing session — it issues the session in the response.

## Methods that require authentication

Any method marked with ² in the table above requires an authenticated session.
The client resolves the session key from `request.sk ?? config.sessionKey`
and throws `LastFmApiError(httpStatus: 0)` before any fetch when neither is
present, with a sanitized message that names the action without leaking
credentials.

`auth.getMobileSession` is the credential carrier: it takes a username (or
email) and password in the body and returns a session key. It must never be
used in a browser or any environment where the bundle is exposed.

## Wrapper and alias methods (not counted)

These are exposed on the client for ergonomics and backwards compatibility
but are not canonical Last.fm endpoints:

- `track.scrobbleMany` / `track.postBatchTrackScrobble` — both call
  `track.scrobble` with a batch body.
- `track.postTrackScrobble` — alias for `track.scrobble`.

The aliases were kept for callers of `lastfm-client-ts <= 3.1.1`. They will
be removed in the next major release.

## Live integration verification

The deterministic suite covers the wire contract (URL shape, body shape,
signature reproducibility, error routing) for all 57 methods. A separate
manual live-integration checklist is required to confirm each method
returns the expected payload against the real Last.fm API:

- [ ] Set `LASTFM_API_KEY` and `LASTFM_SHARED_SECRET` in `.env`.
- [ ] For write methods, also `LASTFM_SESSION_KEY` (obtain via
  `auth.getMobileSession` or the browser flow).
- [ ] Run `bun run test:integration:live` (not part of CI).
- [ ] For each namespace, hit at least one read and (where applicable) one
  write with a stable test account. Verify that:
  - The response shape matches the corresponding Zod schema.
  - The `api_sig` validates against the official Last.fm signature
    calculator for one chosen method per category.
  - Idempotent methods (e.g. `auth.getToken`, `track.addTags` on the same
    payload) behave as documented.
  - Methods that are documented as no-domain-payload return an empty
    success and no client-side errors.

Document the results in a new issue or comment; the audit is complete when
every method has a passing live-integration note.

## History

- 2026-08-27: 43/57 → 57/57 via PRs #83–#89 (issues #69, #70, #71, #72,
  #73, #74, #75, #76). See epic #67.
- 2026-08-27: this document created as part of the pre-release audit
  (issue #77, README audit issue #63).
