import { useState, useEffect } from 'react';
import type { TranslationResult, HistoryEntry } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<TranslationResult[]>(() => {
    try {
      const saved = localStorage.getItem('khmer_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('khmer_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('khmer_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('khmer_history', JSON.stringify(history));
  }, [history]);

  const toggleFavorite = (res: TranslationResult) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.translatedText === res.translatedText);
      return exists
        ? prev.filter((f) => f.translatedText !== res.translatedText)
        : [...prev, res];
    });
  };

  const isFavorite = (res: TranslationResult) =>
    favorites.some((f) => f.translatedText === res.translatedText);

  const addToHistory = (entry: Omit<HistoryEntry, 'ts'>) => {
    setHistory((prev) =>
      [{ ...entry, ts: Date.now() }, ...prev].slice(0, 50)
    );
  };

  return { favorites, history, toggleFavorite, isFavorite, addToHistory };
}
