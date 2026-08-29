# Insights & Analytics Engine Guide

`@ansango/lastfm-api/insights` is a higher-level analytical and psychometric intelligence suite built on top of the canonical Last.fm API. It provides 20 derived algorithms that compute statistical diversity, behavioral patterns, temporal distributions, taste compatibility, mood classification, and intelligent recommendations.

All methods are available directly via `client.insights.*` or through the modular subpath `@ansango/lastfm-api/insights`.

---

## 📑 Method Inventory (20 Methods)

| Category | Method | Description | Primary Mathematical / Algorithmic Model |
|---|---|---|---|
| **Summary & Diversity** | `getSummary` | Aggregated period summary with diversity metrics | Shannon Diversity Index & Market Concentration |
| **Enrichment** | `getNowPlaying` | Enriched real-time/last scrobble with bio & similar | HTML entity stripping & bio synthesis |
| **Temporal Dynamics** | `getHoursHistogram` | 24-hour & 7-weekday listening distribution | Diurnal temporal bucketing & peak detection |
| **Temporal Dynamics** | `getBinges` | Consecutive same-artist/track listening sessions | Chronological sliding window & gap clustering |
| **Ranking & Trends** | `getTrends` | Differential rank comparison between two periods | Rank delta vector ($\Delta \text{rank}$, $\Delta \text{count}$) |
| **Discovery & Churn** | `getDiscoveries` | First-time artist discoveries in recent window | Set difference ($\text{Window} \setminus \text{Baseline}$) |
| **Psychometrics** | `getMood` | 2D valence-energy psychological mood profiling | Russell's Circumplex Model & Tag Space Mapping |
| **Psychometrics** | `getPersonality` | Listener archetype scoring across 6 personas | Multidimensional feature vector normalization |
| **Affinity & Blends** | `compareUsers` | Pairwise taste overlap between two users | Jaccard Similarity Coefficient ($J(A, B)$) |
| **Cultural Metrics** | `getObscurityScore` | Hipster / underground vs mainstream index | Logarithmic listener scale & popularity decay |
| **Discovery & Churn** | `getForgottenFavorites` | Historical favorites with recent activity drop | Decay thresholding & relative playcount drop |
| **Temporal Dynamics** | `getObsessions` | Sudden single-artist/track fixation spikes | Sliding window concentration & variance |
| **Habits & Streaks** | `getListeningStreaks` | Daily consecutive active listening streaks | Calendar date continuity & dry spell analysis |
| **Habits & Streaks** | `getListeningHeatmap` | Normalized daily intensity for calendar grids | Normalized 5-tier intensity binning (0..4) |
| **Listening Habits** | `getAlbumHabits` | Sequential full-album listening consistency | Track sequence delta & purist vs shuffler ratio |
| **Genre Analytics** | `getGenreBreakdown` | Normalized genre breakdown with noise filtering | Herfindahl-Hirschman Index (HHI) & Tag Cleansing |
| **Genre Analytics** | `getGenreEvolution` | Shift in genre distribution over time | Differential percentage vector & expansion rate |
| **Recommendations** | `getSmartRecommendations` | Unheard recommendations from user's top seeds | Graph traversal over Last.fm similarity network |
| **Recommendations** | `getBridgeArtists` | Artists connecting two distinct musical genres | Multi-tag intersection with geometric mean ranking |
| **Affinity & Blends** | `compareTasteGroup` | Group taste blend & consensus for 3–10 users | Pairwise Jaccard matrix & consensus overlap |

---

## 🧮 Mathematical Foundations & Algorithmic Details

### 1. `getSummary` — Shannon Diversity Index & Market Share
Aggregates top artists, tracks, albums, and community tags for a specified period, calculating listening entropy:

$$\text{Shannon Entropy: } H = -\sum_{i=1}^{N} p_i \ln p_i \quad \text{where } p_i = \frac{\text{plays}_i}{\text{totalPlays}}$$

$$\text{Normalized Diversity: } H_{\text{norm}} = \frac{H}{\ln N} \in [0, 1]$$

- **$H_{\text{norm}} \to 0$**: Highly focused, obsessive listening on a few artists.
- **$H_{\text{norm}} \to 1$**: Perfectly distributed, eclectic listening across many artists.
- **Top-N Market Concentration**: Computes the exact listening share captured by top 1, 3, and 5 artists.

```typescript
const summary = await client.insights.getSummary({
  user: 'ansango',
  period: '7day',
  limit: 10,
});
console.log(`Normalized Diversity: ${summary.diversity?.normalized}`);
console.log(`Top 1 Artist Share: ${summary.diversity?.top1Share * 100}%`);
```

---

### 2. `getNowPlaying` — Enriched Real-Time Scrobble
Fetches the user's currently playing track (or most recent scrobble) and performs parallel lookups on `artist.getInfo` and `artist.getSimilar` to enrich the response with biography text (stripping Last.fm wiki boilerplate) and recommendations.

```typescript
const now = await client.insights.getNowPlaying({
  user: 'ansango',
  similarLimit: 5,
  bioMaxChars: 250,
});
console.log(`Now playing: ${now.track.name} by ${now.artist.name}`);
```

