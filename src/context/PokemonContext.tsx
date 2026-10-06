import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { describeError, fetchAllPokemon } from '../api/pokeapi';
import type { Pokemon } from '../types';

type Status = 'loading' | 'ready' | 'error';

export interface PokemonContextValue {
  pokemon: Pokemon[];
  status: Status;
  error: string | null;
  retry: () => void;
  /** Ordered ids of the list the user last clicked from (drives prev/next). */
  navIds: number[];
  setNavIds: (ids: number[]) => void;
}

export const PokemonContext = createContext<PokemonContextValue | null>(null);

const NAV_KEY = 'pokedex151:nav';

function readNav(): number[] {
  try {
    const raw = sessionStorage.getItem(NAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [navIds, setNavIdsState] = useState<number[]>(readNav);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);
    fetchAllPokemon()
      .then((list) => {
        if (cancelled) return;
        setPokemon(list);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(describeError(err));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const setNavIds = useCallback((ids: number[]) => {
    setNavIdsState(ids);
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  return (
    <PokemonContext.Provider value={{ pokemon, status, error, retry, navIds, setNavIds }}>
      {children}
    </PokemonContext.Provider>
  );
}
