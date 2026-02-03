import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Home,
  TrendingUp,
  Film,
  Tv,
  Clapperboard,
  List,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppMode } from "./ModeHeader";

interface SidebarItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const sidebarConfig: Record<AppMode, SidebarItem[]> = {
  movies: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "series", icon: Tv, label: "Series" },
    { id: "cinema", icon: Clapperboard, label: "On Cinema" },
  ],
  tv: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "all-channels", icon: List, label: "All Channels" },
  ],
  games: [], // Empty = hidden sidebar
};

const modeColors: Record<AppMode, string> = {
  movies: "nipflix",
  tv: "tv",
  games: "retro",
};

interface ModeSidebarProps {
  mode: AppMode;
  activeItem: string;
  onItemSelect: (itemId: string) => void;
}

const ModeSidebar = ({ mode, activeItem, onItemSelect }: ModeSidebarProps) => {
  const items = sidebarConfig[mode];
  const color = modeColors[mode];
  const [focusedIndex, setFocusedIndex] = useState(0);

  // If no items, don't render
  if (items.length === 0) {
    return null;
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if sidebar has items
      if (items.length === 0) return;

      // Don't handle if in input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          if (!e.altKey) {
            e.preventDefault();
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : items.length - 1
            );
          }
          break;
        case "ArrowDown":
          if (!e.altKey) {
            e.preventDefault();
            setFocusedIndex((prev) =>
              prev < items.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "Enter":
          e.preventDefault();
          onItemSelect(items[focusedIndex].id);
          break;
      }
    },
    [items, focusedIndex, onItemSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset focused index when mode changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [mode]);

  // Sync focusedIndex with activeItem
  useEffect(() => {
    const idx = items.findIndex((item) => item.id === activeItem);
    if (idx !== -1) {
      setFocusedIndex(idx);
    }
  }, [activeItem, items]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-52 z-40",
        "flex flex-col pt-20 pb-8 px-4",
        "transition-all duration-300 ease-out",
        "bg-gradient-to-b from-background/80 via-background/60 to-background/80",
        "backdrop-blur-xl border-r border-border/20"
      )}
    >
      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 mt-4">
        {items.map((item, index) => {
          const isActive = activeItem === item.id;
          const isFocused = focusedIndex === index;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl",
                "text-sm font-medium transition-all duration-200",
                "outline-none",
                isActive
                  ? `text-${color} bg-${color}/10`
                  : isFocused
                  ? "text-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
              style={{
                boxShadow:
                  isActive || isFocused
                    ? `inset 0 0 20px hsl(var(--${color}) / ${isActive ? 0.15 : 0.05})`
                    : "none",
              }}
            >
              <Icon
                className={cn("w-5 h-5", isActive && `text-${color}`)}
                strokeWidth={1.5}
              />
              <span>{item.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                    `bg-${color}`
                  )}
                  style={{
                    boxShadow: `0 0 10px hsl(var(--${color}) / 0.5)`,
                  }}
                />
              )}

              {/* Focus ring */}
              {isFocused && !isActive && (
                <div className="absolute inset-0 rounded-xl ring-1 ring-foreground/10" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard hint */}
      <div className="mt-auto pt-4 border-t border-border/20">
        <p className="text-xs text-muted-foreground/50 text-center">
          ↑↓ Navigate • Enter Select
        </p>
      </div>
    </aside>
  );
};

export default ModeSidebar;
