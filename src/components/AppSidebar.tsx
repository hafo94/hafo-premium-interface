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
}

const apps: AppItem[] = [
  { id: "watch", name: "Watch", icon: Film, color: "text-nipflix", hoverBg: "hover:bg-nipflix/10" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-youtube", hoverBg: "hover:bg-youtube/10" },
  { id: "tv", name: "TV", icon: Monitor, color: "text-tv", hoverBg: "hover:bg-tv/10" },
  { id: "retro", name: "Retro Gaming", icon: Gamepad2, color: "text-retro", hoverBg: "hover:bg-retro/10" },
  { id: "steam", name: "Steam Link", icon: Monitor, color: "text-steam", hoverBg: "hover:bg-steam/10" },
];

interface AppSidebarProps {
  onAppHover: (appId: string | null) => void;
  hoveredApp: string | null;
}

const AppSidebar = ({ onAppHover, hoveredApp }: AppSidebarProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <nav className="fixed left-0 top-0 h-full w-20 z-40 flex flex-col items-center py-8">
        {/* App Icons */}
        <div className="flex flex-col items-center gap-1 mt-16">
          {apps.map((app) => {
            const isHovered = hoveredApp === app.id;
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
                      isHovered && `${app.color} scale-110 bg-foreground/5`
                    )}
                    onMouseEnter={() => onAppHover(app.id)}
                    onMouseLeave={() => onAppHover(null)}
                  >
                    {/* Subtle glow on hover */}
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-xl transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-0"
                      )}
                      style={{
                        boxShadow: isHovered ? `0 0 20px hsl(var(--${app.id === 'series' ? 'nipflix' : app.id}) / 0.3)` : 'none'
                      }}
                    />
                    
                    <Icon 
                      className={cn(
                        "relative w-5 h-5 transition-all duration-300",
                        isHovered && app.color
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
