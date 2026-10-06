import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePokemon } from '../context/usePokemon';
import StatusPanel from '../components/StatusPanel';
import TypeTag from '../components/TypeTag';
import { ALL_TYPES, formatName, formatNumber } from '../utils';
import styles from './GalleryView.module.css';

export default function GalleryView() {
  const { pokemon, status, setNavIds } = usePokemon();
  const [params, setParams] = useSearchParams();

  const selected = useMemo(
    () => (params.get('types') ?? '').split(',').filter(Boolean),
    [params],
  );
  const matchAll = params.get('match') === 'all';

  // Only offer types that actually appear in the data, in canonical order.
  const availableTypes = useMemo(() => {
    const present = new Set(pokemon.flatMap((p) => p.types));
    return ALL_TYPES.filter((t) => present.has(t));
  }, [pokemon]);

  const setFilters = (types: string[], all: boolean) => {
    const next = new URLSearchParams(params);
    if (types.length) next.set('types', types.join(','));
    else next.delete('types');
    if (all) next.set('match', 'all');
    else next.delete('match');
    setParams(next, { replace: true });
  };

  const toggleType = (type: string) =>
    setFilters(
      selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type],
      matchAll,
    );

  const results = useMemo(() => {
    if (selected.length === 0) return pokemon;
    return pokemon.filter((p) =>
      matchAll ? selected.every((t) => p.types.includes(t)) : selected.some((t) => p.types.includes(t)),
    );
  }, [pokemon, selected, matchAll]);

  const rememberList = () => setNavIds(results.map((p) => p.id));

  return (
    <section>
      <h1 className={styles.heading}>Gallery</h1>

      {status === 'ready' && (
        <div className={styles.filters}>
          <div className={styles.filterHeader}>
            <span className={styles.label} id="type-filter-label">
              Filter by type
            </span>
            <div className={styles.matchToggle} role="group" aria-label="How to combine types">
              <button
                type="button"
                className={!matchAll ? styles.matchActive : styles.matchButton}
                aria-pressed={!matchAll}
                onClick={() => setFilters(selected, false)}
              >
                Any selected
              </button>
              <button
                type="button"
                className={matchAll ? styles.matchActive : styles.matchButton}
                aria-pressed={matchAll}
                onClick={() => setFilters(selected, true)}
              >
                All selected
              </button>
            </div>
          </div>

          <div className={styles.chips} role="group" aria-labelledby="type-filter-label">
            {availableTypes.map((type) => {
              const on = selected.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={on ? styles.chipOn : styles.chip}
                  aria-pressed={on}
                  onClick={() => toggleType(type)}
                >
                  <TypeTag type={type} />
                </button>
              );
            })}
            {selected.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => setFilters([], matchAll)}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      <StatusPanel />

      {status === 'ready' && (
        <>
          <p className={styles.count} aria-live="polite">
            {results.length === 0
              ? 'No Pokémon have all of those types. Remove a type or switch to “Any selected”.'
              : `${results.length} of ${pokemon.length} Pokémon`}
          </p>

          <ul className={styles.grid}>
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} className={styles.tile} onClick={rememberList}>
                  <img
                    src={p.artwork}
                    alt={formatName(p.name)}
                    className={styles.art}
                    width={240}
                    height={240}
                    loading="lazy"
                  />
                  <span className={styles.caption}>
                    <span className={styles.number}>{formatNumber(p.id)}</span>
                    <span className={styles.name}>{formatName(p.name)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
