import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useFocus } from "@/contexts/FocusContext";

export type AppMode = "movies" | "tv" | "games";

interface ModeHeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const modes = [
  { id: "movies" as AppMode, label: "Movies", color: "nipflix" },
  { id: "tv" as AppMode, label: "TV", color: "tv" },
  { id: "games" as AppMode, label: "Games", color: "retro" },
];

const ModeHeader = ({ activeMode, onModeChange }: ModeHeaderProps) => {
  const { activeZone, headerIndex, setHeaderIndex, focusSidebar, focusContent, setActiveZone } = useFocus();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isHeaderFocused = activeZone === "header";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update indicator position when active mode changes
  useEffect(() => {
    const activeIndex = modes.findIndex((m) => m.id === activeMode);
    const activeButton = buttonRefs.current[activeIndex];
    const nav = navRef.current;

    if (activeButton && nav) {
      const navRect = nav.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeMode]);

  // Sync header index with active mode
  useEffect(() => {
    const idx = modes.findIndex((m) => m.id === activeMode);
    setHeaderIndex(idx);
  }, [activeMode, setHeaderIndex]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // When header is focused, Left/Right navigate tabs without Alt
      if (isHeaderFocused) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          const newIndex = headerIndex > 0 ? headerIndex - 1 : modes.length - 1;
          setHeaderIndex(newIndex);
          onModeChange(modes[newIndex].id);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          const newIndex = headerIndex < modes.length - 1 ? headerIndex + 1 : 0;
          setHeaderIndex(newIndex);
          onModeChange(modes[newIndex].id);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          // Move directly to content
          focusContent();
        } else if (e.key === "Enter") {
          e.preventDefault();
          onModeChange(modes[headerIndex].id);
        }
      } else {
        // Alt + Left/Right from any zone for quick mode switching
        if (e.key === "ArrowLeft" && e.altKey) {
          e.preventDefault();
          const newIndex = headerIndex > 0 ? headerIndex - 1 : modes.length - 1;
          setHeaderIndex(newIndex);
          onModeChange(modes[newIndex].id);
        } else if (e.key === "ArrowRight" && e.altKey) {
          e.preventDefault();
          const newIndex = headerIndex < modes.length - 1 ? headerIndex + 1 : 0;
          setHeaderIndex(newIndex);
          onModeChange(modes[newIndex].id);
        }
      }
    },
    [isHeaderFocused, headerIndex, onModeChange, setHeaderIndex, focusSidebar, focusContent, activeZone]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeColor = modes.find((m) => m.id === activeMode)?.color || "nipflix";

  return (
    <header className="relative flex items-center justify-between px-8 py-5 z-50">
      {/* Left: Logo */}
      <h1 className="text-xl font-light tracking-[0.35em] text-gradient animate-breathe">
        hafo
      </h1>

      {/* Center: Navigation */}
      <nav
        ref={navRef}
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10"
      >
        {modes.map((mode, index) => {
          const isActive = activeMode === mode.id;
          const isFocused = isHeaderFocused && headerIndex === index;

          return (
            <button
              key={mode.id}
              ref={(el) => (buttonRefs.current[index] = el)}
              onClick={() => {
                setActiveZone("header");
                setHeaderIndex(index);
                onModeChange(mode.id);
              }}
              className={cn(
                "relative py-2 text-sm font-light tracking-[0.2em] uppercase",
                "transition-all duration-300 ease-out",
                "focus:outline-none",
                isActive
                  ? `text-${mode.color}`
                  : "text-muted-foreground hover:text-foreground/80",
                isFocused && !isActive && "text-foreground"
              )}
              style={{
                textShadow: isActive
                  ? `0 0 20px hsl(var(--${mode.color}) / 0.5)`
                  : isFocused
                  ? `0 0 10px hsl(var(--foreground) / 0.3)`
                  : "none",
              }}
            >
              {mode.label}
              
              {/* Focus indicator ring for header focus */}
              {isFocused && (
                <span 
                  className="absolute -inset-x-3 -inset-y-1 rounded-lg ring-2 ring-foreground/30"
                  style={{
                    boxShadow: `0 0 15px hsl(var(--${mode.color}) / 0.3)`,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Animated underline indicator */}
        <span
          className={cn(
            "absolute -bottom-1 h-0.5 rounded-full",
            "transition-all duration-300 ease-out",
            `bg-${activeColor}`
          )}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            boxShadow: `0 0 12px hsl(var(--${activeColor}) / 0.6), 0 0 4px hsl(var(--${activeColor}) / 0.4)`,
          }}
        />
      </nav>

      {/* Right: Time/Date */}
      <div className="text-right hidden sm:block">
        <div className="text-base font-light tracking-wide text-foreground/60 tabular-nums">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs font-light text-foreground/35 tracking-wider">
          {formatDate(currentTime)}
        </div>
      </div>
    </header>
  );
};

export default ModeHeader;
