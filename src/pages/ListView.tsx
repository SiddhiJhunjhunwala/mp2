import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePokemon } from '../context/usePokemon';
import StatusPanel from '../components/StatusPanel';
import TypeTag from '../components/TypeTag';
import type { Pokemon, SortKey, SortOrder } from '../types';
import {
  SORT_LABELS,
  formatHeight,
  formatName,
  formatNumber,
  formatWeight,
  matchesQuery,
  sortPokemon,
} from '../utils';
import styles from './ListView.module.css';

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

function isSortKey(v: string | null): v is SortKey {
  return v !== null && (SORT_KEYS as string[]).includes(v);
}

function sortValue(p: Pokemon, key: SortKey): string {
  switch (key) {
    case 'height':
      return formatHeight(p.height);
    case 'weight':
      return formatWeight(p.weight);
    case 'baseExperience':
      return `${p.baseExperience} XP`;
    default:
      return '';
  }
}

export default function ListView() {
  const { pokemon, status, setNavIds } = usePokemon();
  // Keep search state in the URL so "Back" from a detail page restores it.
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const sortKey: SortKey = isSortKey(params.get('sort')) ? (params.get('sort') as SortKey) : 'id';
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : 'asc';

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const results = useMemo(
    () => sortPokemon(pokemon.filter((p) => matchesQuery(p, query)), sortKey, order),
    [pokemon, query, sortKey, order],
  );

  const rememberList = () => setNavIds(results.map((p) => p.id));

  return (
    <section>
      <h1 className={styles.heading}>Search</h1>

      <div className={styles.controls}>
        <label className={styles.searchField}>
          <span className={styles.label}>Name or number</span>
          <input
            type="search"
            className={styles.input}
            placeholder="Try “char” or 25"
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Sort by</span>
          <select
            className={styles.select}
            value={sortKey}
            onChange={(e) => update({ sort: e.target.value === 'id' ? '' : e.target.value })}
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.field} role="group" aria-label="Sort order">
          <span className={styles.label}>Order</span>
          <div className={styles.orderToggle}>
            <button
              type="button"
              className={order === 'asc' ? styles.orderActive : styles.orderButton}
              aria-pressed={order === 'asc'}
              onClick={() => update({ order: '' })}
            >
              ▲ Ascending
            </button>
            <button
              type="button"
              className={order === 'desc' ? styles.orderActive : styles.orderButton}
              aria-pressed={order === 'desc'}
              onClick={() => update({ order: 'desc' })}
            >
              ▼ Descending
            </button>
          </div>
        </div>
      </div>

      <StatusPanel />

      {status === 'ready' && (
        <>
          <p className={styles.count} aria-live="polite">
            {results.length === 0
              ? `No Pokémon match “${query}”. Check the spelling or search by number.`
              : `${results.length} of ${pokemon.length} Pokémon`}
          </p>

          <ol className={styles.list}>
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} className={styles.row} onClick={rememberList}>
                  <img
                    src={p.sprite}
                    alt=""
                    className={styles.sprite}
                    width={72}
                    height={72}
                    loading="lazy"
                  />
                  <span className={styles.number}>{formatNumber(p.id)}</span>
                  <span className={styles.name}>{formatName(p.name)}</span>
                  <span className={styles.types}>
                    {p.types.map((t) => (
                      <TypeTag key={t} type={t} />
                    ))}
                  </span>
                  <span className={styles.metric}>{sortValue(p, sortKey)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
