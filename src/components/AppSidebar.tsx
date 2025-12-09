import { useState } from "react";
import { Film, Tv, Gamepad2, Monitor, Music, Youtube, ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppItem {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  glowClass: string;
  badge?: string;
}

const apps: AppItem[] = [
  { id: "nipflix", name: "Nipflix", icon: Film, color: "text-nipflix", glowClass: "glow-nipflix", badge: "New" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-youtube", glowClass: "glow-youtube" },
  { id: "tv", name: "TV", icon: Tv, color: "text-tv", glowClass: "glow-tv" },
  { id: "retro", name: "Retro Gaming", icon: Gamepad2, color: "text-retro", glowClass: "glow-retro" },
  { id: "steam", name: "Steam Link", icon: Monitor, color: "text-steam", glowClass: "glow-steam" },
  { id: "spotify", name: "Spotify", icon: Music, color: "text-spotify", glowClass: "glow-spotify" },
];

interface AppSidebarProps {
  onAppHover: (appId: string | null) => void;
  hoveredApp: string | null;
}

const AppSidebar = ({ onAppHover, hoveredApp }: AppSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 bg-transparent"
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 glass-premium border-r border-border/20" />
      
      {/* Logo Header */}
      <SidebarHeader className="relative z-10 px-4 py-6">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <h1 className="text-xl font-light tracking-[0.35em] text-gradient animate-breathe">
              hafo
            </h1>
          )}
          {isCollapsed && (
            <span className="text-lg font-light tracking-widest text-gradient">h</span>
          )}
        </div>
      </SidebarHeader>

      {/* Separator */}
      <div className={cn(
        "mx-3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent",
        isCollapsed && "mx-2"
      )} />

      {/* Apps Menu */}
      <SidebarContent className="relative z-10 px-2 py-4">
        <SidebarMenu className="gap-2">
          {apps.map((app) => {
            const isHovered = hoveredApp === app.id;
            const Icon = app.icon;
            
            return (
              <SidebarMenuItem key={app.id}>
                <SidebarMenuButton
                  tooltip={app.name}
                  className={cn(
                    "group/app relative h-12 transition-all duration-300 rounded-xl",
                    "hover:bg-secondary/40 hover:backdrop-blur-sm",
                    isHovered && "bg-secondary/50 backdrop-blur-sm"
                  )}
                  onMouseEnter={() => onAppHover(app.id)}
                  onMouseLeave={() => onAppHover(null)}
                >
                  {/* Glow effect on hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                    isHovered && "opacity-100",
                    app.glowClass
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    isHovered ? `${app.color} scale-110` : "text-foreground/60"
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  
                  {/* Label (hidden when collapsed) */}
                  <span className={cn(
                    "relative font-medium transition-all duration-300",
                    isHovered ? "text-foreground" : "text-foreground/70",
                    isCollapsed && "opacity-0"
                  )}>
                    {app.name}
                  </span>
                  
                  {/* Badge */}
                  {app.badge && !isCollapsed && (
                    <span className="relative ml-auto px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-nipflix/20 text-nipflix">
                      {app.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Toggle Button */}
      <div className="relative z-10 mt-auto p-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
            "glass-premium hover:bg-secondary/40 transition-all duration-300",
            "text-foreground/50 hover:text-foreground/80"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wider">Collapse</span>
            </>
          )}
        </button>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
