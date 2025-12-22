import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Gamepad2, Monitor, Youtube, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppItem {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  hoverBg: string;
  path: string;
}

const apps: AppItem[] = [
  { id: "watch", name: "Watch", icon: Film, color: "text-nipflix", hoverBg: "hover:bg-nipflix/10", path: "/watch" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-youtube", hoverBg: "hover:bg-youtube/10", path: "/youtube" },
  { id: "tv", name: "TV", icon: Monitor, color: "text-tv", hoverBg: "hover:bg-tv/10", path: "/tv" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "text-retro", hoverBg: "hover:bg-retro/10", path: "/gaming" },
];

interface AppSidebarProps {
  onAppHover: (appId: string | null) => void;
  hoveredApp: string | null;
}

const AppSidebar = ({ onAppHover, hoveredApp }: AppSidebarProps) => {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [hasFocus, setHasFocus] = useState(false);

  const navigateToApp = useCallback((index: number) => {
    if (index >= 0 && index < apps.length) {
      navigate(apps[index].path);
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!hasFocus) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev >= apps.length - 1 ? 0 : prev + 1;
          onAppHover(apps[next].id);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev <= 0 ? apps.length - 1 : prev - 1;
          onAppHover(apps[next].id);
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        navigateToApp(focusedIndex);
        break;
    }
  }, [hasFocus, focusedIndex, onAppHover, navigateToApp]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleFocus = () => {
    setHasFocus(true);
    if (focusedIndex === -1) {
      setFocusedIndex(0);
      onAppHover(apps[0].id);
    }
  };

  const handleBlur = () => {
    setHasFocus(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav 
        className="fixed left-0 top-0 h-full w-20 z-40 flex flex-col items-center py-8 outline-none"
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* App Icons */}
        <div className="flex flex-col items-center gap-1 mt-16">
          {apps.map((app, index) => {
            const isHovered = hoveredApp === app.id;
            const isFocused = hasFocus && focusedIndex === index;
            const isActive = isHovered || isFocused;
            const Icon = app.icon;
            
            return (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-xl",
                      "transition-all duration-300 ease-out",
                      "text-foreground/40",
                      app.hoverBg,
                      isActive && `${app.color} scale-110 bg-foreground/5`
                    )}
                    onMouseEnter={() => {
                      onAppHover(app.id);
                      setFocusedIndex(index);
                    }}
                    onMouseLeave={() => onAppHover(null)}
                    onClick={() => navigate(app.path)}
                  >
                    {/* Subtle glow on hover/focus */}
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-xl transition-opacity duration-300",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                      style={{
                        boxShadow: isActive ? `0 0 20px hsl(var(--${app.id === 'watch' ? 'nipflix' : app.id}) / 0.3)` : 'none'
                      }}
                    />
                    
                    <Icon 
                      className={cn(
                        "relative w-5 h-5 transition-all duration-300",
                        isActive && app.color
                      )} 
                      strokeWidth={1.5} 
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={12}
                  className="bg-background/90 backdrop-blur-md border-border/30 text-foreground/90 text-sm font-medium"
                >
                  {app.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default AppSidebar;
