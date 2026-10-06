import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePokemon } from '../context/usePokemon';
import { describeError, fetchPokemon } from '../api/pokeapi';
import StatusPanel from '../components/StatusPanel';
import TypeTag from '../components/TypeTag';
import type { Pokemon } from '../types';
import { formatHeight, formatName, formatNumber, formatWeight } from '../utils';
import styles from './DetailView.module.css';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};
const MAX_STAT = 255;

export default function DetailView() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0;
  const navigate = useNavigate();
  const { pokemon, status, navIds } = usePokemon();

  const cached = pokemon.find((p) => p.id === id);

  // Pokémon outside the cached 151 (e.g. a hand-typed /pokemon/400) are fetched individually.
  const [extra, setExtra] = useState<Pokemon | null>(null);
  const [extraError, setExtraError] = useState<string | null>(null);
  const needsFetch = validId && status === 'ready' && !cached;

  useEffect(() => {
    if (!needsFetch) return;
    let cancelled = false;
    setExtra(null);
    setExtraError(null);
    fetchPokemon(id)
      .then((p) => !cancelled && setExtra(p))
      .catch((err: unknown) => !cancelled && setExtraError(describeError(err)));
    return () => {
      cancelled = true;
    };
  }, [id, needsFetch]);

  const current = cached ?? (extra?.id === id ? extra : null);

  // Prev/next follow the list the user clicked from. Visiting the URL directly
  // (or an id not in that list) falls back to the full Pokédex order.
  const sequence = useMemo(() => {
    if (navIds.includes(id)) return navIds;
    const all = pokemon.map((p) => p.id);
    return all.includes(id) ? all : [];
  }, [navIds, pokemon, id]);

  const index = sequence.indexOf(id);
  const hasNav = index !== -1 && sequence.length > 1;
  const prevId = hasNav ? sequence[(index - 1 + sequence.length) % sequence.length] : null;
  const nextId = hasNav ? sequence[(index + 1) % sequence.length] : null;
  const nameOf = (pid: number | null) => {
    const p = pokemon.find((x) => x.id === pid);
    return p ? formatName(p.name) : '';
  };

  // Left/right arrow keys cycle too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, select, textarea')) return;
      if (e.key === 'ArrowLeft' && prevId !== null) navigate(`/pokemon/${prevId}`);
      if (e.key === 'ArrowRight' && nextId !== null) navigate(`/pokemon/${nextId}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevId, nextId, navigate]);

  if (!validId) {
    return <Message title="Not a Pokémon number" body={`“${idParam}” isn’t a valid Pokédex number.`} />;
  }

  if (status !== 'ready') return <StatusPanel />;

  if (!current) {
    return extraError ? (
      <Message title="Pokémon not found" body={extraError} />
    ) : (
      <div className={styles.loading} role="status">
        Loading {formatNumber(id)}…
      </div>
    );
  }

  const total = current.stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <article>
      <nav className={styles.pager} aria-label="Browse Pokémon">
        {prevId !== null ? (
          <Link to={`/pokemon/${prevId}`} className={styles.pagerLink} rel="prev">
            <span className={styles.arrow} aria-hidden="true">◀</span>
            <span className={styles.pagerText}>
              <span className={styles.pagerHint}>Previous</span>
              <span className={styles.pagerName}>
                {formatNumber(prevId)} {nameOf(prevId)}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {hasNav && (
          <span className={styles.position}>
            {index + 1} / {sequence.length}
          </span>
        )}

        {nextId !== null ? (
          <Link to={`/pokemon/${nextId}`} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
            <span className={styles.pagerText}>
              <span className={styles.pagerHint}>Next</span>
              <span className={styles.pagerName}>
                {formatNumber(nextId)} {nameOf(nextId)}
              </span>
            </span>
            <span className={styles.arrow} aria-hidden="true">▶</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <img
            src={current.artwork}
            alt={`Official artwork of ${formatName(current.name)}`}
            className={styles.art}
            width={475}
            height={475}
          />
        </figure>

        <div className={styles.info}>
          <p className={styles.number}>{formatNumber(current.id)}</p>
          <h1 className={styles.name}>{formatName(current.name)}</h1>
          <div className={styles.types}>
            {current.types.map((t) => (
              <TypeTag key={t} type={t} />
            ))}
          </div>

          <dl className={styles.facts}>
            <div>
              <dt>Height</dt>
              <dd>{formatHeight(current.height)}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{formatWeight(current.weight)}</dd>
            </div>
            <div>
              <dt>Base experience</dt>
              <dd>{current.baseExperience} XP</dd>
            </div>
            <div>
              <dt>Abilities</dt>
              <dd>{current.abilities.map(formatName).join(', ')}</dd>
            </div>
          </dl>

          <h2 className={styles.subheading}>Base stats</h2>
          <ul className={styles.stats}>
            {current.stats.map((s) => (
              <li key={s.name} className={styles.stat}>
                <span className={styles.statName}>{STAT_LABELS[s.name] ?? formatName(s.name)}</span>
                <span className={styles.statValue}>{s.value}</span>
                <progress
                  className={styles.bar}
                  max={MAX_STAT}
                  value={s.value}
                  aria-label={`${STAT_LABELS[s.name] ?? s.name} ${s.value} of ${MAX_STAT}`}
                />
              </li>
            ))}
            <li className={`${styles.stat} ${styles.total}`}>
              <span className={styles.statName}>Total</span>
              <span className={styles.statValue}>{total}</span>
            </li>
          </ul>
        </div>
      </div>

      <p className={styles.back}>
        <Link to="/">Back to search</Link> or <Link to="/gallery">browse the gallery</Link>
      </p>
    </article>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.message} role="alert">
      <h1 className={styles.messageTitle}>{title}</h1>
      <p>{body}</p>
      <p>
        <Link to="/">Search all 151 Pokémon</Link>
      </p>
    </div>
  );
}
