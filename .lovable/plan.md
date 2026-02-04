

# Full Arrow Key & TV Remote Navigation

## Overview
Create a unified, TV-first navigation system that allows the entire app to be controlled with arrow keys and Enter - perfect for TV remotes on your Raspberry Pi. The system will manage focus across all UI zones (header, sidebar, content) seamlessly.

## Current State Analysis

| Component | Arrow Key Support | Status |
|-----------|------------------|--------|
| ModeHeader | Alt + Left/Right only | Partial (needs Alt) |
| ModeSidebar | Up/Down + Enter | Working |
| MoviesContent | Full grid navigation | Working |
| TVContent | No arrow navigation | Missing |
| GamesContent | No keyboard support | Missing |
| TVPlayer | Full keyboard support | Working |

**The core issue**: Each component handles its own keyboard events independently, leading to conflicts. We need a unified focus manager.

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Focus Manager (Context)                 │
│                                                             │
│   Tracks: activeZone = 'header' | 'sidebar' | 'content'    │
│                                                             │
│   Rules:                                                    │
│   • ArrowUp from content row 0 → focus sidebar/header       │
│   • ArrowLeft from sidebar → stay (wrap)                    │
│   • ArrowRight from sidebar → focus content                 │
│   • Enter anywhere → activate focused item                  │
│   • Escape → go back one level                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌──────────┐          ┌─────────┐
   │ Header  │◄─────────│ Sidebar  │◄─────────│ Content │
   │  tabs   │          │  items   │          │  grid   │
   └─────────┘          └──────────┘          └─────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                     Left/Right switches
                     between header tabs
```

## Implementation Plan

### 1. Create Focus Manager Context
New file: `src/contexts/FocusContext.tsx`

- Create a context to track which zone is currently focused: `header` | `sidebar` | `content`
- Track focused indices within each zone
- Provide methods to move focus between zones
- Remember last focused item when returning to a zone

### 2. Update Header Navigation
Modify: `src/components/ModeHeader.tsx`

- Remove Alt key requirement (plain Left/Right when header is focused)
- Accept focus from FocusContext
- Add visual focus indicator (subtle glow/ring) on focused tab
- Arrow Down → move focus to sidebar or content
- Left/Right → switch tabs directly

### 3. Update Sidebar Navigation  
Modify: `src/components/ModeSidebar.tsx`

- Already has Up/Down/Enter - keep this working
- Add: Arrow Right → focus content area
- Add: Arrow Up from top item → focus header
- Show clear focus state (already has this)

### 4. Add TV Content Navigation
Modify: `src/components/content/TVContent.tsx`

- Add grid navigation for channel cards (Left/Right/Up/Down)
- Track focused channel index
- Enter → select channel and open player
- Arrow Left at first column → focus sidebar
- Arrow Up at top row → focus sidebar

### 5. Add Games Content Navigation
Modify: `src/components/content/GamesContent.tsx`

- Simple Up/Down between two buttons (Retro/Steam)
- Enter → navigate to selected page
- Left → focus header (no sidebar in games mode)
- Show focus ring on selected button

### 6. Update UnifiedHome with Focus Provider
Modify: `src/components/UnifiedHome.tsx`

- Wrap app with FocusProvider
- Pass focus state to child components
- Handle global navigation between zones

## Keyboard Mapping (TV Remote Compatible)

| Key | Action |
|-----|--------|
| ← → | Navigate horizontally / Switch header tabs |
| ↑ ↓ | Navigate vertically / Move between zones |
| Enter | Select / Activate focused item |
| Escape | Go back / Close overlay |
| Backspace | Go back (alternative to Escape) |

**TV Remote Mapping** (most remotes send these keys):
- D-pad → Arrow keys
- OK/Select → Enter
- Back → Escape or Backspace
- Menu → Could open settings overlay

## Visual Focus Indicators

All focusable elements will have clear visual states:

1. **Header tabs**: Underline + glow when focused (not just when active)
2. **Sidebar items**: Background highlight + left border when focused
3. **Channel cards**: Ring + scale up when focused
4. **Game buttons**: Ring + glow when focused
5. **Content tiles**: Ring + scale up (already exists in Movies)

## Technical Details

### Focus Flow Logic
```typescript
// When ArrowRight is pressed in sidebar:
if (activeZone === 'sidebar') {
  setActiveZone('content');
  // Content remembers its last focused item
}

// When ArrowUp is pressed at top of content:
if (activeZone === 'content' && focusedRow === 0) {
  setActiveZone('sidebar');
}

// When ArrowUp is pressed at top of sidebar:
if (activeZone === 'sidebar' && focusedIndex === 0) {
  setActiveZone('header');
}
```

### Auto-Focus on Load
- On app load: Focus starts on first content item (most common use case)
- After mode change: Focus moves to first content item in new mode
- After closing overlay: Focus returns to previously focused item

## Files to Create
1. `src/contexts/FocusContext.tsx` - Focus management context

## Files to Modify
1. `src/components/UnifiedHome.tsx` - Add FocusProvider wrapper
2. `src/components/ModeHeader.tsx` - Zone-aware focus, remove Alt requirement
3. `src/components/ModeSidebar.tsx` - Add Right arrow to content, Up to header
4. `src/components/content/TVContent.tsx` - Add full grid navigation
5. `src/components/content/GamesContent.tsx` - Add Up/Down between buttons
6. `src/components/tv/ChannelCard.tsx` - Add focus prop styling

## Navigation Diagram

```text
Games Mode (no sidebar):
┌──────────────────────────────────────┐
│         [Movies] [TV] [Games]        │  ← Left/Right
│              ↑                       │
│              ↓                       │
│    ┌──────────────────────────┐     │
│    │   [ Retro Games ]        │     │  ← Up/Down
│    │   [ Steam Link  ]        │     │
│    └──────────────────────────┘     │
└──────────────────────────────────────┘

Movies/TV Mode (with sidebar):
┌──────────────────────────────────────┐
│         [Movies] [TV] [Games]        │  ← Left/Right
│              ↑                       │
│    ↓─────────┴───────────↓          │
│  ┌──────┐    ┌───────────────────┐  │
│  │Search│ →  │ Content Grid      │  │
│  │Home  │ ←  │ [1][2][3][4][5]   │  │
│  │...   │    │ [A][B][C][D][E]   │  │
│  └──────┘    └───────────────────┘  │
│     ↑↓            ↑↓ ←→             │
└──────────────────────────────────────┘
```

## Testing Considerations
- Test with physical TV remote via Raspberry Pi
- Ensure focus is always visible (never lost)
- Test rapid key presses (debouncing if needed)
- Test all mode transitions
- Test overlay open/close focus restoration

