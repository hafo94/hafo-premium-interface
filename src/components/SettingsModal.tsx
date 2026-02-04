import { useState } from "react";
import { Moon, Sun, Monitor, Bell, BellOff, Volume2, Eye, Palette, Wifi, Tv } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IPTVSettings from "@/components/settings/IPTVSettings";
import KodiSettings from "@/components/settings/KodiSettings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Theme = "dark" | "light" | "system";

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [notifications, setNotifications] = useState({
    enabled: true,
    sound: true,
    newContent: true,
    updates: false,
  });
  const [preferences, setPreferences] = useState({
    autoplay: true,
    highQuality: true,
    animations: true,
  });

  const themeOptions: { value: Theme; label: string; icon: typeof Moon }[] = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-light tracking-wide">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general" className="text-xs">
              <Palette className="w-3 h-3 mr-1.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="iptv" className="text-xs">
              <Wifi className="w-3 h-3 mr-1.5" />
              IPTV
            </TabsTrigger>
            <TabsTrigger value="kodi" className="text-xs">
              <Tv className="w-3 h-3 mr-1.5" />
              Kodi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Theme Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70 uppercase tracking-wider">
                <Palette className="w-4 h-4" strokeWidth={1.5} />
                <span>Theme</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                        theme === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-secondary/30 text-foreground/60 hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Notifications Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70 uppercase tracking-wider">
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                <span>Notifications</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled" className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                    {notifications.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    Enable Notifications
                  </Label>
                  <Switch
                    id="notifications-enabled"
                    checked={notifications.enabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-sound" className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                    <Volume2 className="w-4 h-4" />
                    Sound Effects
                  </Label>
                  <Switch
                    id="notification-sound"
                    checked={notifications.sound}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sound: checked })}
                    disabled={!notifications.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="new-content" className="text-sm text-foreground/80 cursor-pointer">
                    New Content Alerts
                  </Label>
                  <Switch
                    id="new-content"
                    checked={notifications.newContent}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newContent: checked })}
                    disabled={!notifications.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="updates" className="text-sm text-foreground/80 cursor-pointer">
                    App Updates
                  </Label>
                  <Switch
                    id="updates"
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, updates: checked })}
                    disabled={!notifications.enabled}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/70 uppercase tracking-wider">
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                <span>Preferences</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoplay" className="text-sm text-foreground/80 cursor-pointer">
                      Autoplay Content
                    </Label>
                    <p className="text-xs text-foreground/40">Automatically play next episode</p>
                  </div>
                  <Switch
                    id="autoplay"
                    checked={preferences.autoplay}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoplay: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-quality" className="text-sm text-foreground/80 cursor-pointer">
                      High Quality Streaming
                    </Label>
                    <p className="text-xs text-foreground/40">Uses more bandwidth</p>
                  </div>
                  <Switch
                    id="high-quality"
                    checked={preferences.highQuality}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, highQuality: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations" className="text-sm text-foreground/80 cursor-pointer">
                      UI Animations
                    </Label>
                    <p className="text-xs text-foreground/40">Enable motion effects</p>
                  </div>
                  <Switch
                    id="animations"
                    checked={preferences.animations}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, animations: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="iptv" className="max-h-[60vh] overflow-y-auto pr-2">
            <IPTVSettings />
          </TabsContent>

          <TabsContent value="kodi" className="max-h-[60vh] overflow-y-auto pr-2">
            <KodiSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
