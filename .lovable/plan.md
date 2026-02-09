

# Fix IPTV Integration: Title Matching and Loading UX

## Root Cause Analysis

Two issues are causing the blank screen:

1. **UI blocked during load**: `iptvLoading` is included in the loading check, showing a skeleton for the entire duration of catalog fetching (potentially minutes with hundreds of categories). No content is visible during this time.

2. **Title matching never succeeds**: IPTV titles contain language/country prefixes like `"IN| TAMIL| Champion"`, `"US| EN| The Dark Knight"`. The current `normalizeTitle` only strips punctuation -- it doesn't remove these prefixes. So TMDB's `"champion"` never matches IPTV's `"in tamil champion"`.

## Solution

### Part 1: Fix Title Normalization (`src/hooks/useIPTVLibrary.ts`)

Strip common IPTV prefixes before matching. IPTV providers use patterns like:
- `"US| EN| Title"` or `"IN| TAMIL| Title"`
- `"[EN] Title"` or `"(HD) Title"`
- `"Title (2021)"` (year suffixes)

Update `normalizeTitle` to handle these, AND store **multiple lookup keys** per IPTV title (both the full cleaned name and the portion after the last `|` delimiter).

### Part 2: Don't Block UI (`src/components/content/MoviesContent.tsx` and `SeriesContent.tsx`)

- Remove `iptvLoading` from the loading check -- show TMDB content immediately
- When IPTV is still loading, show all TMDB content (unfiltered) so the page isn't blank
- Once IPTV loads, filter down to only matched titles
- Add a subtle indicator (e.g., small loading spinner in the corner) while IPTV catalog syncs in background

### Part 3: Smarter Matching (`src/hooks/useIPTVLibrary.ts`)

Instead of exact match only, also try:
- Substring match: if the IPTV title **contains** the TMDB title
- This catches `"US| EN| The Dark Knight"` matching TMDB's `"The Dark Knight"`

## Technical Details

### File: `src/hooks/useIPTVLibrary.ts`

**Change 1 -- Better title extraction**:

```typescript
function extractCleanTitle(rawTitle: string): string[] {
  // Split by | and take the last segment (the actual title)
  const parts = rawTitle.split('|');
  const lastPart = parts[parts.length - 1].trim();
  
  // Also try without year suffix: "Title (2021)" -> "Title"
  const withoutYear = lastPart.replace(/\s*\(\d{4}\)\s*$/, '').trim();
  
  const normalized = normalizeTitle(lastPart);
  const normalizedNoYear = normalizeTitle(withoutYear);
  
  const keys = [normalized];
  if (normalizedNoYear !== normalized) keys.push(normalizedNoYear);
  
  // Also add the full raw normalized (for titles without prefixes)
  const fullNormalized = normalizeTitle(rawTitle);
  if (fullNormalized !== normalized) keys.push(fullNormalized);
  
  return keys;
}
```

**Change 2 -- Build map with multiple keys per title**:

When building `vodMap` and `seriesMap`, insert each stream under ALL its extracted keys. This way `"The Dark Knight"` can be found whether the IPTV title is `"The Dark Knight"`, `"US| EN| The Dark Knight"`, or `"The Dark Knight (2008)"`.

**Change 3 -- Update `filterByIPTV` to not block when loading**:

```typescript
// When IPTV is still loading, return items unfiltered (show everything)
// When IPTV is ready but no matches, return empty (hide non-available)
const filterByIPTV = (items: WatchContent[]): WatchContent[] => {
  if (!iptvCredentials || isLoading) return items; // Show all while loading
  const enriched = enrichWithIPTV(items);
  return enriched.filter((item) => !!item.iptvId);
};
```

This part already works correctly -- the issue is just that movies/series content components include `iptvLoading` in their own loading check.

### File: `src/components/content/MoviesContent.tsx`

**Change -- Remove IPTV from loading gate (line 346)**:

```typescript
// BEFORE:
const isLoading = iptvLoading || (isGridView ? ... : homeLoading);

// AFTER:
const isLoading = isGridView
  ? (activeSection === "popular" && popularLoading) || ...
  : homeLoading;
```

Remove `iptvLoading` so TMDB content shows immediately. The `filterByIPTV` function already handles the loading state internally by returning all items while IPTV is loading.

### File: `src/components/content/SeriesContent.tsx`

Same change -- remove `iptvLoading` from the loading check.

## Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/useIPTVLibrary.ts` | Fix title normalization to strip IPTV prefixes; build multi-key lookup maps |
| `src/components/content/MoviesContent.tsx` | Remove `iptvLoading` from loading gate so content shows immediately |
| `src/components/content/SeriesContent.tsx` | Same as above |

