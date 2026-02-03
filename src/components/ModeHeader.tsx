import { useState, useEffect, useCallback } from "react";
import { Film, Monitor, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppMode = "movies" | "tv" | "games";

interface ModeHeaderProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const modes = [
  { id: "movies" as AppMode, label: "Movies", icon: Film, color: "nipflix" },
  { id: "tv" as AppMode, label: "TV", icon: Monitor, color: "tv" },
  { id: "games" as AppMode, label: "Games", icon: Gamepad2, color: "retro" },
];

const ModeHeader = ({ activeMode, onModeChange }: ModeHeaderProps) => {
  const [focusedIndex, setFocusedIndex] = useState(
    modes.findIndex((m) => m.id === activeMode)
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      // Only handle when not in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && e.altKey) {
        e.preventDefault();
        const newIndex = focusedIndex > 0 ? focusedIndex - 1 : modes.length - 1;
        setFocusedIndex(newIndex);
        onModeChange(modes[newIndex].id);
      } else if (e.key === "ArrowRight" && e.altKey) {
        e.preventDefault();
        const newIndex = focusedIndex < modes.length - 1 ? focusedIndex + 1 : 0;
        setFocusedIndex(newIndex);
        onModeChange(modes[newIndex].id);
      }
    },
    [focusedIndex, onModeChange]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Sync focusedIndex when activeMode changes externally
  useEffect(() => {
    setFocusedIndex(modes.findIndex((m) => m.id === activeMode));
  }, [activeMode]);

  return (
    <header className="relative flex items-center justify-between px-6 py-4 z-50">
      {/* Mode Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full glass">
        {modes.map((mode, index) => {
          const isActive = activeMode === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full",
                "text-sm font-medium transition-all duration-300",
                isActive
                  ? `text-${mode.color} bg-${mode.color}/10`
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
              style={{
                boxShadow: isActive
                  ? `0 0 20px hsl(var(--${mode.color}) / 0.3)`
                  : "none",
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{mode.label}</span>
              {isActive && (
                <span
                  className={cn(
                    "absolute inset-0 rounded-full opacity-20",
                    `bg-${mode.color}`
                  )}
                  style={{
                    background: `radial-gradient(circle at center, hsl(var(--${mode.color}) / 0.15) 0%, transparent 70%)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Side - Logo, Time */}
      <div className="flex items-center gap-6">
        {/* Time/Date Display */}
        <div className="text-right hidden sm:block">
          <div className="text-base font-normal tracking-wide text-foreground/70 tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs font-normal text-foreground/40 tracking-wider">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Logo */}
        <h1 className="text-xl font-light tracking-[0.35em] text-gradient animate-breathe">
          hafo
        </h1>
      </div>
    </header>
  );
};

export default ModeHeader;
