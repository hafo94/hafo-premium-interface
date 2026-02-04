
# Premium Header Navigation Redesign

## Overview
Redesign the mode navigation header to have a centered, seamless, high-end aesthetic. Replace the pill-button style with an elegant underline/indicator-based navigation that feels more integrated into the header bar, similar to premium streaming services like Apple TV+ or HBO Max.

## Current vs New Design

**Current Design:**
- Mode tabs on the left in a glass pill container
- Rounded pill buttons with background fills
- Time/logo on the right
- Feels like separate "buttons" rather than integrated navigation

**New Design:**
```text
+------------------------------------------------------------------+
|                                                                  |
|  hafo           Movies    TV    Games              12:30         |
|                   ═══                              Tue, Feb 4     |
|                                                                  |
+------------------------------------------------------------------+
```

- Logo anchored on the left as brand identity
- Navigation tabs centered with elegant typography
- Active state uses a subtle underline/indicator instead of background pills
- Time/date on the right (subtle, secondary)
- Clean horizontal layout with proper spacing

## Visual Style

### Tab Design
- No background containers or pills
- Text-only with generous letter-spacing
- Active tab: Accent color text + animated underline indicator
- Inactive tabs: Muted gray text with hover brightening
- Smooth sliding underline animation when switching tabs

### Typography
- Slightly larger, lighter font weight for elegance
- Tracking (letter-spacing) for premium feel
- Icons optional - can be removed for cleaner look or kept very subtle

### Underline Indicator
- Thin line (2px) positioned below the active tab text
- Animated to slide between tabs on change
- Uses mode-specific accent color with subtle glow
- Smooth spring-like transition (300ms ease-out)

## Technical Implementation

### File: `src/components/ModeHeader.tsx`

**Layout Changes:**
- Three-column grid layout: Logo | Center Nav | Time
- Use `justify-center` for the middle section
- Remove glass container around tabs

**Styling Changes:**
- Remove `rounded-full glass` container
- Remove `rounded-full` and background from individual buttons
- Add underline indicator with absolute positioning
- Use CSS transform to animate indicator position

**Indicator Animation:**
```typescript
// Calculate indicator position based on active tab
const indicatorStyle = {
  transform: `translateX(${activeIndex * tabWidth}px)`,
  width: `${activeTabWidth}px`,
};
```

### Updated Structure
```jsx
<header className="relative flex items-center justify-between px-8 py-5 z-50">
  {/* Left: Logo */}
  <h1 className="text-xl font-light tracking-[0.35em] text-gradient">
    hafo
  </h1>

  {/* Center: Navigation */}
  <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
    {modes.map((mode) => (
      <button className="relative text-sm tracking-wider uppercase ...">
        {mode.label}
      </button>
    ))}
    {/* Animated underline indicator */}
    <span className="absolute bottom-0 h-0.5 bg-current transition-all ..." />
  </nav>

  {/* Right: Time */}
  <div className="text-right ...">
    ...
  </div>
</header>
```

## Design Details

| Element | Current | New |
|---------|---------|-----|
| Container | Glass pill | No container (transparent) |
| Tab buttons | Rounded pills with bg | Text-only, no background |
| Active indicator | Background fill + glow | Underline bar + subtle glow |
| Icons | Visible with labels | Hidden or very subtle |
| Layout | Left-aligned tabs | Centered tabs |
| Logo position | Right side | Left side (brand anchor) |
| Spacing | Compact | More generous padding |

## Animation & Transitions
- Underline slides smoothly between tabs (transform)
- Text color fades on hover (opacity/color transition)
- Active tab gets subtle text glow matching accent color
- 300ms duration with ease-out easing for premium feel

## Files to Modify
1. `src/components/ModeHeader.tsx` - Complete redesign of layout and styling

## Keyboard Navigation
- Existing Alt + Arrow Left/Right shortcuts preserved
- Focus states updated to match new design (no ring, just color change)
