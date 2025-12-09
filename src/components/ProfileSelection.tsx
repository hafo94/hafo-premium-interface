import { useState } from "react";
import { Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface ProfileSelectionProps {
  onSelectProfile: (profile: Profile) => void;
}

const avatarColors = [
  "from-nipflix to-red-700",
  "from-tv to-blue-700",
  "from-retro to-purple-700",
  "from-steam to-green-700",
  "from-spotify to-emerald-700",
];

const ProfileSelection = ({ onSelectProfile }: ProfileSelectionProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Admin", avatar: avatarColors[0] },
    { id: "2", name: "Guest", avatar: avatarColors[1] },
  ]);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      const newProfile: Profile = {
        id: Date.now().toString(),
        name: newProfileName.trim(),
        avatar: avatarColors[profiles.length % avatarColors.length],
      };
      setProfiles([...profiles, newProfile]);
      setNewProfileName("");
      setIsAddingProfile(false);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    setIsVisible(false);
    setTimeout(() => {
      onSelectProfile(profile);
    }, 500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-8 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="mb-16 text-center animate-fade-in-scale">
        <h1 className="text-4xl md:text-5xl font-extralight tracking-[0.2em] text-gradient mb-4">
          hafo
        </h1>
        <p className="text-muted-foreground text-lg font-light">Who's watching?</p>
      </div>

      {/* Profile Grid */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {profiles.map((profile, index) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="group flex flex-col items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${profile.avatar} 
                flex items-center justify-center transition-all duration-300 ease-out
                group-hover:scale-105 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]
                border border-border/30 group-hover:border-border/60`}
            >
              <User className="w-12 h-12 md:w-14 md:h-14 text-foreground/90" strokeWidth={1.5} />
            </div>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200 text-lg font-light">
              {profile.name}
            </span>
          </button>
        ))}

        {/* Add Profile Button */}
        <button
          onClick={() => setIsAddingProfile(true)}
          className="group flex flex-col items-center gap-4 animate-slide-up"
          style={{ animationDelay: `${profiles.length * 0.1}s` }}
        >
          <div
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-border
              flex items-center justify-center transition-all duration-300 ease-out
              group-hover:border-muted-foreground group-hover:bg-secondary/50"
          >
            <Plus className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
          </div>
          <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200 text-lg font-light">
            Add Profile
          </span>
        </button>
      </div>

      {/* Add Profile Dialog */}
      <Dialog open={isAddingProfile} onOpenChange={setIsAddingProfile}>
        <DialogContent className="glass border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-light tracking-wide">Add Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 pt-4">
            <Input
              placeholder="Profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
              className="bg-secondary/50 border-border/50 h-12 text-lg font-light"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsAddingProfile(false)}
                className="font-light"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProfile}
                disabled={!newProfileName.trim()}
                className="bg-foreground text-background hover:bg-foreground/90 font-light"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSelection;
