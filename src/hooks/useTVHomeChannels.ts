import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tv-home-channels';
const ICON_SIZE_KEY = 'tv-icon-size';

export type IconSize = 'small' | 'medium' | 'large';

export const useTVHomeChannels = () => {
  const [homeChannels, setHomeChannels] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : ['svt1', 'svt2', 'tv4', 'tv3'];
  });

  const [iconSize, setIconSize] = useState<IconSize>(() => {
    const stored = localStorage.getItem(ICON_SIZE_KEY);
    return (stored as IconSize) || 'medium';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(homeChannels));
  }, [homeChannels]);

  useEffect(() => {
    localStorage.setItem(ICON_SIZE_KEY, iconSize);
  }, [iconSize]);

  const addChannel = useCallback((channelId: string) => {
    setHomeChannels(prev => {
      if (prev.includes(channelId)) return prev;
      return [...prev, channelId];
    });
  }, []);

  const removeChannel = useCallback((channelId: string) => {
    setHomeChannels(prev => prev.filter(id => id !== channelId));
  }, []);

  const toggleChannel = useCallback((channelId: string) => {
    setHomeChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      }
      return [...prev, channelId];
    });
  }, []);

  const isOnHome = useCallback((channelId: string) => {
    return homeChannels.includes(channelId);
  }, [homeChannels]);

  const reorderChannels = useCallback((startIndex: number, endIndex: number) => {
    setHomeChannels(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const updateIconSize = useCallback((size: IconSize) => {
    setIconSize(size);
  }, []);

  return {
    homeChannels,
    iconSize,
    addChannel,
    removeChannel,
    toggleChannel,
    isOnHome,
    reorderChannels,
    updateIconSize
  };
};
