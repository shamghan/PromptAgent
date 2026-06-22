/**
 * useHistory.js
 * Custom hook for reading/writing the last 10 generated prompts
 * to localStorage under the key "pap_history".
 */

import { useState, useCallback } from 'react';
import { STORAGE_KEYS, MAX_HISTORY } from '../utils/constants';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(entries));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadFromStorage);

  /** Add a new entry; trims to MAX_HISTORY */
  const addEntry = useCallback((inputs, output) => {
    const entry = {
      id:        crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      inputs,
      output,
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Delete a single entry by id */
  const deleteEntry = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Remove all history */
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }, []);

  return { history, addEntry, deleteEntry, clearHistory };
}
