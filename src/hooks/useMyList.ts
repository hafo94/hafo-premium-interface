import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'watch-my-list';

export const useMyList = () => {
  const [myList, setMyList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myList));
  }, [myList]);

  const addToList = useCallback((id: string) => {
    setMyList(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFromList = useCallback((id: string) => {
    setMyList(prev => prev.filter(item => item !== id));
  }, []);

  const toggleInList = useCallback((id: string) => {
    setMyList(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const isInList = useCallback((id: string) => {
    return myList.includes(id);
  }, [myList]);

  return {
    myList,
    addToList,
    removeFromList,
    toggleInList,
    isInList,
  };
};
