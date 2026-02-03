import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tv-favorites';

export const useTVFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : ['svt1', 'svt2', 'tv4', 'tv3'];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((channelId: string) => {
    setFavorites(prev => {
      if (prev.includes(channelId)) return prev;
      return [...prev, channelId];
    });
  }, []);

  const removeFavorite = useCallback((channelId: string) => {
    setFavorites(prev => prev.filter(id => id !== channelId));
  }, []);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      }
      return [...prev, channelId];
    });
  }, []);

  const isFavorite = useCallback((channelId: string) => {
    return favorites.includes(channelId);
  }, [favorites]);

  const reorderFavorites = useCallback((startIndex: number, endIndex: number) => {
    setFavorites(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    reorderFavorites
  };
};
