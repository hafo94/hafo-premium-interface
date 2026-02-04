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
import { useFocus } from "@/contexts/FocusContext";

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
  series: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "drama", icon: Film, label: "Drama" },
    { id: "comedy", icon: Tv, label: "Comedy" },
    { id: "scifi", icon: Clapperboard, label: "Sci-Fi" },
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
  series: "nipflix",
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
  const { 
    activeZone, 
    sidebarIndex, 
    setSidebarIndex, 
    focusHeader, 
    focusContent,
    setActiveZone,
    isSidebarExpanded
  } = useFocus();

  const isSidebarFocused = activeZone === "sidebar";
  const [isHovered, setIsHovered] = useState(false);
  
  // Sidebar expands when focused or hovered
  const isExpanded = isSidebarExpanded || isHovered;

  // If no items, don't render
  if (items.length === 0) {
    return null;
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if sidebar is focused
      if (!isSidebarFocused) return;

      // Don't handle if in input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (sidebarIndex === 0) {
            // At top, go to header
            focusHeader();
          } else {
            setSidebarIndex(sidebarIndex - 1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (sidebarIndex < items.length - 1) {
            setSidebarIndex(sidebarIndex + 1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          // Move to content area
          focusContent();
          break;
        case "Enter":
          e.preventDefault();
          onItemSelect(items[sidebarIndex].id);
          break;
      }
    },
    [items, sidebarIndex, onItemSelect, isSidebarFocused, focusHeader, focusContent, setSidebarIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset focused index when mode changes
  useEffect(() => {
    setSidebarIndex(1); // Default to "home"
  }, [mode, setSidebarIndex]);

  // Sync sidebarIndex with activeItem
  useEffect(() => {
    const idx = items.findIndex((item) => item.id === activeItem);
    if (idx !== -1) {
      setSidebarIndex(idx);
    }
  }, [activeItem, items, setSidebarIndex]);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-full z-40",
        "flex flex-col pt-20 pb-8",
        "transition-all duration-300 ease-out",
        "bg-gradient-to-b from-background/80 via-background/60 to-background/80",
        "backdrop-blur-xl border-r border-border/20",
        isExpanded ? "w-52 px-4" : "w-16 px-2"
      )}
    >
      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 mt-4">
        {items.map((item, index) => {
          const isActive = activeItem === item.id;
          const isFocused = isSidebarFocused && sidebarIndex === index;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveZone("sidebar");
                setSidebarIndex(index);
                onItemSelect(item.id);
              }}
              onMouseEnter={() => {
                if (isSidebarFocused) {
                  setSidebarIndex(index);
                }
              }}
              className={cn(
                "relative flex items-center rounded-xl",
                "text-sm font-medium transition-all duration-200",
                "outline-none",
                isExpanded ? "gap-3 px-4 py-3" : "justify-center px-2 py-3",
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
                className={cn("w-5 h-5 flex-shrink-0", isActive && `text-${color}`)}
                strokeWidth={1.5}
              />
              {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}

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
                <div className="absolute inset-0 rounded-xl ring-2 ring-foreground/20" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard hint - only show when expanded */}
      {isExpanded && (
        <div className="mt-auto pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground/50 text-center">
            ↑↓ Navigate • → Content • Enter Select
          </p>
        </div>
      )}
    </aside>
  );
};

export default ModeSidebar;
