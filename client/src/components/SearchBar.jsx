import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, X, Clock, TrendingUp } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/api";
import useSearchHistory from "@/hooks/useSearchHistory";

const MAX_SUGGESTIONS = 8;
const MAX_POPULAR = 6;

/**
 * Global product search with recent history, dynamic suggestions and popular
 * searches. Submitting navigates to the products page with a `search` query
 * parameter, where the existing catalogue filter takes over.
 *
 * The suggestion source is isolated in the `index`/`suggestions` memos below so
 * it can later be swapped for a server-side suggestions API without changing
 * the rest of the component.
 */
const SearchBar = ({
  variant = "desktop",
  placeholder = "Search for products...",
}) => {
  const navigate = useNavigate();
  const { parts } = useSelector((state) => state.parts);
  const { recent, addSearch, removeSearch, clearHistory } = useSearchHistory();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [localCatalog, setLocalCatalog] = useState([]);
  const fetchedRef = useRef(false);
  const containerRef = useRef(null);

  // Prefer the catalogue already in the store; otherwise use a locally fetched
  // copy. We deliberately avoid the shared `fetchParts` thunk so this never
  // toggles the global `parts.loading` flag used by other pages.
  const catalog = parts && parts.length > 0 ? parts : localCatalog;

  const ensureCatalog = async () => {
    if (fetchedRef.current) return;
    if (parts && parts.length > 0) return;
    fetchedRef.current = true;
    try {
      const res = await axiosInstance.get("/api/parts/get");
      setLocalCatalog(res.data?.parts || []);
    } catch {
      // Suggestions gracefully fall back to recent searches only.
    }
  };

  // De-duplicated product names and categories used for matching.
  const index = useMemo(() => {
    const names = new Map();
    const categories = new Map();
    (catalog || []).forEach((p) => {
      if (p?.name) {
        const key = p.name.trim().toLowerCase();
        if (key && !names.has(key)) names.set(key, p.name.trim());
      }
      if (p?.category) {
        const key = p.category.trim().toLowerCase();
        if (key && !categories.has(key)) categories.set(key, p.category.trim());
      }
    });
    return { names: [...names.values()], categories: [...categories.values()] };
  }, [catalog]);

  // Popular searches = the categories with the most products.
  const popular = useMemo(() => {
    const counts = new Map();
    (catalog || []).forEach((p) => {
      if (p?.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_POPULAR)
      .map(([category]) => category);
  }, [catalog]);

  // Suggestions while typing: matching product names first, then categories.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const nameMatches = index.names
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS)
      .map((value) => ({ type: "product", value }));
    const remaining = MAX_SUGGESTIONS - nameMatches.length;
    const categoryMatches =
      remaining > 0
        ? index.categories
            .filter((c) => c.toLowerCase().includes(q))
            .slice(0, remaining)
            .map((value) => ({ type: "category", value }))
        : [];
    return [...nameMatches, ...categoryMatches];
  }, [query, index]);

  // Flat list the dropdown currently shows (drives keyboard navigation).
  const items = useMemo(() => {
    if (query.trim()) return suggestions;
    return [
      ...popular.map((value) => ({ type: "popular", value })),
      ...recent.map((value) => ({ type: "recent", value })),
    ];
  }, [query, suggestions, popular, recent]);

  // Reset the highlighted item whenever the visible list changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, open]);

  // Close on outside click.
  useEffect(() => {
    const onMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const commit = (term) => {
    const value = (term || "").trim();
    if (!value) return;
    addSearch(value);
    setQuery(value);
    setOpen(false);
    setActiveIndex(-1);
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) commit(items[activeIndex].value);
      else commit(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const listboxId = `search-listbox-${variant}`;
  const isEmptyQuery = !query.trim();

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            ensureCatalog();
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className="flex-grow outline-none bg-transparent text-sm text-gray-800 placeholder-gray-500 font-medium"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
            }}
            className="mr-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit(query)}
          className="cursor-pointer"
        >
          <Search className="text-blue-500 w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 max-h-96 overflow-y-auto"
          >
            <ul role="listbox" id={listboxId} className="space-y-1">
              {isEmptyQuery ? (
                <>
                  {popular.length > 0 && (
                    <li className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Popular searches
                    </li>
                  )}
                  {popular.map((value, i) => (
                    <li
                      key={`popular-${value}`}
                      id={`${listboxId}-option-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(value)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`px-3 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2 ${
                        activeIndex === i
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">{value}</span>
                    </li>
                  ))}

                  {recent.length > 0 && (
                    <li className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Recent searches
                      </span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={clearHistory}
                        className="text-xs font-medium text-blue-500 hover:text-blue-700 normal-case"
                      >
                        Clear all
                      </button>
                    </li>
                  )}
                  {recent.map((value, i) => {
                    const idx = popular.length + i;
                    return (
                      <li
                        key={`recent-${value}`}
                        id={`${listboxId}-option-${idx}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`group px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${
                          activeIndex === idx
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => commit(value)}
                          className="truncate flex-grow cursor-pointer"
                        >
                          {value}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${value} from recent searches`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => removeSearch(value)}
                          className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}

                  {popular.length === 0 && recent.length === 0 && (
                    <li className="px-3 py-4 text-sm text-gray-400 text-center">
                      Start typing to search products.
                    </li>
                  )}
                </>
              ) : items.length > 0 ? (
                items.map((item, idx) => (
                  <li
                    key={`${item.type}-${item.value}`}
                    id={`${listboxId}-option-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(item.value)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2 ${
                      activeIndex === idx
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate flex-grow">{item.value}</span>
                    {item.type === "category" && (
                      <span className="text-xs text-gray-400 shrink-0">
                        in Categories
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-3 py-4 text-sm text-gray-400 text-center">
                  No matches for &ldquo;{query}&rdquo;. Press Enter to search
                  anyway.
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
