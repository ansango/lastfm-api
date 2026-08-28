# `lastfm-cli` Migration Guide to `@ansango/lastfm-api/insights`

This document details the architectural contract and step-by-step migration guide for [`lastfm-cli`](https://github.com/ansango/lastfm-cli) (Epic [#19](https://github.com/ansango/lastfm-cli/issues/19)) to replace its internal `src/insights/lib/*` modules with direct calls to `@ansango/lastfm-api/insights`.

---

## 1. Architectural Boundary

- **`@ansango/lastfm-api` (Core Engine):**
  - Owns all data fetching, pagination loops, concurrency (`Promise.all`), error normalization (`LastFmApiError`), and mathematical/psychometric models (Shannon diversity entropy, Jaccard similarity, 2D mood classification, archetype feature scoring, binge detection).
  - Returns strictly typed, runtime-validated JSON data (`InsightsSummaryResponse`, `InsightsMoodResponse`, etc.).

- **`lastfm-cli` (Presentation & Terminal Layer):**
  - Owns command-line argument parsing (`parseFlags`), terminal colorization (Chalk), formatted Markdown / ASCII bar-chart generation, and stdout writing (`--format json|markdown`).
  - Zero duplicate math or multi-call orchestration.

---

## 2. Method Mapping Table

| CLI Command | Legacy CLI Helper (to delete) | `@ansango/lastfm-api` Method |
|---|---|---|
| `lastfm insights summary` | `src/insights/lib/summary.ts`, `diversity.ts` | `client.insights.getSummary({ user, period, limit })` |
| `lastfm insights now-playing` | `src/insights/lib/now-playing.ts` | `client.insights.getNowPlaying({ user, similarLimit, bioMaxChars })` |
| `lastfm insights hours` | `src/insights/lib/hours.ts` | `client.insights.getHoursHistogram({ user, from, to, sinceDays })` |
| `lastfm insights binges` | `src/insights/lib/binges.ts` | `client.insights.getBinges({ user, sinceDays, minLength, maxGapSeconds, trackKey })` |
| `lastfm insights trends` | `src/insights/lib/trends.ts` | `client.insights.getTrends({ user, target, currentPeriod, previousPeriod, limit })` |
| `lastfm insights discoveries` | `src/insights/lib/discoveries.ts` | `client.insights.getDiscoveries({ user, windowDays, baselineLimit, maxResults })` |
| `lastfm insights mood` | `src/insights/lib/mood.ts`, `mood-composer.ts` | `client.insights.getMood({ user, period, topArtistsLimit })` |
| `lastfm insights personality` | `src/insights/lib/personality.ts` | `client.insights.getPersonality({ user })` |
| `lastfm insights compare` | `src/insights/lib/compare.ts` | `client.insights.compareUsers({ userA, userB, period, limit })` |

---

## 3. Migration Example (Before vs. After)

### Before (CLI owned data fetching and composition):
```typescript
// src/insights/commands/summary.ts (legacy)
import { callLastfm } from '../lib/cli.js';
import { buildSummary } from '../lib/summary.js';

const caller = (m, p) => callLastfm(m, p);
const summary = await buildSummary({ user, period, limit, caller });
```

### After (CLI delegates to core API):
```typescript
// src/insights/commands/summary.ts (migrated)
import { getClient } from '../client.js';

const client = getClient();
const summary = await client.insights.getSummary({ user, period, limit });

if (format === 'json') {
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
} else {
  process.stdout.write(renderSummaryMarkdown(summary));
}
```

---

## 4. Deletion Checklist for `lastfm-cli`

Once `lastfm-cli` is upgraded to the latest `@ansango/lastfm-api` package:
- [ ] Delete `src/insights/lib/binges.ts`
- [ ] Delete `src/insights/lib/compare.ts`
- [ ] Delete `src/insights/lib/discoveries.ts`
- [ ] Delete `src/insights/lib/diversity.ts`
- [ ] Delete `src/insights/lib/hours.ts`
- [ ] Delete `src/insights/lib/mood.ts`
- [ ] Delete `src/insights/lib/mood-composer.ts`
- [ ] Delete `src/insights/lib/now-playing.ts`
- [ ] Delete `src/insights/lib/personality.ts`
- [ ] Delete `src/insights/lib/summary.ts`
- [ ] Delete `src/insights/lib/trends.ts`
- [ ] Keep `src/insights/lib/render.ts` and `src/insights/lib/args.ts` (presentation only).
