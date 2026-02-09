import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IPTVCredentials, testConnection as testIPTVConnection } from '@/services/iptvService';
import { KodiConfig, testKodiConnection } from '@/services/kodiService';

interface IPTVContextType {
  // IPTV
  iptvCredentials: IPTVCredentials | null;
  iptvConnected: boolean;
  setIPTVCredentials: (credentials: IPTVCredentials | null) => void;
  testIPTV: () => Promise<{ success: boolean; error?: string }>;
  
  // Kodi
  kodiConfig: KodiConfig | null;
  kodiConnected: boolean;
  setKodiConfig: (config: KodiConfig | null) => void;
  testKodi: () => Promise<{ success: boolean; version?: string; error?: string }>;
  
  // Connection status
  isLoading: boolean;
}

const IPTVContext = createContext<IPTVContextType | undefined>(undefined);

const IPTV_STORAGE_KEY = 'iptv_credentials';
const KODI_STORAGE_KEY = 'kodi_config';

const DEFAULT_IPTV_CREDENTIALS: IPTVCredentials = {
  serverUrl: 'http://freeiptv.ottc.xyz:80',
  username: '850832714335',
  password: '641859008374',
};

export function IPTVProvider({ children }: { children: React.ReactNode }) {
  const [iptvCredentials, setIPTVCredentialsState] = useState<IPTVCredentials | null>(DEFAULT_IPTV_CREDENTIALS);
  const [iptvConnected, setIPTVConnected] = useState(true);
  const [kodiConfig, setKodiConfigState] = useState<KodiConfig | null>(null);
  const [kodiConnected, setKodiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored credentials on mount
  useEffect(() => {
    try {
      const storedIPTV = localStorage.getItem(IPTV_STORAGE_KEY);
      if (storedIPTV) {
        const parsed = JSON.parse(storedIPTV);
        setIPTVCredentialsState(parsed);
        // Don't auto-test on load - let user test manually
      }

      const storedKodi = localStorage.getItem(KODI_STORAGE_KEY);
      if (storedKodi) {
        const parsed = JSON.parse(storedKodi);
        setKodiConfigState(parsed);
      }
    } catch (error) {
      console.error('Error loading stored config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setIPTVCredentials = useCallback((credentials: IPTVCredentials | null) => {
    setIPTVCredentialsState(credentials);
    setIPTVConnected(false);
    
    if (credentials) {
      localStorage.setItem(IPTV_STORAGE_KEY, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(IPTV_STORAGE_KEY);
    }
  }, []);

  const testIPTV = useCallback(async () => {
    if (!iptvCredentials) {
      return { success: false, error: 'No IPTV credentials configured' };
    }

    try {
      const result = await testIPTVConnection(iptvCredentials);
      setIPTVConnected(result.success);
      return result;
    } catch (error) {
      setIPTVConnected(false);
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }, [iptvCredentials]);

  const setKodiConfig = useCallback((config: KodiConfig | null) => {
    setKodiConfigState(config);
    setKodiConnected(false);
    
    if (config) {
      localStorage.setItem(KODI_STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(KODI_STORAGE_KEY);
    }
  }, []);

  const testKodi = useCallback(async () => {
    if (!kodiConfig) {
      return { success: false, error: 'No Kodi configuration' };
    }

    try {
      const result = await testKodiConnection(kodiConfig);
      setKodiConnected(result.success);
      return result;
    } catch (error) {
      setKodiConnected(false);
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }, [kodiConfig]);

  return (
    <IPTVContext.Provider
      value={{
        iptvCredentials,
        iptvConnected,
        setIPTVCredentials,
        testIPTV,
        kodiConfig,
        kodiConnected,
        setKodiConfig,
        testKodi,
        isLoading,
      }}
    >
      {children}
    </IPTVContext.Provider>
  );
}

export function useIPTVContext() {
  const context = useContext(IPTVContext);
  if (context === undefined) {
    throw new Error('useIPTVContext must be used within an IPTVProvider');
  }
  return context;
}
