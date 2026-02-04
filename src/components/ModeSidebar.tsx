import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Home,
  Star,
  Clapperboard,
  Layers,
  List,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppMode } from "./ModeHeader";
import { useFocus } from "@/contexts/FocusContext";
import { movieGenres, seriesGenres } from "@/data/genreConfig";

interface SidebarItem {
  id: string;
  icon?: LucideIcon;
  label: string;
  isCategory?: boolean;
  children?: { id: string; label: string }[];
}

const buildSidebarConfig = (): Record<AppMode, SidebarItem[]> => ({
  movies: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "popular", icon: Star, label: "Popular" },
    { id: "cinema", icon: Clapperboard, label: "On Cinema" },
    {
      id: "categories",
      icon: Layers,
      label: "Categories",
      isCategory: true,
      children: movieGenres.map((g) => ({ id: `genre-${g.id}`, label: g.label })),
    },
  ],
  series: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "popular", icon: Star, label: "Popular" },
    { id: "on-air", icon: Clapperboard, label: "On Air" },
    {
      id: "categories",
      icon: Layers,
      label: "Categories",
      isCategory: true,
      children: seriesGenres.map((g) => ({ id: `genre-${g.id}`, label: g.label })),
    },
  ],
  tv: [
    { id: "search", icon: Search, label: "Search" },
    { id: "home", icon: Home, label: "Home" },
    { id: "all-channels", icon: List, label: "All Channels" },
  ],
  games: [],
});

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

// Flatten items for keyboard navigation
const flattenItems = (items: SidebarItem[]): { id: string; label: string; isHeader?: boolean }[] => {
  const result: { id: string; label: string; isHeader?: boolean }[] = [];
  for (const item of items) {
    result.push({ id: item.id, label: item.label, isHeader: item.isCategory });
    if (item.children) {
      for (const child of item.children) {
        result.push({ id: child.id, label: child.label });
      }
    }
  }
  return result;
};

const ModeSidebar = ({ mode, activeItem, onItemSelect }: ModeSidebarProps) => {
  const sidebarConfig = useMemo(() => buildSidebarConfig(), []);
  const items = sidebarConfig[mode];
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const color = modeColors[mode];
  const {
    activeZone,
    sidebarIndex,
    setSidebarIndex,
    focusHeader,
    focusContent,
    setActiveZone,
    isSidebarExpanded,
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
      if (!isSidebarFocused) return;

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
            focusHeader();
          } else {
            setSidebarIndex(sidebarIndex - 1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (sidebarIndex < flatItems.length - 1) {
            setSidebarIndex(sidebarIndex + 1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          focusContent();
          break;
        case "Enter":
          e.preventDefault();
          const currentItem = flatItems[sidebarIndex];
          // Don't select category headers, only their children or regular items
          if (currentItem && !currentItem.isHeader) {
            onItemSelect(currentItem.id);
          }
          break;
      }
    },
    [flatItems, sidebarIndex, onItemSelect, isSidebarFocused, focusHeader, focusContent, setSidebarIndex]
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
    const idx = flatItems.findIndex((item) => item.id === activeItem);
    if (idx !== -1) {
      setSidebarIndex(idx);
    }
  }, [activeItem, flatItems, setSidebarIndex]);

  // Render a single item (main or child)
  const renderItem = (
    item: { id: string; label: string; isHeader?: boolean },
    flatIndex: number,
    icon?: LucideIcon,
    isChild = false
  ) => {
    const isActive = activeItem === item.id;
    const isFocused = isSidebarFocused && sidebarIndex === flatIndex;
    const Icon = icon;

    return (
      <button
        key={item.id}
        onClick={() => {
          if (!item.isHeader) {
            setActiveZone("sidebar");
            setSidebarIndex(flatIndex);
            onItemSelect(item.id);
          }
        }}
        onMouseEnter={() => {
          if (isSidebarFocused) {
            setSidebarIndex(flatIndex);
          }
        }}
        className={cn(
          "relative flex items-center rounded-xl",
          "text-sm font-medium transition-all duration-200",
          "outline-none w-full",
          isExpanded
            ? isChild
              ? "gap-2 pl-10 pr-4 py-2"
              : "gap-3 px-4 py-3"
            : "justify-center px-2 py-2",
          isChild && "text-xs",
          item.isHeader && "cursor-default",
          isActive
            ? `text-${color} bg-${color}/10`
            : isFocused
            ? "text-foreground bg-foreground/5"
            : isChild
            ? "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        )}
        style={{
          boxShadow:
            isActive || isFocused
              ? `inset 0 0 20px hsl(var(--${color}) / ${isActive ? 0.15 : 0.05})`
              : "none",
        }}
      >
        {Icon && (
          <Icon
            className={cn("w-5 h-5 flex-shrink-0", isActive && `text-${color}`)}
            strokeWidth={1.5}
          />
        )}
        {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}

        {/* Active indicator */}
        {isActive && !item.isHeader && (
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
        {isFocused && !isActive && !item.isHeader && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-foreground/20" />
        )}
      </button>
    );
  };

  // Build flat render list with proper indices
  let flatIndex = 0;
  const renderContent: JSX.Element[] = [];

  for (const item of items) {
    const currentFlatIndex = flatIndex;
    renderContent.push(
      renderItem(
        { id: item.id, label: item.label, isHeader: item.isCategory },
        currentFlatIndex,
        item.icon,
        false
      )
    );
    flatIndex++;

    if (item.children) {
      // Only render children when expanded
      if (isExpanded) {
        for (const child of item.children) {
          const childFlatIndex = flatIndex;
          renderContent.push(
            renderItem(
              { id: child.id, label: child.label },
              childFlatIndex,
              undefined,
              true
            )
          );
          flatIndex++;
        }
      } else {
        // Skip children in flatIndex when collapsed
        flatIndex += item.children.length;
      }
    }
  }

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
        "overflow-y-auto scrollbar-hide",
        isExpanded ? "w-52 px-4" : "w-16 px-2"
      )}
    >
      {/* Navigation Items */}
      <nav className="flex flex-col gap-0.5 mt-4">{renderContent}</nav>

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
