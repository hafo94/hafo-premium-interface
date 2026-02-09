

# Fix Content Detail Popup Layout

## Problem

When clicking a title, the ContentDetail modal opens but the backdrop image (set to `aspect-video` = 16:9 ratio) takes up nearly the entire modal viewport. The title, buttons, description, cast, and other info are either overlaid on the dark gradient at the bottom of the image (hard to see) or pushed below the fold in a tiny scrollable area.

## Solution

Reduce the hero/backdrop area height and restructure the layout so all key information is immediately visible without scrolling:

### Changes to `src/components/watch/ContentDetail.tsx`

1. **Reduce backdrop height**: Replace `aspect-video` with a fixed max height (`h-[300px]` or `h-[35vh]`) so the image doesn't dominate the modal. This leaves ample room for the content info below.

2. **Move key metadata above the fold**: Ensure the following are all visible without scrolling:
   - Title and type badge (FILM/SERIES)
   - Action buttons (Play, Add to List, Like)
   - Year, runtime, rating, HD badge
   - Description/plot text
   - Cast (up to 3 actors)
   - Director (for movies)

3. **Keep scrollable area** for longer content: seasons/episodes and "More Like This" remain in the scrollable section below.

### Layout Structure (top to bottom)

```
+------------------------------------------+
| Backdrop image (35vh max)                |
| with gradient overlay                     |
|   [X close button]                       |
|   TYPE BADGE                             |
|   TITLE                                  |
|   [Play] [+] [Like]        [Volume]     |
+------------------------------------------+
| Year | Runtime | Rating | HD             |
| Description text...                      |
| Cast: Actor 1, Actor 2, Actor 3         |
| Director: Name (movies only)            |
+------------------------------------------+
| Seasons & Episodes (scrollable)          |
| More Like This (scrollable)             |
+------------------------------------------+
```

## Technical Details

### File: `src/components/watch/ContentDetail.tsx`

**Change 1 -- Backdrop sizing (line 128)**:
- From: `<div className="relative aspect-video flex-shrink-0">`
- To: `<div className="relative h-[300px] flex-shrink-0">`

This caps the image area at 300px instead of letting it scale to 16:9 ratio of the full modal width, which at `max-w-3xl` (768px) would be ~432px -- over half the 90vh modal.

**Change 2 -- Ensure image covers the reduced area**:
The `object-cover` class on the `<img>` already handles this, so the image will simply crop to fit the shorter container.

No other files need changes. The existing content (buttons, metadata, cast, director, description) is already coded correctly -- it's just being pushed out of view by the oversized backdrop.
