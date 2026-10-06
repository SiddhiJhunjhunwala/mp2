import { usePokemon } from '../context/usePokemon';
import styles from './StatusPanel.module.css';

/** Renders loading/error states. Returns null once data is ready. */
export default function StatusPanel() {
  const { status, error, retry } = usePokemon();

  if (status === 'loading') {
    return (
      <div className={styles.panel} role="status">
        <p className={styles.title}>Loading Pokémon…</p>
        <p>Fetching all 151 entries from PokéAPI. This only happens once per visit.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.panel} role="alert">
        <p className={styles.title}>Pokémon didn’t load</p>
        <p>{error}</p>
        <button type="button" className={styles.button} onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return null;
}
