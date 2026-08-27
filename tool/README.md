# `tool/` — dev tools

This directory hosts the dev tools that ship with the repo. They are not
published to npm, are excluded from the build, and run locally only.

| Tool | Description | Run |
|---|---|---|
| [`api-scalar/`](./api-scalar/) | Hono + Scalar docs server exposing all 57 canonical Last.fm methods (#92) | `bun run tool:dev` |
| `ci-summary.ts` | Posts a visual test summary to the open PR (called by `.github/workflows/ci.yml`) | invoked by CI |

## Conventions

- Each tool lives in its own subfolder with its own `package.json` and `bun.lock`.
- Imports from the package use relative paths (`../../../src/...`).
- Tools are pinned by their own `bun.lock` and installed via `bun install --cwd tool/<name>`.
- None of the tools are part of the npm tarball (`npm pack --dry-run` excludes `tool/`).
