export interface Stat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres (PokéAPI unit)
  weight: number; // hectograms (PokéAPI unit)
  baseExperience: number;
  types: string[];
  sprite: string; // small pixel sprite
  artwork: string; // large official artwork
  stats: Stat[];
  abilities: string[];
}

export type SortKey = 'id' | 'name' | 'height' | 'weight' | 'baseExperience';
export type SortOrder = 'asc' | 'desc';
