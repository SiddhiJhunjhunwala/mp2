import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Page not found</h1>
      <p>This route doesn’t exist.</p>
      <p>
        <Link to="/" className={styles.link}>
          Go to search
        </Link>
      </p>
    </div>
  );
}
