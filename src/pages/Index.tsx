import { useState, useCallback, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ProfileSelection from "@/components/ProfileSelection";
import HomeScreen from "@/components/HomeScreen";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

type AppState = "welcome" | "profiles" | "home";

const Index = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const savedProfile = sessionStorage.getItem('selectedProfile');
    return savedProfile ? "home" : "welcome";
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(() => {
    const savedProfile = sessionStorage.getItem('selectedProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const handleWelcomeComplete = useCallback(() => {
    setAppState("profiles");
  }, []);

  const handleSelectProfile = useCallback((profile: Profile) => {
    sessionStorage.setItem('selectedProfile', JSON.stringify(profile));
    setSelectedProfile(profile);
    setAppState("home");
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('selectedProfile');
    setSelectedProfile(null);
    setAppState("profiles");
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {appState === "welcome" && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      
      {appState === "profiles" && (
        <ProfileSelection onSelectProfile={handleSelectProfile} />
      )}
      
      {appState === "home" && selectedProfile && (
        <HomeScreen profile={selectedProfile} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
