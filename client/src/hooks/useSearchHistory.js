import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recentSearches";
const MAX_ITEMS = 8;

// Safely read the persisted search history from localStorage.
const readHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
};

const writeHistory = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore write failures (e.g. storage full or disabled).
  }
};

/**
 * Manages the user's recent search history in localStorage.
 * Returns the list (most recent first) plus helpers to add, remove and clear.
 * History is intentionally decoupled from the UI so it can later be backed by a
 * server-side store without changing the component that consumes it.
 */
export default function useSearchHistory() {
  const [recent, setRecent] = useState(readHistory);

  // Keep state in sync if another tab updates the same key.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setRecent(readHistory());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addSearch = useCallback((term) => {
    const value = (term || "").trim();
    if (!value) return;
    setRecent((prev) => {
      // De-duplicate case-insensitively, newest first, capped at MAX_ITEMS.
      const withoutDup = prev.filter(
        (item) => item.toLowerCase() !== value.toLowerCase()
      );
      const next = [value, ...withoutDup].slice(0, MAX_ITEMS);
      writeHistory(next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((term) => {
    setRecent((prev) => {
      const next = prev.filter((item) => item !== term);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setRecent([]);
  }, []);

  return { recent, addSearch, removeSearch, clearHistory };
}
