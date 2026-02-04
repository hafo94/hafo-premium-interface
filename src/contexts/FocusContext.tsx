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
  isSidebarExpanded: boolean;
  
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Expand/collapse sidebar based on active zone
  useEffect(() => {
    setIsSidebarExpanded(activeZone === "sidebar");
  }, [activeZone]);

  // Reset content focus when mode changes, but preserve header focus
  useEffect(() => {
    setContentIndex({ row: -1, col: 0 });
    // Only reset to content if not currently in header
    if (activeZone !== "header") {
      setActiveZone("content");
    }
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
    isSidebarExpanded,
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

// Default context value for when hook is used outside provider
const defaultFocusValue: FocusContextValue = {
  activeZone: "content",
  headerIndex: 0,
  sidebarIndex: 1,
  contentIndex: { row: -1, col: 0 },
  isSidebarExpanded: false,
  setActiveZone: () => {},
  setHeaderIndex: () => {},
  setSidebarIndex: () => {},
  setContentIndex: () => {},
  focusHeader: () => {},
  focusSidebar: () => {},
  focusContent: () => {},
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  // Return default value instead of throwing if outside provider
  // This handles edge cases like HMR or initial render
  if (!context) {
    return defaultFocusValue;
  }
  return context;
};
