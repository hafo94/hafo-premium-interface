import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { AppMode } from "@/components/ModeHeader";

export type FocusZone = "header" | "sidebar" | "content";

interface FocusState {
  activeZone: FocusZone;
  headerIndex: number;
  sidebarIndex: number;
  contentIndex: { row: number; col: number };
}

interface FocusContextValue {
  activeZone: FocusZone;
  headerIndex: number;
  sidebarIndex: number;
  contentIndex: { row: number; col: number };
  
  setActiveZone: (zone: FocusZone) => void;
  setHeaderIndex: (index: number) => void;
  setSidebarIndex: (index: number) => void;
  setContentIndex: (index: { row: number; col: number }) => void;
  
  // Zone transition helpers
  focusHeader: () => void;
  focusSidebar: () => void;
  focusContent: () => void;
}

const FocusContext = createContext<FocusContextValue | null>(null);

interface FocusProviderProps {
  children: ReactNode;
  mode: AppMode;
  hasSidebar: boolean;
}

export const FocusProvider = ({ children, mode, hasSidebar }: FocusProviderProps) => {
  const [activeZone, setActiveZone] = useState<FocusZone>("content");
  const [headerIndex, setHeaderIndex] = useState(0);
  const [sidebarIndex, setSidebarIndex] = useState(1); // Default to "home" (index 1)
  const [contentIndex, setContentIndex] = useState({ row: -1, col: 0 }); // -1 = hero

  // Reset content focus when mode changes
  useEffect(() => {
    setContentIndex({ row: -1, col: 0 });
    setActiveZone("content");
  }, [mode]);

  const focusHeader = useCallback(() => {
    setActiveZone("header");
  }, []);

  const focusSidebar = useCallback(() => {
    if (hasSidebar) {
      setActiveZone("sidebar");
    }
  }, [hasSidebar]);

  const focusContent = useCallback(() => {
    setActiveZone("content");
  }, []);

  const value: FocusContextValue = {
    activeZone,
    headerIndex,
    sidebarIndex,
    contentIndex,
    setActiveZone,
    setHeaderIndex,
    setSidebarIndex,
    setContentIndex,
    focusHeader,
    focusSidebar,
    focusContent,
  };

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
};
