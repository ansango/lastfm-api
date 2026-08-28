# `@ansango/lastfm-api` — local docs server

A standalone [Hono](https://hono.dev/) + [Scalar](https://scalar.com/) server that
turns the [`@ansango/lastfm-api`](https://github.com/ansango/lastfm-api) package
into a fully interactive OpenAPI explorer. All 57 canonical Last.fm methods
are wired declaratively from the package's own Zod schemas and service
functions — no method is hand-written, no schema is duplicated.

> Epic [#92](https://github.com/ansango/lastfm-api/issues/92) ·
> Implementation: HU1 → HU6 (children #93–#98).

## What you get

- `GET /` — the Scalar UI with all 57 methods grouped by namespace
- `GET /doc` — the raw OpenAPI 3.0 JSON
- `GET /<ns>/<method>` — the proxied endpoint, e.g. `GET /artist/get-info?artist=cher`
- `POST /<ns>/<method>` — signed write methods, e.g. `POST /track/love`

"Try it" works against the real Last.fm API. The shared secret and session
key live in the local process; they are never exposed to the browser and
**never persisted to disk by the tool**.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.4
- A Last.fm API key and shared secret: <https://www.last.fm/api/account/create>
- (For write methods) a session key — see [Auth flow](#auth-flow)

## Quickstart

From the repo root:

```sh
# Install the tool's own dependencies (one-time)
bun install --cwd tool/api-scalar

# Run the server (hot-reload on file change)
bun run tool:dev
```

Then open <http://localhost:3000>. The Scalar UI loads at `/`, the OpenAPI
spec is at `/doc`.

If `LASTFM_API_KEY` is missing, the tool prints a friendly error with the
create-account URL and a copy-pasteable `echo >> .env` snippet, then
exits with code 1 — no stack trace, no surprise. See the [Startup errors](#startup-errors)
section below.

## Configuration

The tool reads `.env` from the repo root (the `dotenv` call resolves
`${import.meta.dir}/../../../.env`).

```sh
# Required for any "Try it" call
LASTFM_API_KEY=your-api-key

# Required for signed methods (auth.getToken, auth.getSession, and all 10 write methods)
LASTFM_SHARED_SECRET=your-shared-secret

# Optional — only as a fallback. Prefer the per-request `x-lastfm-sk` header
# (see Auth flow below) so the key is never written to disk.
LASTFM_SESSION_KEY=
```

All variables can also be passed via the shell — the server falls back to
`process.env` if the `.env` file is absent.

## Auth flow

The Scalar UI ships a brief auth guide in the `auth` tag's description.
The full flow, end to end:

**1. Get a session key** (one POST, no browser):

- Open `POST /auth/get-mobile-session` in the Scalar UI
- Fill `username` and `password` in the JSON body
- Send → response contains `session.key` (e.g. `abcdef123456...`)
- Copy it to your clipboard

**2. Use it on write methods** (no persistence, per-request):

- Open any POST endpoint (e.g. `POST /track/love`)
- In the **Headers** section of the form, set:
  ```
  x-lastfm-sk: <the-key-you-copied>
  ```
- Fill the JSON body with the required fields
- Send

The session key is **never** written to disk. Closing the browser loses
it — repeat step 1 to get a new one. The `LASTFM_API_KEY` and
`LASTFM_SHARED_SECRET` env vars stay in your shell (they're not
sensitive in the same way and they're needed on every call anyway).

**Source order** (the handler reads `sk` from the first non-empty):
1. `x-lastfm-sk` request header (the canonical Scalar path)
2. `sk` field in the request body
3. `LASTFM_SESSION_KEY` env var (fallback)

## Startup errors

If `LASTFM_API_KEY` is missing, the tool prints a friendly error pointing
at the [Last.fm create-account form](https://www.last.fm/api/account/create)
and a copy-pasteable `echo >> .env` snippet, then exits with code 1:

```
tool: missing LASTFM_API_KEY

Every Last.fm call needs an API key. Register one for free at:
  https://www.last.fm/api/account/create

Then drop it into your repo-root .env:
  # repo root (one level above tool/api-scalar/)
  echo 'LASTFM_API_KEY=your-key-here' >> .env
  echo 'LASTFM_SHARED_SECRET=your-secret-here' >> .env

Restart `bun run tool:dev` after saving.
```

If `LASTFM_API_KEY` is set but `LASTFM_SHARED_SECRET` is not, the tool
still starts (read methods work) and prints a warning that signed calls
will 401 until you add the secret.

## How it works

```
┌───────────────────────┐
│  src/canonical-methods │   single source of truth: the 57 canonical
│  (the inventory)       │   Last.fm namespace.method pairs.
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  src/method-registry   │   introspects src/services/*.ts by convention
│  (the wiring)          │   • resolves each method's export
│                        │   • pairs it with <ns><PascalName>RequestSchema
│                        │   • picks defaults (NS_DEFAULTS) + overrides (SPECIAL)
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  tool/src/             │   generic buildRoute / buildHandler
│  server.ts + doc.ts    │   • Scalar UI at /
│                        │   • OpenAPI 3.0 JSON at /doc
└────────────────────────┘
```

`buildRoute(meta)` returns a `createRoute({...})` result.
`buildHandler(meta, client)` returns a Hono handler that pulls validated
params and invokes `meta.resolve(client)(params)`. The package itself
computes `api_sig` and the Last.fm transport — the tool is a thin
routing layer.

## Adding a new method

1. Export the function from `src/services/<namespace>.ts` and the
   matching Zod request/response schemas from
   `src/services/<namespace>.schemas.ts`.
2. Add the `namespace.method` string to `CANONICAL_METHODS` in
   `src/canonical-methods.ts`.
3. If the method breaks the namespace defaults (POST, signed, requires
   session, JSON body), add an entry to the `SPECIAL` table in
   `src/method-registry.ts`.
4. Run `bun run --cwd tool test` — the registry smoke tests verify all
   57 methods are present, the SPECIAL table is consistent, and the
   per-namespace count matches the inventory.

That's it. The tool picks the new method up automatically.

## Tests

```sh
# Registry shape + SPECIAL table consistency
bun run --cwd tool test __tests__/registry.test.ts

# Server shape + per-namespace smoke (mocked fetch, no Last.fm)
bun run --cwd tool test __tests__/server.test.ts
```

All tests run with a fully mocked `globalThis.fetch` — no real Last.fm
calls are made.

## Deploy (follow-up)

Local-only for now. A follow-up epic will add a Dockerfile and a
recipe for Fly.io / Cloudflare Workers. The tool is a Bun server, so
any Bun-compatible host works.

## Out of scope (see #92)

- Production deploy
- Custom auth on the docs endpoint
- Session persistence
- Rate limiting
- Modifying any of the 57 methods in the package
