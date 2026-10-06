import type { Pokemon, SortKey, SortOrder } from './types';

export const formatNumber = (id: number) => `#${String(id).padStart(3, '0')}`;

export const formatName = (name: string) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const formatHeight = (dm: number) => `${(dm / 10).toFixed(1)} m`;
export const formatWeight = (hg: number) => `${(hg / 10).toFixed(1)} kg`;

export const SORT_LABELS: Record<SortKey, string> = {
  id: 'Number',
  name: 'Name',
  height: 'Height',
  weight: 'Weight',
  baseExperience: 'Base experience',
};

export function sortPokemon(list: Pokemon[], key: SortKey, order: SortOrder): Pokemon[] {
  const dir = order === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const cmp =
      key === 'name' ? a.name.localeCompare(b.name) : (a[key] as number) - (b[key] as number);
    // Tie-break on number so ordering is stable and predictable.
    return cmp !== 0 ? cmp * dir : a.id - b.id;
  });
}

export function matchesQuery(p: Pokemon, query: string): boolean {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(p.id).startsWith(String(Number(q)));
  return p.name.includes(q) || formatName(p.name).toLowerCase().includes(q);
}

export const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy', 'dark',
];
