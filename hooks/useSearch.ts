'use client';

import { useState, useCallback, useRef } from 'react';

export interface SourceRef {
  articleId: string;
  title: string;
  slug: string;
  similarity: number;
}

export interface SearchState {
  query: string;
  response: string;
  sources: SourceRef[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  cached: boolean;
}

const initialState: SearchState = {
  query: '',
  response: '',
  sources: [],
  isStreaming: false,
  isLoading: false,
  error: null,
  cached: false,
};

export function useSearch() {
  const [state, setState] = useState<SearchState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) return;

    // Cancel any in-progress search
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState({
      query,
      response: '',
      sources: [],
      isStreaming: true,
      isLoading: true,
      error: null,
      cached: false,
    });

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? `Search failed (${res.status})`);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      setState((s) => ({ ...s, isLoading: false }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        full += chunk;

        setState((s) => ({ ...s, response: full }));
      }

      // Fetch sources after stream completes
      try {
        const sourcesRes = await fetch(
          `/api/search/sources?q=${encodeURIComponent(query)}`
        );
        if (sourcesRes.ok) {
          const { data } = await sourcesRes.json() as { data: SourceRef[] };
          setState((s) => ({ ...s, sources: data ?? [] }));
        }
      } catch {
        // Sources are bonus — don't fail the whole search
      }

      setState((s) => ({ ...s, isStreaming: false }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Cancelled — don't update state
      }
      setState((s) => ({
        ...s,
        isStreaming: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Search failed. Please try again.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, search, reset };
}
