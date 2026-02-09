

# Content Detail Popup with In-Browser Playback

## Overview

Update the existing `ContentDetail` modal to show enriched movie/series info (header image, runtime, rating, description, year, up to 3 actors) and replace the Kodi-based "Play" button with an in-browser `StreamPlayer` that opens fullscreen within the modal.

## Changes

### 1. Update ContentDetail Modal (`src/components/watch/ContentDetail.tsx`)

The modal already exists and shows most required info. Changes needed:

- **Show actors**: The `cast` field is already fetched from TMDB details (up to 5 names). Display the first 3 actors in the metadata section as "Cast: Actor 1, Actor 2, Actor 3"
- **Show director** (for movies): Already available in `enrichedContent.director`
- **Replace Kodi playback with StreamPlayer**: Remove the Kodi dependency. When "Play" is pressed, show the `StreamPlayer` component fullscreen inside the modal (or as a fullscreen overlay). The stream URL comes from `content.streamUrl` (for IPTV content) or shows a "No stream available" message for TMDB-only content
- **Keep existing info**: Backdrop header image, title, year, runtime, rating (IMDb when available), genres, description, seasons/episodes, "More Like This"

### 2. Add Fullscreen Player State to ContentDetail

When the user clicks "Play":
- If `content.streamUrl` exists, transition the modal into a fullscreen player view using `StreamPlayer`
- Show a back button to return to the detail view
- Keyboard: Escape exits fullscreen player back to detail view, then Escape again closes the modal

### 3. Ensure All Click Points Open ContentDetail

Currently, clicking items in content rows and search results already calls `setSelectedContent()` which opens the modal. The hero's "Play" button also calls `onSelect(content)`. Verify all paths lead to the same `ContentDetail` popup:

- **Hero "Play" button** -- currently calls `onSelect` which opens ContentDetail (already works)
- **Hero "More Info" button** -- calls `onInfo` which also opens ContentDetail (already works)
- **Content row items** -- calls `onItemSelect` -> `setSelectedContent` (already works)
- **Search results** -- calls `onSelect` -> `setSelectedContent` (already works)

No routing changes needed -- all paths already converge on the `ContentDetail` modal.

## Technical Details

### Cast Display (in metadata section)
```
Cast: Tom Hardy, Charlize Theron, Nicholas Hoult
```
Uses `enrichedContent.cast?.slice(0, 3).join(', ')` -- data already available from TMDB details fetch.

### Player Integration
Replace the Kodi `handlePlay` function with a state toggle:
- `isPlayerOpen` state: when true, render `StreamPlayer` as a fullscreen overlay inside the modal
- Stream URL: use `content.streamUrl` directly (no proxy needed for playback)
- Controls: Space (play/pause), M (mute), F (fullscreen), Escape (back to detail)

### Files Changed

| File | Change |
|------|--------|
| `src/components/watch/ContentDetail.tsx` | Add cast/director display, replace Kodi with StreamPlayer, add fullscreen player state |

### What the Popup Will Show

1. **Header**: Full-width backdrop image with gradient overlay
2. **Title**: Large title text with type badge (FILM / SERIES)
3. **Metadata row**: Year, Runtime (formatted), Rating (IMDb preferred), HD badge
4. **Cast**: "Cast: Actor 1, Actor 2, Actor 3" (max 3)
5. **Director**: "Director: Name" (movies only)
6. **Description**: Plot text
7. **Action buttons**: Play, Add to List, Like, Mute
8. **Seasons/Episodes**: For series (existing)
9. **More Like This**: TMDB recommendations (existing)

