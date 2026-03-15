/**
 * useSearch hook
 *
 * Manages semantic search state and coordinates with the canvas to
 * highlight / navigate to matching nodes.
 */

"use client";

import { useCallback, useRef, useState } from "react";
import type { Node } from "reactflow";
import { searchCanvas } from "@/lib/api";
import type { SearchResult, SearchFilters } from "@/types/api.types";

export interface UseSearchOptions {
  /** Called when a result is selected — should pan/zoom to the node */
  onNavigate?: (nodeId: string, position: { x: number; y: number }) => void;
  /** Called to temporarily highlight a node on the canvas */
  onHighlight?: (nodeId: string) => void;
}

export interface UseSearchReturn {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  selectedIndex: number;
  setQuery: (q: string) => void;
  search: (query: string, nodes: Node[], filters?: SearchFilters) => void;
  selectResult: (result: SearchResult) => void;
  navigateResults: (direction: "up" | "down") => void;
  clearSearch: () => void;
}

const DEBOUNCE_MS = 100; // Reduced from 350ms for better responsiveness

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { onNavigate, onHighlight } = options;

  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const search = useCallback(
    (rawQuery: string, nodes: Node[], filters?: SearchFilters) => {
      // Clear previous debounce
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        setSelectedIndex(-1);
        return;
      }

      debounceTimer.current = setTimeout(async () => {
        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setIsSearching(true);
        setError(null);
        setSelectedIndex(-1);

        try {
          const response = await searchCanvas({
            query: trimmed,
            nodes: nodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: n.data as Record<string, unknown>,
            })),
            filters,
          });

          console.log(`[useSearch] Found ${response.results.length} results for: "${trimmed}"`);
          setResults(response.results);
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            console.log("[useSearch] Search cancelled");
            return;
          }
          const message = err instanceof Error ? err.message : "Search failed";
          console.error("[useSearch] Error:", message);
          setError(message);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [],
  );

  const selectResult = useCallback(
    (result: SearchResult) => {
      const idx = results.findIndex((r) => r.nodeId === result.nodeId);
      setSelectedIndex(idx);
      if (result.position) {
        onNavigate?.(result.nodeId, result.position);
      }
      onHighlight?.(result.nodeId);
    },
    [results, onNavigate, onHighlight],
  );

  const navigateResults = useCallback(
    (direction: "up" | "down") => {
      if (results.length === 0) return;
      setSelectedIndex((prev) => {
        if (direction === "down") return (prev + 1) % results.length;
        return prev <= 0 ? results.length - 1 : prev - 1;
      });
    },
    [results.length],
  );

  const clearSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (abortRef.current) abortRef.current.abort();
    setQueryState("");
    setResults([]);
    setIsSearching(false);
    setError(null);
    setSelectedIndex(-1);
  }, []);

  return {
    query,
    results,
    isSearching,
    error,
    selectedIndex,
    setQuery,
    search,
    selectResult,
    navigateResults,
    clearSearch,
  };
}
