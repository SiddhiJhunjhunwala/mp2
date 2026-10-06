import { Link, NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          Pokédex <span className={styles.brandNum}>151</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/" end className={navClass}>
            Search
          </NavLink>
          <NavLink to="/gallery" className={navClass}>
            Gallery
          </NavLink>
        </nav>
      </header>

      <div className={styles.bezel}>
        <main className={styles.screen}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.footer}>
        Data from <a href="https://pokeapi.co/">PokéAPI</a>. Pokémon and Pokémon character names
        are trademarks of Nintendo.
      </footer>
    </div>
  );
}
