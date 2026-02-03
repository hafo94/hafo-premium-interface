
# TV Player Fullscreen UI Improvements

## Overview
Enhance the TV Player with proper fullscreen controls including a visible back button, play/pause functionality, and fix various UI issues to create a polished viewing experience.

## Current Issues Found

| Issue | Description |
|-------|-------------|
| No back button | ESC key works but no visible back arrow in top-left |
| No play/pause | Essential control is completely missing |
| Settings button broken | Has no onClick handler |
| Progress bar unstable | Random value changes on every render |
| No channel prev/next | Only full channel list via ArrowUp |
| EPG won't open | Callback is empty in TVContent |
| No volume slider | Only mute toggle exists |

## Proposed Changes

### 1. Add Top-Left Back Button
- Add a back arrow button in the top-left corner
- Shows on overlay visible, matches the overlay fade animation
- Uses `ArrowLeft` or custom back icon
- Clickable for mouse/remote users

### 2. Add Play/Pause Control
- Add large center play/pause button (appears briefly on tap/click)
- Add play/pause in bottom control bar
- Toggle with Space key
- State: `isPaused` boolean

### 3. Add Channel Navigation
- Previous/Next channel buttons in the control bar
- Channel Up/Down with dedicated buttons
- Keyboard shortcuts: Page Up / Page Down for quick channel switch

### 4. Fix Settings Button
- Connect to a settings panel or quality selector
- Options: Video quality, Closed captions, Audio track

### 5. Fix Progress Bar
- Calculate progress based on program start/end time
- Use `useMemo` or `useState` to prevent re-renders
- Show actual program progress percentage

### 6. Enable EPG Opening
- Fix the empty callback in TVContent
- Pass proper `setShowEPG` state handler

### 7. Add Fullscreen Toggle
- Button in control bar to toggle browser fullscreen
- Use `document.fullscreenElement` API

## File Changes

### `src/components/tv/TVPlayer.tsx`
- Add back arrow button (top-left, visible with overlay)
- Add play/pause state and controls
- Add channel prev/next navigation
- Add fullscreen toggle
- Fix progress bar to use stable calculation
- Add more keyboard shortcuts (Space, Page Up/Down)
- Connect settings button to quality panel

### `src/components/content/TVContent.tsx`
- Fix EPG callback to properly open EPG grid
- Add state for EPG visibility

## New UI Layout

```text
+--------------------------------------------------+
|  [<- Back]                    [CH 1] LIVE (mini) |
|                                                  |
|                                                  |
|                   [PLAY/PAUSE]                   |
|                   (center tap)                   |
|                                                  |
|                                                  |
+--------------------------------------------------+
| [Progress Bar ============================----] |
|                                                  |
| 1 [SVT1] SVT1                                    |
|   * LIVE   Aktuellt                              |
|   20:00 - 20:30  |  News Program                 |
|                                                  |
| [<CH] [CH>]  [Mute] [Settings] [Fullscreen]      |
|                                                  |
| ^ Channels  v Guide  SPACE Play/Pause  ESC Exit  |
+--------------------------------------------------+
```

## Keyboard Shortcuts (Updated)
- **ESC / Backspace**: Exit player, go back
- **Space**: Play/Pause toggle
- **M**: Mute/Unmute
- **Arrow Up**: Open channel list
- **Arrow Down**: Open EPG guide
- **Page Up**: Previous channel
- **Page Down**: Next channel
- **F**: Toggle fullscreen
- **Left/Right**: Seek (future, for VOD)

## Technical Notes

### Progress Calculation
```typescript
const getProgress = () => {
  const now = new Date();
  const [startH, startM] = channel.currentProgram.startTime.split(':').map(Number);
  const [endH, endM] = channel.currentProgram.endTime.split(':').map(Number);
  
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const current = now.getHours() * 60 + now.getMinutes();
  
  return Math.min(100, Math.max(0, ((current - start) / (end - start)) * 100));
};
```

### Fullscreen API
```typescript
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
};
```

## Visual Design
- Back button: Semi-transparent pill with arrow icon
- Play/Pause: Large centered button (like YouTube)
- Channel buttons: Match existing control button style
- All buttons have hover states and focus rings for TV navigation
- Consistent with the premium dark glassmorphism theme