---

### 3. `getHoursHistogram` — Diurnal & Weekly Listening Cycles
Walks the user's scrobble history across a time window, projecting timestamps into:
- 24 hourly buckets ($0 \le h \le 23$)
- 7 weekday buckets ($0 = \text{Monday} \dots 6 = \text{Sunday}$)
- Diurnal quadrant distribution: `nightShare` (22:00–05:59), `morningShare` (06:00–11:59), `afternoonShare` (12:00–17:59), `eveningShare` (18:00–21:59), `weekendShare`.

```typescript
const diurnal = await client.insights.getHoursHistogram({
  user: 'ansango',
  sinceDays: 30,
});
console.log(`Peak listening hour: ${diurnal.peakHour}:00 (${diurnal.peakHourCount} plays)`);
```

---

### 4. `getBinges` — Streak & Session Clustering
Detects consecutive plays of the same artist or track where the gap between consecutive scrobbles is smaller than `maxGapSeconds` (default: 3600s).

```typescript
const binges = await client.insights.getBinges({
  user: 'ansango',
  sinceDays: 30,
  minLength: 3,
  trackKey: 'artist',
});
```

---

### 5. `getTrends` — Ranking Vector Differentials
Computes the differential movement of items between a current and previous period:

$$\Delta\text{rank} = \text{previousRank} - \text{currentRank}$$

- **Risers**: Items whose ranking increased ($\Delta\text{rank} > 0$).
- **Fallers**: Items whose ranking decreased ($\Delta\text{rank} < 0$).
- **Newcomers**: Items present in the current period but absent in the previous period.
- **Departures**: Items present previously but fallen off the top chart.

```typescript
const trends = await client.insights.getTrends({
  user: 'ansango',
  target: 'artists',
  currentPeriod: '7day',
  previousPeriod: '1month',
  limit: 10,
});
```

---

### 6. `getDiscoveries` — Historical Roster Set Difference
Evaluates newly discovered artists within a sliding window by computing the set difference against the user's historical baseline:

$$\text{Discoveries} = \{ a \in \text{WindowScrobbles} \mid a \notin \text{BaselineRoster} \}$$

```typescript
const discoveries = await client.insights.getDiscoveries({
  user: 'ansango',
  windowDays: 30,
  maxResults: 20,
});
```

---

### 7. `getMood` — Russell's Circumplex Psychometric Classifier
Projects user tags and top artist tags into Russell's 2D Valence-Energy psychological space:
- **Energy Axis (Arousal)**: $[-1.0 \text{ (calm/ambient)}, +1.0 \text{ (intense/aggressive)}]$
- **Valence Axis (Pleasure)**: $[-1.0 \text{ (somber/depressive)}, +1.0 \text{ (euphoric/happy)}]$

Maps the resulting coordinate $(\bar{v}, \bar{e})$ into emotional quadrants:
- `Exuberant / Euphoric` ($+v, +e$)
- `Intense / Aggressive` ($-v, +e$)
- `Melancholic / Somber` ($-v, -e$)
- `Calm / Peaceful` ($+v, -e$)

```typescript
const mood = await client.insights.getMood({
  user: 'ansango',
  period: '7day',
  topArtistsLimit: 15,
});
console.log(`Mood: ${mood.label} (Energy: ${mood.axes.energy}, Valence: ${mood.axes.valence})`);
```

---

### 8. `getPersonality` — Listener Archetype Scoring
Evaluates 11 normalized behavioral features against 6 archetypal profiles:
1. **The Devotee**: High top-1/top-3 artist concentration and heavy repeat listening.
2. **The Explorer**: High discovery rate and eclectic Shannon diversity.
3. **The Drifter**: Even distribution, low repeat concentration, changing top artists.
4. **The DJ**: High track-to-artist ratio, fast shuffle behavior, party diurnal patterns.
5. **The Nocturnal**: Overwhelming listening activity concentrated between 22:00 and 06:00.
6. **The Archivist**: Deep album listens, historical catalog focus, consistent completion.

```typescript
const personality = await client.insights.getPersonality({
  user: 'ansango',
});
console.log(`Archetype: ${personality.archetype.emoji} ${personality.archetype.name}`);
```

---

### 9. `compareUsers` — Jaccard Affinity & Weighted Overlap
Computes the Jaccard similarity coefficient between two users' top artist rosters:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|} \in [0, 1]$$

Also calculates the minimum playcount weight for each shared artist:

$$\text{weight}_i = \min(\text{plays}_{A, i}, \text{plays}_{B, i})$$

```typescript
const comparison = await client.insights.compareUsers({
  userA: 'ansango',
  userB: 'rj',
  period: 'overall',
  limit: 50,
});
console.log(`Compatibility: ${(comparison.jaccard * 100).toFixed(1)}%`);
```

---

### 10. `getObscurityScore` — Hipster Index & Hidden Gems
Evaluates user artists against global Last.fm listener counts using logarithmic attenuation:

$$\text{score}_i = \max\left(0, 100 - \frac{\ln(\text{listeners}_i)}{\ln(\text{maxListeners})} \times 100\right)$$

