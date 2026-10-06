import { useContext } from 'react';
import { PokemonContext, type PokemonContextValue } from './PokemonContext';

export function usePokemon(): PokemonContextValue {
  const ctx = useContext(PokemonContext);
  if (!ctx) throw new Error('usePokemon must be used inside <PokemonProvider>');
  return ctx;
}
