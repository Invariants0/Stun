/**
 * SearchBar Component
 *
 * Semantic search over canvas nodes with filter chips, result preview,
 * keyboard navigation, and click-to-navigate highlighting.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Node } from "reactflow";
import type { SearchResult, SearchFilters } from "@/types/api.types";
import type { UseSearchReturn } from "@/hooks/useSearch";

// ============================================================================
// Types
// ============================================================================

interface SearchBarProps {
  nodes: Node[];
  search: UseSearchReturn;
  /** Overlay the input on the canvas topbar */
  className?: string;
}

const TYPE_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Text", value: "text" },
  { label: "Image", value: "image" },
  { label: "Media", value: "media" },
  { label: "Diagram", value: "excalidraw" },
];

// Helper: Highlight matching text in preview
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: "#fef3c7", color: "#92400e", fontWeight: 600, padding: "0 2px", borderRadius: 2 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// ============================================================================
// SearchBar
// ============================================================================

export function SearchBar({ nodes, search, className = "" }: SearchBarProps) {
  const {
    query,
    results,
    isSearching,
    error,
    selectedIndex,
    setQuery,
    search: runSearch,
    selectResult,
    navigateResults,
    clearSearch,
  } = search;

  const [activeType, setActiveType] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rebuild filters whenever type selection changes
  const buildFilters = useCallback(
    (type: string): SearchFilters => ({
      type: type || undefined,
      topK: 10,
    }),
    [],
  );

  // Re-trigger search when type filter changes and query is non-empty
  useEffect(() => {
    if (query.trim()) {
      runSearch(query, nodes, buildFilters(activeType));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      runSearch(val, nodes, buildFilters(activeType));
      setIsOpen(true);
    },
    [nodes, activeType, setQuery, runSearch, buildFilters],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          navigateResults("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateResults("up");
          break;
        case "Enter":
          if (selectedIndex >= 0 && results[selectedIndex]) {
            selectResult(results[selectedIndex]);
            setIsOpen(false);
          }
          break;
        case "Escape":
          clearSearch();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [navigateResults, selectResult, clearSearch, results, selectedIndex],
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      selectResult(result);
      setIsOpen(false);
    },
    [selectResult],
  );

  const handleTypeFilter = useCallback(
    (value: string) => {
      setActiveType(value);
      inputRef.current?.focus();
    },
    [],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as globalThis.Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results.length > 0;
  const showDropdown = isOpen && (isSearching || hasResults || error !== null);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      {/* Search Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          minWidth: 220,
          transition: "border-color 0.12s, box-shadow 0.12s",
        }}
        onClick={() => {
          inputRef.current?.focus();
          if (query.trim()) setIsOpen(true);
        }}
      >
        {/* Magnifying glass icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          placeholder="Search canvas…"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim() && hasResults) setIsOpen(true); }}
          aria-label="Search canvas nodes"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.8125rem",
            color: "#1e293b",
            width: "100%",
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
          }}
        />

        {/* Spinner or clear */}
        {isSearching ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            style={{ flexShrink: 0, animation: "spin 0.7s linear infinite" }}
            aria-hidden="true"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : query ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearSearch(); }}
            aria-label="Clear search"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
              color: "#94a3b8",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search results"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 320,
            maxWidth: 420,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Type filter chips */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "10px 12px 8px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              flexWrap: "wrap",
            }}
          >
            {TYPE_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleTypeFilter(value)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: activeType === value ? "#2563eb" : "rgba(0,0,0,0.10)",
                  background: activeType === value ? "#eff6ff" : "transparent",
                  color: activeType === value ? "#2563eb" : "#64748b",
                  fontSize: "0.75rem",
                  fontWeight: activeType === value ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.1s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          {isSearching && !hasResults ? (
            <div style={{ padding: "20px 16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
              🔍 Searching…
            </div>
          ) : error ? (
            <div style={{ padding: "16px", color: "#ef4444", fontSize: "0.8rem" }}>
              ⚠️ {error}
            </div>
          ) : hasResults ? (
            <ul style={{ listStyle: "none", margin: 0, padding: "6px 0", maxHeight: 320, overflowY: "auto" }}>
              {results.map((result, index) => (
                <li key={result.nodeId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleResultClick(result)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      width: "100%",
                      padding: "9px 14px",
                      border: "none",
                      background: index === selectedIndex ? "#f0f9ff" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.08s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (index !== selectedIndex) {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== selectedIndex) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }
                    }}
                  >
                    {/* Node type badge */}
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                        padding: "1px 7px",
                        borderRadius: 6,
                        background: getTypeColor(result.type).bg,
                        color: getTypeColor(result.type).text,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        textTransform: "capitalize",
                        lineHeight: "1.6",
                      }}
                    >
                      {result.type}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Preview text with highlighted matches */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8125rem",
                          color: "#1e293b",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {highlightText(result.preview || "(no preview)", query)}
                      </p>
                    </div>

                    {/* Score pill */}
                    <span
                      style={{
                        flexShrink: 0,
                        alignSelf: "center",
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        marginLeft: 4,
                      }}
                    >
                      {Math.round(result.score * 100)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: "20px 16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
              <div>No matches found</div>
              <div style={{ fontSize: "0.7rem", marginTop: "4px", color: "#cbd5e1" }}>
                Try searching for node labels or content
              </div>
            </div>
          )}

          {/* Footer hint */}
          {hasResults && (
            <div
              style={{
                padding: "7px 14px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                gap: 12,
                alignItems: "center",
                color: "#94a3b8",
                fontSize: "0.7rem",
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ go to node</span>
              <span>Esc close</span>
              <span style={{ marginLeft: "auto" }}>{results.length} result{results.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Returns bg/text colours per node type for the badge
function getTypeColor(type: string): { bg: string; text: string } {
  switch (type) {
    case "text":      return { bg: "#f0fdf4", text: "#16a34a" };
    case "image":     return { bg: "#fdf4ff", text: "#9333ea" };
    case "media":     return { bg: "#fff7ed", text: "#ea580c" };
    case "excalidraw":
    case "diagram":   return { bg: "#eff6ff", text: "#2563eb" };
    default:          return { bg: "#f1f5f9", text: "#475569" };
  }
}