Categorizes the user into:
- `Purist Underground` ($80–100$)
- `Indie Explorer` ($60–79$)
- `Balanced Listener` ($40–59$)
- `Mainstream Enthusiast` ($20–39$)
- `Chart Chaser` ($0–19$)

```typescript
const obscurity = await client.insights.getObscurityScore({
  user: 'ansango',
  period: '1month',
});
console.log(`Hipster Score: ${obscurity.obscurityScore.toFixed(1)}/100 (${obscurity.category})`);
```

---

### 11. `getForgottenFavorites` — Churn & Decay Analysis
Identifies artists with substantial historical weight in the user's all-time library that have recorded zero or minimal scrobbles during the recent evaluation period.

```typescript
const forgotten = await client.insights.getForgottenFavorites({
  user: 'ansango',
  period: '1month',
  minHistoricalRank: 50,
});
```

---

### 12. `getObsessions` — Fixation Episodes
Detects temporary hyper-fixation spikes where a single artist or track captured $> 30\%$ of total listening over a sliding window.

```typescript
const obsessions = await client.insights.getObsessions({
  user: 'ansango',
  windowDays: 14,
  threshold: 0.35,
});
```

---

### 13. `getListeningStreaks` — Continuity & Dry Spell Tracker
Walks the user's daily listening calendar, computing:
- `currentStreak`: Consecutive days up to today with $\ge 1$ scrobble.
- `longestStreak`: Maximum consecutive active listening streak on record.
- `drySpells`: Longest gap intervals with zero listening activity.

```typescript
const streaks = await client.insights.getListeningStreaks({
  user: 'ansango',
});
console.log(`Current Streak: ${streaks.currentStreak} days (Longest: ${streaks.longestStreak} days)`);
```

---

### 14. `getListeningHeatmap` — Activity Density Grids
Produces daily scrobble counts and maps them to normalized intensity levels ($0 \dots 4$) suitable for GitHub-style calendar contribution representations.

```typescript
const heatmap = await client.insights.getListeningHeatmap({
  user: 'ansango',
  days: 365,
});
```

---

### 15. `getAlbumHabits` — Sequential Cohesion & Completion
Analyzes chronological scrobbles for sequential track numbering within the same album, calculating:
- `cohesionScore`: Percentage of tracks listened in sequential album order ($0 \dots 100$).
- `listenerType`: `Album Purist` vs `Playlist Shuffler`.

```typescript
const habits = await client.insights.getAlbumHabits({
  user: 'ansango',
  minSessionTracks: 3,
});
```

---

### 16. `getGenreBreakdown` — HHI Market Concentration & Tag Cleaning
Aggregates community tags from top artists, eliminates noise (e.g., `'seen live'`, `'favorites'`), normalizes percentages, and computes the Herfindahl-Hirschman Index:

$$\text{HHI} = \sum_{i=1}^{K} (s_i \times 100)^2 \quad \text{where } s_i = \text{genre share}$$

```typescript
const genres = await client.insights.getGenreBreakdown({
  user: 'ansango',
  limit: 10,
});
console.log(`HHI Concentration: ${genres.hhi}`);
```

---

### 17. `getGenreEvolution` — Macro Shift Tracking
Calculates structural shifts in genre percentages between two distinct time periods, highlighting expanding, contracting, and emerging musical genres.

```typescript
const evolution = await client.insights.getGenreEvolution({
  user: 'ansango',
  currentPeriod: '1month',
  previousPeriod: '12month',
});
```

---

### 18. `getSmartRecommendations` — Seeded Graph Traversal
Explores the Last.fm similarity network starting from the user's top $N$ artists, filtering out all artists already present in the user's library and ranking recommendations by cumulative similarity weight.

```typescript
const recs = await client.insights.getSmartRecommendations({
  user: 'ansango',
  seedLimit: 5,
  maxResults: 10,
});
```

---

### 19. `getBridgeArtists` — Cross-Genre Connectors
Finds artists that simultaneously rank in two distinct tag spaces (e.g., `'post-punk'` and `'electronic'`), scoring their connectivity using the geometric mean of their ranks in both spaces:

$$\text{bridgeScore} = \sqrt{\text{rank}_A \times \text{rank}_B}$$

```typescript
const bridges = await client.insights.getBridgeArtists({
  tagA: 'post-punk',
  tagB: 'electronic',
  limit: 10,
});
```

---

### 20. `compareTasteGroup` — Multi-User Consensus & Outlier Clustering
Compares a group of 3 to 10 users simultaneously:
- Calculates the full pairwise $N \times N$ Jaccard similarity matrix.
- Identifies **Consensus Artists** listened to by all or most group members.
- Identifies the **Taste Anchor** (user with highest average compatibility to the group) and the **Eclectic Outlier** (user with most unique/divergent taste).

```typescript
const group = await client.insights.compareTasteGroup({
  users: ['alice', 'bob', 'carol', 'dave'],
  period: '1month',
  limit: 50,
});
console.log(`Group Taste Anchor: ${group.tasteAnchor}`);
console.log(`Eclectic Outlier: ${group.outlier}`);
```
