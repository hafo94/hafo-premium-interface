

# Fix Navigation Centering + Region Filter for Now Playing

## 1. Scroll Hero into View on Focus

**File: `src/components/watch/FeaturedHero.tsx`**

- Add a `useRef` on the outer wrapper div
- Add a `useEffect` that calls `scrollIntoView({ behavior: 'smooth', block: 'center' })` when `isActive` becomes true
- This ensures the viewport centers on the hero when the user arrows up from the content grid

## 2. Scroll Header into View on Focus

**File: `src/components/ModeHeader.tsx`**

- Add a ref to the `<header>` element (line 129)
- Add a `useEffect` that calls `scrollIntoView({ behavior: 'smooth', block: 'start' })` when `isHeaderFocused` becomes true
- This ensures the page scrolls to the top when the user arrows up from the hero to the header

## 3. Add Region Filter to "Now Playing" and "On The Air"

**File: `supabase/functions/tmdb/index.ts`**

Update two endpoint URLs to include region parameters for both SE (Sweden) and US:

```typescript
case "now-playing":
  tmdbUrl = `${TMDB_BASE_URL}/movie/now_playing?page=${page}&region=SE|US`;
  break;
case "on-the-air":
  tmdbUrl = `${TMDB_BASE_URL}/tv/on_the_air?page=${page}&timezone=Europe/Stockholm`;
  break;
```

Note: TMDB's `region` parameter only accepts a single ISO 3166-1 code. To support both SE and US, the edge function will need to make two requests (one per region) and merge/deduplicate the results. Alternatively, if one region is "primary," we use that and fall back. The simplest reliable approach:

- Make two parallel fetches for `now_playing` with `region=SE` and `region=US`
- Merge results, deduplicate by movie ID
- Sort by popularity (descending) to maintain expected order
- Return combined results with correct `total_pages` / `total_results`

For `on-the-air`, TMDB does not support a `region` param but supports `timezone`. We can use `Europe/Stockholm` as the primary timezone.

Redeploy the `tmdb` edge function after changes.

## Files Changed

| File | Change |
|------|--------|
| `src/components/watch/FeaturedHero.tsx` | Add ref + scrollIntoView when `isActive` |
| `src/components/ModeHeader.tsx` | Add ref + scrollIntoView when header focused |
| `supabase/functions/tmdb/index.ts` | Dual-region fetch for now-playing (SE + US), timezone for on-the-air |

