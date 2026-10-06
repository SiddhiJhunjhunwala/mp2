import axios from 'axios';
import type { Pokemon } from '../types';

export const POKEMON_COUNT = 151;
const CACHE_KEY = 'pokedex151:v1';

const client = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
});

// Shape of the parts of the PokéAPI /pokemon/{id} response we use.
interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

const ARTWORK_FALLBACK = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const SPRITE_FALLBACK = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

function toPokemon(raw: RawPokemon): Pokemon {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    baseExperience: raw.base_experience ?? 0,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    sprite: raw.sprites.front_default ?? SPRITE_FALLBACK(raw.id),
    artwork: raw.sprites.other?.['official-artwork']?.front_default ?? ARTWORK_FALLBACK(raw.id),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: raw.abilities.map((a) => a.ability.name),
  };
}

export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const { data } = await client.get<RawPokemon>(`/pokemon/${idOrName}`);
  return toPokemon(data);
}

function readCache(): Pokemon[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Pokemon[];
    return Array.isArray(parsed) && parsed.length === POKEMON_COUNT ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(list: Pokemon[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked: the app still works, it just refetches next visit.
  }
}

/**
 * Loads all 151 Pokémon. Results are cached in sessionStorage so page reloads
 * and route changes don't hit the API again.
 */
export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const cached = readCache();
  if (cached) return cached;

  const ids = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
  const list = await Promise.all(ids.map((id) => fetchPokemon(id)));
  writeCache(list);
  return list;
}

export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') return 'PokéAPI took too long to respond.';
    if (err.response?.status === 404) return 'That Pokémon does not exist.';
    if (err.response) return `PokéAPI returned an error (${err.response.status}).`;
    return 'Could not reach PokéAPI. Check your connection.';
  }
  return 'Something went wrong while loading Pokémon.';
}
