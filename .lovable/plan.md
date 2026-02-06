

# Add Settings Access Button to Header

## Problem

The `SettingsModal` component (with IPTV and Kodi configuration tabs) exists but is never rendered anywhere in the app. There is no UI element to open it.

## Solution

Add a subtle settings gear icon to the top-right corner of the header (in `ModeHeader.tsx`), next to the existing time/date display. Clicking it opens the `SettingsModal`.

## Changes

### File: `src/components/ModeHeader.tsx`

1. Import `Settings` icon from `lucide-react` and import `SettingsModal`
2. Add a `useState` for controlling the modal open/close state
3. Add a gear icon button to the right side of the header, placed before the time/date block
4. Render the `SettingsModal` component with the open state

The right side of the header will look like:

```text
[gear icon]  |  14:32
             |  Thu, Feb 6
```

The gear icon will be styled to match the existing minimal aesthetic -- subtle, low opacity, with a hover glow effect. It will also be keyboard-accessible for TV-remote navigation.

### Technical Details

- The settings button uses `text-foreground/40 hover:text-foreground/70` to stay subtle
- The `SettingsModal` is rendered inside `ModeHeader` with its own open/close state
- No other files need changes since `SettingsModal` already has all the IPTV and Kodi tabs built in

### Files Modified

| File | Change |
|------|--------|
| `src/components/ModeHeader.tsx` | Add settings button + render SettingsModal |

